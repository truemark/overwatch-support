import {Construct} from 'constructs';
import {StringParameter} from 'aws-cdk-lib/aws-ssm';
import {getOtelCollectorConfig} from './otel-collector-config-reader';
import {getSupportedOtelEnvironments} from './otel-environment-config-reader';

export interface OtelSsmParameterProps {
  region: string;
}

export class OtelSsmParameterConstruct extends Construct {
  constructor(scope: Construct, id: string, props: OtelSsmParameterProps) {
    super(scope, id);

    getSupportedOtelEnvironments(props.region).forEach(config => {
      const configContent = getOtelCollectorConfig({
        applicationPrometheusWriteEndpoint:
          config.applicationPrometheusWriteEndpoint,
        ecsPrometheusWriteEndpoint: config.ecsPrometheusWriteEndpoint,
      });
      if (config.enabled) {
        new StringParameter(
          this,
          `OtelConfigParameter-${props.region}-${config.environmentName}`,
          {
            parameterName: `/${config.projectName}/${config.environmentName}/otel/config`,
            stringValue: configContent,
            description: `OpenTelemetry configuration for ${config.environmentName} environment`,
          }
        );
      }
    });
  }
}
