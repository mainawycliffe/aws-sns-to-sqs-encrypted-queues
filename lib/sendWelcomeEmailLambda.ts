import { Construct, Aws, CfnOutput, RemovalPolicy } from '@aws-cdk/core';

import { Function, FunctionProps, Code, Runtime } from '@aws-cdk/aws-lambda';
import { Queue } from '@aws-cdk/aws-sqs';
import { ServicePrincipal, ArnPrincipal } from '@aws-cdk/aws-iam';
import { Key } from '@aws-cdk/aws-kms';
import { SqsEventSource } from '@aws-cdk/aws-lambda-event-sources';

export interface SendWelcomeEmailFunctionProps {
  queue: Queue;
  key: Key;
}

export class sendWelcomeEmailFunction extends Function {
  constructor(
    scope: Construct,
    id: string,
    sendWelcomeEmailFunctionProps: SendWelcomeEmailFunctionProps
  ) {
    // Create a function for Sending emails triggered by SQS Queue
    const functionProps: FunctionProps = {
      runtime: Runtime.NODEJS_12_X,
      handler: 'sendWelcomeEmail.sendWelcomeEmail',
      code: Code.fromAsset('dist/src')
    };
    super(scope, id, functionProps);

    // Allow this lambda to decrypt messages on SQS Queue
    sendWelcomeEmailFunctionProps.key.grantDecrypt(
      new ServicePrincipal('lambda.amazonaws.com', {
        conditions: {
          ArnEquals: {
            'aws:SourceArn': `arn:aws:lambda:${Aws.REGION}:${Aws.ACCOUNT_ID}:${id}`
          }
        }
      })
    );

    // Allow SQS to Invoke this Lambda Function
    this.grantInvoke(
      new ServicePrincipal('sqs.amazonaws.com', {
        conditions: {
          ArnEquals: {
            'aws:SourceArn': `arn:aws:sqs:${Aws.REGION}:${Aws.ACCOUNT_ID}:sendWelcomeEmail`
          }
        }
      })
    );

    // Trigger this lambda each time a queue is published
    this.addEventSource(
      new SqsEventSource(sendWelcomeEmailFunctionProps.queue, {
        batchSize: 1
      })
    );

    new CfnOutput(this, 'sendWelcomeEmailFunctionArn', {
      value: this.functionArn,
      description:
        'Aws Lambda for Sending Welcome Emails when new User is Created',
      exportName: 'sendWelcomeEmailFunctionArn'
    });
  }
}
