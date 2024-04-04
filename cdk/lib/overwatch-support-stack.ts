import {ExtendedStack, ExtendedStackProps} from 'truemark-cdk-lib/aws-cdk';
import {Construct} from 'constructs';
import {OverwatchSupportConstruct} from './overwatch-support-construct';

export class OverwatchSupportStack extends ExtendedStack {
  constructor(scope: Construct, id: string, props: ExtendedStackProps) {
    super(scope, id, props);
    new OverwatchSupportConstruct(this, 'Overwatch');
  }
}
