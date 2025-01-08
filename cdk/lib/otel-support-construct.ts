import {Construct} from 'constructs';
import {ParameterTier, StringParameter} from 'aws-cdk-lib/aws-ssm';
import {getOtelCollectorConfig} from './otel-collector-config-reader';
import {
  ExtendedConstruct,
  ExtendedConstructProps,
} from 'truemark-cdk-lib/aws-cdk';

export interface OtelSupportConstructProps extends ExtendedConstructProps {
  readonly parameterName: string;
  readonly parameterDescription: string;
}
export class OtelSupportConstruct extends ExtendedConstruct {
  constructor(scope: Construct, id: string, props: OtelSupportConstructProps) {
    super(scope, id);

    const configContent = getOtelCollectorConfig();
    new StringParameter(this, 'OtelConfigParameter', {
      parameterName: props.parameterName,
      stringValue: configContent,
      description: props.parameterDescription,
      tier: ParameterTier.ADVANCED,
    });
  }
}
