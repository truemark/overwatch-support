import {Construct} from 'constructs';
import {StringParameter} from 'aws-cdk-lib/aws-ssm';
import {getOtelCollectorConfig} from './otel-collector-config-reader';
import {Stack} from 'aws-cdk-lib';

export interface OtelSupportConstructProps {
  applicationPrometheusWriteEndpoint: string;
  ecsPrometheusWriteEndpoint: string;
  environmentName: string;
}
export class OtelSupportConstruct extends Construct {
  constructor(scope: Construct, id: string, props: OtelSupportConstructProps) {
    super(scope, id);

    const region = Stack.of(this).region;
    const configContent = getOtelCollectorConfig({
      applicationPrometheusWriteEndpoint:
        props.applicationPrometheusWriteEndpoint,
      ecsPrometheusWriteEndpoint: props.ecsPrometheusWriteEndpoint,
    });
    new StringParameter(
      this,
      `OtelConfigParameter-${region}-${props.environmentName}`,
      {
        parameterName: `/otel-support/${props.environmentName}/otel/config`,
        stringValue: configContent,
        description: `OpenTelemetry configuration for ${props.environmentName} environment`,
      }
    );
  }
}
