import {ExtendedNodejsFunction} from 'truemark-cdk-lib/aws-lambda';
import {Construct} from 'constructs';
import * as path from 'path';
import {Architecture} from 'aws-cdk-lib/aws-lambda';
import {Duration} from 'aws-cdk-lib';
import {StandardQueue} from 'truemark-cdk-lib/aws-sqs';
import {LambdaFunction} from 'aws-cdk-lib/aws-events-targets';
import {Rule} from 'aws-cdk-lib/aws-events';
import * as iam from 'aws-cdk-lib/aws-iam';

export class UnInstallTagFunction extends ExtendedNodejsFunction {
  constructor(scope: Construct, id: string) {
    const role = new iam.Role(scope, 'UninstallRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    role.addToPolicy(
      new iam.PolicyStatement({
        actions: ['ssm:SendCommand', 'ssm:DescribeInstanceInformation'],
        resources: ['*'],
      })
    );

    role.addToPolicy(
      new iam.PolicyStatement({
        actions: ['cloudtrail:LookupEvents'],
        resources: ['*'],
      })
    );

    role.addManagedPolicy({
      managedPolicyArn:
        'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
    });

    super(scope, id, {
      entry: path.join(
        __dirname,
        '..',
        '..',
        'handlers',
        'src',
        'uninstall-tag-handler.mts'
      ),
      architecture: Architecture.ARM_64,
      handler: 'handler',
      role: role,
      timeout: Duration.minutes(15),
      deploymentOptions: {
        createDeployment: false,
      },
      memorySize: 512,
      environment: {
        NODE_OPTIONS: '--enable-source-maps',
      },
    });

    const deadLetterQueue = new StandardQueue(this, 'UninstallDlq');
    const target = new LambdaFunction(this, {deadLetterQueue});

    // CloudTrail Rule for tag DELETIONS
    const deleteTagRule = new Rule(this, 'DeleteTagRule', {
      eventPattern: {
        source: ['aws.ec2'],
        detailType: ['AWS API Call via CloudTrail'],
        detail: {
          eventSource: ['ec2.amazonaws.com'],
          eventName: ['DeleteTags'],
        },
      },
      description:
        'Routes tag deletion events to the Overwatch Uninstall Tag Function',
    });
    deleteTagRule.addTarget(target);
  }
}
