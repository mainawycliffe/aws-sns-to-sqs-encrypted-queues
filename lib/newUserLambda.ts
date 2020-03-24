import { Construct, Aws, CfnOutput, RemovalPolicy } from '@aws-cdk/core';

import {
  Function,
  FunctionProps,
  Code,
  Runtime,
  EventSourceMapping
} from '@aws-cdk/aws-lambda';
import { PolicyStatement, Effect } from '@aws-cdk/aws-iam';
import { Key } from '@aws-cdk/aws-kms';
import { SqsEventSource } from '@aws-cdk/aws-lambda-event-sources';
import { Topic } from '@aws-cdk/aws-sns';

export interface NewUserFunctionProps {
  topic: Topic;
  key: Key;
}

export class newUserFunction extends Function {
  constructor(
    scope: Construct,
    id: string,
    newUserFunctionProps: NewUserFunctionProps
  ) {
    // Create a function for Sending emails triggered by SQS Queue
    const functionProps: FunctionProps = {
      runtime: Runtime.GO_1_X,
      handler: 'newUser',
      code: Code.fromAsset('goOut'),
      environment: {
        NewUserTopicARN: newUserFunctionProps.topic.topicArn
      },
      initialPolicy: [
        // Allow this function to publish to newUserCreatedSNSTopic
        new PolicyStatement({
          actions: ['sns:Publish'],
          effect: Effect.ALLOW,
          resources: [newUserFunctionProps.topic.topicArn]
        }),
        // Allow this function to decrypt and generate data key for SSE SNS Messages
        new PolicyStatement({
          actions: ['kms:Decrypt', 'kms:GenerateDataKey'],
          effect: Effect.ALLOW,
          resources: [newUserFunctionProps.key.keyArn]
        })
      ]
    };
    super(scope, id, functionProps);

    new CfnOutput(this, 'newUserFunctionArn', {
      value: this.functionArn,
      description: 'Aws Lambda for publishing new user info to SNS',
      exportName: 'newUserFunctionArn'
    });
  }
}
