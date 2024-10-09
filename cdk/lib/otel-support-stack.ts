import {ExtendedStack, ExtendedStackProps} from 'truemark-cdk-lib/aws-cdk';
import {Construct} from 'constructs';
import {App} from 'aws-cdk-lib';
import {OtelSupportConstruct} from './otel-support-construct';

export interface OtelSupportStackProps extends ExtendedStackProps {
  readonly ecsPrometheusWriteEndpoint: string;
  readonly applicationPrometheusWriteEndpoint: string;
  readonly environmentName: string;
}

export class OtelSupportStack extends ExtendedStack {
  constructor(scope: Construct, id: string, props: OtelSupportStackProps) {
    super(scope, id, props);
    new OtelSupportConstruct(this, 'OtelSupportConstruct', {
      applicationPrometheusWriteEndpoint:
        props.applicationPrometheusWriteEndpoint,
      ecsPrometheusWriteEndpoint: props.ecsPrometheusWriteEndpoint,
      environmentName: props.environmentName,
    });
  }

  static propsFromContext(app: App): OtelSupportStackProps {
    return {
      ecsPrometheusWriteEndpoint: app.node.tryGetContext(
        'ecsPrometheusWriteEndpoint'
      ),
      applicationPrometheusWriteEndpoint: app.node.tryGetContext(
        'ecsPrometheusWriteEndpoint'
      ),
      environmentName: app.node.tryGetContext('environmentName'),
    };
  }

  static fromContext(app: App, id: string): OtelSupportStack {
    return new OtelSupportStack(
      app,
      id,
      OtelSupportStack.propsFromContext(app)
    );
  }
}
