import {Construct} from 'constructs';
import {ParameterTier, StringParameter} from 'aws-cdk-lib/aws-ssm';
import {getOtelCollectorConfig} from './otel-collector-config-reader';
import {Stack} from 'aws-cdk-lib';
import {
  ExtendedConstruct,
  ExtendedConstructProps,
} from 'truemark-cdk-lib/aws-cdk';

const otelConfigFilesMap: Record<string, string> = {
  ECS: 'ecs-otel-task-metrics-config.yaml',
  LAMBDA: 'lambda-otel-task-metrics-config.yaml',
};

export interface OtelSupportConstructProps extends ExtendedConstructProps {
  readonly parameterName: string;
  readonly parameterDescription: string;
  readonly prometheusEndpoint?: string;
}

export class OtelSupportConstruct extends ExtendedConstruct {
  constructor(scope: Construct, id: string, props: OtelSupportConstructProps) {
    super(scope, id);

    const stack = Stack.of(this);
    const region = stack.region;

    for (const [configType, configFileName] of Object.entries(
      otelConfigFilesMap
    )) {
      const configContent = getOtelCollectorConfig(
        configFileName,
        region,
        props.prometheusEndpoint
      );

      const parameterName =
        configType === 'ECS'
          ? props.parameterName
          : `${props.parameterName}/${configType.toLowerCase()}`;

      new StringParameter(this, `OtelConfigParameter${configType}`, {
        parameterName,
        stringValue: configContent,
        description: `${props.parameterDescription} - ${configType}`,
        tier: ParameterTier.ADVANCED,
      });
    }
  }
}
