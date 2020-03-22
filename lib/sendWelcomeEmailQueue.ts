import { CfnOutput, Construct, Duration, Aws } from '@aws-cdk/core';

import { Key } from '@aws-cdk/aws-kms';
import { Queue, QueueProps, QueuePolicy } from '@aws-cdk/aws-sqs';
import {
  PolicyStatement,
  Effect,
  AnyPrincipal,
  ServicePrincipal
} from '@aws-cdk/aws-iam';
import { Topic } from '@aws-cdk/aws-sns';

export interface SendWelcomeWelcomeProps {
  // KMS Customer Master Key for Server Side Encryption
  key: Key;
  // SNS Topic to Subscribe this Queue to
  topic: Topic;
}

export class SendWelcomeEmailQueue extends Queue {
  // After 5 retries, messages will be sent to our dead letter queue
  public deadLetterQueue: Queue;

  constructor(
    scope: Construct,
    id: string,
    sendWelcomeProps: SendWelcomeWelcomeProps
  ) {
    // dead letter queue
    const queueDlQProps: QueueProps = {
      queueName: 'sendWelcomeEmailDeadLetterQueue',
      encryptionMasterKey: sendWelcomeProps.key,
      retentionPeriod: Duration.days(14)
    };
    const deadLetterQueue = new Queue(
      scope,
      'sendWelcomeEmailDeadLetterQueue',
      queueDlQProps
    );

    // normal queue
    const queueProps: QueueProps = {
      queueName: 'sendWelcomeEmail',
      encryptionMasterKey: sendWelcomeProps.key,
      retentionPeriod: Duration.days(14), // maximum numbers of days
      deadLetterQueue: {
        maxReceiveCount: 5, // send to the dead letter queue after 5 retries
        queue: deadLetterQueue
      }
    };
    super(scope, id, queueProps);

    // to avoid the cyclic resource dependencies, use a separate policy to give
    // permission for SNS Topic permission to this queue.
    const policy = new QueuePolicy(this, 'sendWelcomeEmailQueuePolicy', {
      queues: [this]
    });

    policy.document.addStatements(
      new PolicyStatement({
        principals: [new AnyPrincipal()],
        effect: Effect.ALLOW,
        actions: ['SQS:SendMessage'],
        conditions: {
          ArnEquals: {
            'aws:SourceArn': sendWelcomeProps.topic.topicArn
          }
        }
      })
    );

    sendWelcomeProps.key.grantDecrypt(
      new ServicePrincipal('sqs.amazonaws.com', {
        conditions: {
          ArnEquals: {
            'aws:SourceArn': `arn:aws:sqs:${Aws.REGION}:${Aws.ACCOUNT_ID}:sendWelcomeEmail`
          }
        }
      })
    );

    this.deadLetterQueue = deadLetterQueue;

    // OPTIONAL: Export the ARN for use by other stacks
    new CfnOutput(this, 'sendWelcomeEmailArn', {
      value: this.queueArn,
      description: 'Send Welcome Email to Users Queue',
      exportName: 'sendWelcomeEmailArn'
    });
    new CfnOutput(this, 'sendWelcomeEmailDeadLetterQueueArn', {
      value: this.deadLetterQueue.queueArn,
      description: 'Send Welcome Email to Users Dead Letter Queue',
      exportName: 'sendWelcomeEmailDeadLetterQueueArn'
    });
  }
}
