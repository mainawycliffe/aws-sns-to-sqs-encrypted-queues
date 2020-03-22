import { CfnOutput, Construct, Duration } from '@aws-cdk/core';

import { Key } from '@aws-cdk/aws-kms';
import { Queue, QueueProps, QueuePolicy } from '@aws-cdk/aws-sqs';
import {
  PolicyStatement,
  Effect,
  AnyPrincipal,
  ServicePrincipal
} from '@aws-cdk/aws-iam';
import { Topic } from '@aws-cdk/aws-sns';

export class SendWelcomeEmailQueue extends Queue {
  // After 5 retries, messages will be sent to our dead letter queue
  public deadLetterQueue: Queue;

  constructor(
    scope: Construct,
    id: string,
    kmsMasterKey: Key,
    snsTopic: Topic
  ) {
    // dead letter queue
    const queueDlQProps: QueueProps = {
      queueName: 'sendWelcomeEmailDeadLetterQueue',
      encryptionMasterKey: kmsMasterKey,
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
      encryptionMasterKey: kmsMasterKey,
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
            'aws:SourceArn': snsTopic.topicArn
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
