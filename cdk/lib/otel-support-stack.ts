import {ExtendedStack, ExtendedStackProps} from 'truemark-cdk-lib/aws-cdk';
import {Construct} from 'constructs';
import {App} from 'aws-cdk-lib';
import {OtelSupportConstruct} from './otel-support-construct';

export interface OtelSupportStackProps extends ExtendedStackProps {
  readonly ecsPrometheusWriteEndpoint: string;
  readonly applicationPrometheusWriteEndpoint: string;
  readonly environmentName: string;
  readonly serviceName: string;
  readonly clusterName: string;
  readonly ecsApplicationLogGroup: string;
  readonly ecsApplicationLogsNamespace: string;
}

export class OtelSupportStack extends ExtendedStack {
  constructor(scope: Construct, id: string, props: OtelSupportStackProps) {
    super(scope, id, props);
    new OtelSupportConstruct(this, 'OtelSupportConstruct', {
      applicationPrometheusWriteEndpoint:
        props.applicationPrometheusWriteEndpoint,
      ecsPrometheusWriteEndpoint: props.ecsPrometheusWriteEndpoint,
      environmentName: props.environmentName,
      serviceName: props.serviceName,
      clusterName: props.clusterName,
      ecsApplicationLogsNamespace: props.ecsApplicationLogsNamespace,
      ecsApplicationLogGroup: props.ecsApplicationLogGroup,
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
      serviceName: app.node.tryGetContext('serviceName'),
      clusterName: app.node.tryGetContext('clusterName'),
      ecsApplicationLogsNamespace: app.node.tryGetContext(
        'ecsApplicationLogsNamespace'
      ),
      ecsApplicationLogGroup: app.node.tryGetContext('ecsApplicationLogGroup'),
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
