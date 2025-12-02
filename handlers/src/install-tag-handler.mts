import * as logging from '@nr1e/logging';
import {EventBridgeEvent, EventBridgeHandler} from 'aws-lambda';
import {SSMClient, SendCommandCommand} from '@aws-sdk/client-ssm';
import {
  isInstanceSSMReachable,
  MAX_RETRIES,
  RETRY_DELAY_MS,
} from './utils/ssm.mjs';

const log = logging.initialize({
  svc: 'install-tag-handler',
  level: 'trace',
});

type SSMParameters = {[key: string]: string[]};

interface TagChangeDetail {
  tags: Record<string, string>;
}

function isTagChangeDetail(value: unknown): value is TagChangeDetail {
  return !!(
    (value as Partial<TagChangeDetail>).tags &&
    typeof (value as TagChangeDetail).tags === 'object'
  );
}

export const handler: EventBridgeHandler<string, string, void> = async (
  event: EventBridgeEvent<string, string>,
) => {
  log.trace().obj('event', event).msg('Received event');

  log.trace().obj('event.resources', event.resources).msg('Resources');
  if (
    isTagChangeDetail(event.detail) &&
    event.resources &&
    event.resources.length > 0
  ) {
    const instanceArn = event.resources[0];
    const instanceId = instanceArn.split('/').pop();
    if (!instanceId) {
      log.error().msg('Failed to extract instance ID');
      return;
    }

    log.trace().msg(`Extracted instance ID: ${instanceId}`);
    try {
      const ssmClient = new SSMClient({region: process.env.AWS_DEFAULT_REGION});

      if (await isInstanceSSMReachable(ssmClient, instanceId!)) {
        const tagValue = event.detail.tags['overwatch:install']
          ?.trim()
          .toLowerCase();

        if (typeof tagValue !== 'string') {
          log
            .warn()
            .msg("Required tag 'overwatch:install' is missing or not a string");
          return;
        }

        const commands: string[] = [];
        const documentParameters: {[key: string]: SSMParameters} = {};

        if (
          tagValue &&
          (tagValue === 'all' ||
            (tagValue.includes('node-exporter') &&
              tagValue.includes('fluent-bit')))
        ) {
          commands.push('InstallNodeExporter', 'InstallFluentBit');
        } else if (tagValue.includes('node-exporter')) {
          commands.push('InstallNodeExporter');
        } else if (tagValue.includes('fluent-bit')) {
          commands.push('InstallFluentBit');
        } else if (tagValue.includes('cloudwatch-agent')) {
          commands.push(
            'AWSEC2-ApplicationInsightsCloudwatchAgentInstallAndConfigure',
          );
          documentParameters[
            'AWSEC2-ApplicationInsightsCloudwatchAgentInstallAndConfigure'
          ] = {
            parameterStoreName: [
              '/overwatch/cloudwatch-config/Linux-ServiceConfig',
            ],
          };
        }

        for (const commandName of commands) {
          // Define commandParams with Parameters as an optional property
          const commandParams: {
            DocumentName: string;
            InstanceIds: string[];
            Parameters?: SSMParameters; // Making Parameters optional
          } = {
            DocumentName: commandName,
            InstanceIds: [instanceId],
          };

          if (documentParameters[commandName]) {
            commandParams.Parameters = documentParameters[commandName];
          }

          const command = new SendCommandCommand(commandParams);

          try {
            const response = await ssmClient.send(command);
            log
              .trace()
              .obj('response', response)
              .str('command', commandName)
              .msg(`SSM command sent successfully`);
          } catch (error) {
            log.error().msg(`Failed to send SSM command: `);
          }
        }
      } else {
        log
          .error()
          .str('instanceId', instanceId)
          .num('retries', MAX_RETRIES)
          .num('retryDelayMs', RETRY_DELAY_MS)
          .msg(`Instance is not reachable after retries`);
      }
    } catch (error) {
      log.error().err(error).msg('Failed to send SSM command');
    }
  } else {
    log.error().msg('No resources found in the event');
  }
};
