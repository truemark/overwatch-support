import * as logging from '@nr1e/logging';
import {EventBridgeEvent, EventBridgeHandler} from 'aws-lambda';
import {
  SSMClient,
  SendCommandCommand,
  DescribeInstanceInformationCommand,
} from '@aws-sdk/client-ssm';

const log = logging.initialize({
  svc: 'uninstall-tag-handler',
  level: 'trace',
});

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 30000;

async function isInstanceSSMReachable(
  ssmClient: SSMClient,
  instanceId: string,
): Promise<boolean> {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const response = await ssmClient.send(
        new DescribeInstanceInformationCommand({
          Filters: [
            {
              Key: 'InstanceIds',
              Values: [instanceId],
            },
          ],
        }),
      );

      const instanceInfo = response.InstanceInformationList?.[0];

      if (instanceInfo?.PingStatus === 'Online') {
        log
          .debug()
          .str('instanceId', instanceId)
          .msg(`Instance is reachable via SSM`);
        return true;
      }

      log
        .debug()
        .str('instanceId', instanceId)
        .str('pingStatus', instanceInfo?.PingStatus ?? 'Unknown')
        .msg(`Instance not reachable. Retrying...`);
    } catch (error) {
      log
        .warn()
        .err(error)
        .str('instanceId', instanceId)
        .msg(`Failed checking instance status`);
    }

    retries++;
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  }

  return false;
}

interface CloudTrailDetail {
  eventName?: string;
  requestParameters?: {
    resourcesSet?: {
      items: Array<{resourceId: string}>;
    };
    tagSet?: {
      items: Array<{key: string; value?: string}>;
    };
  };
}

/** Extract instance ID from CloudTrail events */
function extractInstanceId(
  event: EventBridgeEvent<string, CloudTrailDetail>,
): string | null {
  if (event.source === 'aws.ec2' && event.detail.eventName === 'DeleteTags') {
    const resourceId =
      event.detail.requestParameters?.resourcesSet?.items?.[0]?.resourceId;
    if (resourceId?.startsWith('i-')) {
      return resourceId;
    }
  }

  return null;
}

/** Get the removed tag value from CloudTrail events */
function getRemovedTagValue(
  event: EventBridgeEvent<string, CloudTrailDetail>,
): string | null {
  if (event.source === 'aws.ec2' && event.detail.eventName === 'DeleteTags') {
    const removedTags = event.detail.requestParameters?.tagSet?.items || [];
    const overwatchTag = removedTags.find(
      (tag) => tag.key === 'overwatch:install',
    );
    return overwatchTag?.value || null;
  }
  return null;
}

function uninstallDocsFor(tagValue: string): string[] {
  const v = tagValue.trim().toLowerCase();
  const docs: string[] = [];
  if (v === 'all') {
    docs.push('UninstallNodeExporter', 'UninstallFluentBit');
  } else {
    if (v.includes('cloudwatch-agent')) docs.push('UninstallCloudWatchAgent');
    if (v.includes('node-exporter')) docs.push('UninstallNodeExporter');
    if (v.includes('fluent-bit')) docs.push('UninstallFluentBit');
  }
  return docs;
}

/** Handle tag removal */
async function handleTagRemoval(
  ssmClient: SSMClient,
  instanceId: string,
  removedTagValue: string | null,
): Promise<void> {
  const uninstallDocs = removedTagValue
    ? uninstallDocsFor(removedTagValue)
    : uninstallDocsFor('all');

  for (const commandName of uninstallDocs) {
    const command = new SendCommandCommand({
      DocumentName: commandName,
      InstanceIds: [instanceId],
    });

    try {
      const response = await ssmClient.send(command);
      log
        .trace()
        .obj('response', response)
        .str('command', commandName)
        .str('removedTagValue', removedTagValue || 'unknown')
        .msg(`Uninstall SSM command sent successfully`);
    } catch (error) {
      log
        .error()
        .err(error)
        .str('command', commandName)
        .msg(`Failed to send uninstall SSM command`);
    }
  }
}

export const handler: EventBridgeHandler<
  string,
  CloudTrailDetail,
  void
> = async (event: EventBridgeEvent<string, CloudTrailDetail>) => {
  log.trace().obj('event', event).msg('Received uninstallation event');

  const instanceId = extractInstanceId(event);
  if (!instanceId) {
    log.error().msg('Failed to extract instance ID from CloudTrail event');
    return;
  }

  log
    .debug()
    .str('instanceId', instanceId)
    .str('eventSource', event.source)
    .msg('Processing uninstallation event');

  try {
    const ssmClient = new SSMClient({region: process.env.AWS_DEFAULT_REGION});

    if (!(await isInstanceSSMReachable(ssmClient, instanceId))) {
      log
        .error()
        .str('instanceId', instanceId)
        .num('retries', MAX_RETRIES)
        .num('retryDelayMs', RETRY_DELAY_MS)
        .msg(`Instance is not reachable after retries`);
      return;
    }

    // Only process CloudTrail DeleteTags events
    if (event.source === 'aws.ec2' && event.detail.eventName === 'DeleteTags') {
      const removedTagValue = getRemovedTagValue(event);
      log
        .debug()
        .str('removedTagValue', removedTagValue || 'unknown')
        .msg('Processing CloudTrail tag deletion');

      await handleTagRemoval(ssmClient, instanceId, removedTagValue);
      return;
    }

    log
      .warn()
      .str('eventSource', event.source)
      .msg('Unhandled event source for uninstallation');
  } catch (error) {
    log
      .error()
      .err(error)
      .str('instanceId', instanceId)
      .msg('Failed to process uninstallation event');
  }
};
