import {ExtendedStack, ExtendedStackProps} from 'truemark-cdk-lib/aws-cdk';
import {Construct} from 'constructs';
import {App} from 'aws-cdk-lib';
import {OtelSupportConstruct} from './otel-support-construct';

export interface OtelSupportStackProps extends ExtendedStackProps {
  readonly parameterName: string;
  readonly parameterDescription: string;
  readonly region: string;
  readonly ampWorkSpaceId?: string;
}

export class OtelSupportStack extends ExtendedStack {
  constructor(scope: Construct, id: string, props: OtelSupportStackProps) {
    super(scope, id, props);
    let prometheusEndpoint;
    if (props.ampWorkSpaceId) {
      prometheusEndpoint = `https://aps-workspaces.${props.region}.amazonaws.com/workspaces/${props.ampWorkSpaceId}/api/v1/remote_write`;
    }
    new OtelSupportConstruct(this, 'OtelSupportConstruct', {
      parameterName: props.parameterName,
      parameterDescription: props.parameterDescription,
      region: props.region,
      prometheusEndpoint,
    });
  }

  static fromContext(app: App, id: string): OtelSupportStack {
    const ampWorkSpaceId = app.node.tryGetContext('ampWorkSpaceId');
    if (!ampWorkSpaceId) {
      throw new Error('ampWorkSpaceId is required in context for OTEL Support');
    }
    return new OtelSupportStack(app, id, {
      parameterName: '/app/global/otel-config',
      parameterDescription: 'Global OpenTelemetry configuration',
      region: app.node.tryGetContext('primaryRegion'),
      ampWorkSpaceId,
    });
  }
}
