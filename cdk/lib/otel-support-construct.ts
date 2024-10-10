import {Construct} from 'constructs';
import {ParameterTier, StringParameter} from 'aws-cdk-lib/aws-ssm';
import {getOtelCollectorConfig} from './otel-collector-config-reader';
import {Stack} from 'aws-cdk-lib';

export interface OtelSupportConstructProps {
  readonly applicationPrometheusWriteEndpoint: string;
  readonly ecsPrometheusWriteEndpoint: string;
  readonly environmentName: string;
  readonly serviceName: string;
  readonly clusterName: string;
  readonly ecsApplicationLogGroup: string;
  readonly ecsApplicationLogsNamespace: string;
  readonly ecsContainerInsightsLogGroup?: string;
}
export class OtelSupportConstruct extends Construct {
  constructor(scope: Construct, id: string, props: OtelSupportConstructProps) {
    super(scope, id);

    const region = Stack.of(this).region;
    const configContent = getOtelCollectorConfig({
      applicationPrometheusWriteEndpoint:
        props.applicationPrometheusWriteEndpoint,
      ecsPrometheusWriteEndpoint: props.ecsPrometheusWriteEndpoint,
      environmentName: props.environmentName,
      serviceName: props.serviceName,
      clusterName: props.clusterName,
      ecsApplicationLogsNamespace: props.ecsApplicationLogsNamespace,
      ecsApplicationLogGroup: props.ecsApplicationLogGroup,
    });
    new StringParameter(
      this,
      `OtelConfigParameter-${region}-${props.environmentName}`,
      {
        parameterName: `/${props.serviceName}/${props.environmentName}/otel/config`,
        stringValue: configContent,
        description: `OpenTelemetry configuration for ${props.environmentName} environment`,
        tier: ParameterTier.ADVANCED,
      }
    );
  }
}
