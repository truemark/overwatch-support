import * as logging from '@nr1e/logging';
import {
  SSMClient,
  DescribeInstanceInformationCommand,
} from '@aws-sdk/client-ssm';

const log = logging.initialize({
  svc: 'ssm-utils',
  level: 'trace',
});

export const MAX_RETRIES = 10;
export const RETRY_DELAY_MS = 30000; // 30 seconds

export async function isInstanceSSMReachable(
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
