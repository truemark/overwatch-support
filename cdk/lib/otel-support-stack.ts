import {ExtendedStack, ExtendedStackProps} from 'truemark-cdk-lib/aws-cdk';
import {Construct} from 'constructs';
import {App} from 'aws-cdk-lib';
import {OtelSupportConstruct} from './otel-support-construct';

export interface OtelSupportStackProps extends ExtendedStackProps {
  readonly parameterName: string;
  readonly parameterDescription: string;
}

export class OtelSupportStack extends ExtendedStack {
  constructor(scope: Construct, id: string, props: OtelSupportStackProps) {
    super(scope, id, props);
    new OtelSupportConstruct(this, 'OtelSupportConstruct', {
      parameterName: props.parameterName,
      parameterDescription: props.parameterDescription,
    });
  }

  static fromContext(app: App, id: string): OtelSupportStack {
    return new OtelSupportStack(app, id, {
      parameterName: '/app/global/otel-config',
      parameterDescription: 'Global OpenTelemetry configuration',
    });
  }
}
