import { Construct, Aws, CfnOutput, RemovalPolicy } from '@aws-cdk/core';

import {
  Function,
  FunctionProps,
  Code,
  Runtime,
  EventSourceMapping
} from '@aws-cdk/aws-lambda';
import { Queue } from '@aws-cdk/aws-sqs';
import {
  ServicePrincipal,
  ArnPrincipal,
  PolicyStatement,
  Effect
} from '@aws-cdk/aws-iam';
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
      code: Code.fromAsset('src'),
      initialPolicy: [
        // Allow the SendWelcomeEmail and SendWelcomeEmailDeadLetterQueue Queues
        // to invoke this function.
        new PolicyStatement({
          actions: [
            'sqs:ReceiveMessage',
            'sqs:DeleteMessage',
            'sqs:GetQueueAttributes',
            'sqs:ChangeMessageVisibility'
          ],
          effect: Effect.ALLOW,
          resources: [
            `arn:aws:sqs:${Aws.REGION}:${Aws.ACCOUNT_ID}:sendWelcomeEmail`,
            `arn:aws:sqs:${Aws.REGION}:${Aws.ACCOUNT_ID}:sendWelcomeEmailDeadLetterQueue`
          ]
        }),
        // Allow this function to decrypt SSE SQS Messages
        new PolicyStatement({
          actions: ['kms:Decrypt'],
          effect: Effect.ALLOW,
          resources: [sendWelcomeEmailFunctionProps.key.keyArn]
        })
      ]
    };
    super(scope, id, functionProps);

    // Trigger this lambda each time a queue is published
    this.addEventSource(
      new SqsEventSource(sendWelcomeEmailFunctionProps.queue, {
        batchSize: 1
      })
    );

    // Add a disabled EventSourceMapping for the Dead Letter Queue. It allows
    // for the messages in the Dead Letter Queue to be processed by simply
    // enabling it.
    new EventSourceMapping(this, 'SendWelcomeEmailDLQMapping', {
      eventSourceArn: `arn:aws:sqs:${Aws.REGION}:${Aws.ACCOUNT_ID}:sendWelcomeEmailDeadLetterQueue`,
      target: this,
      enabled: false
    });

    new CfnOutput(this, 'sendWelcomeEmailFunctionArn', {
      value: this.functionArn,
      description:
        'Aws Lambda for Sending Welcome Emails when new User is Created',
      exportName: 'sendWelcomeEmailFunctionArn'
    });
  }
}
