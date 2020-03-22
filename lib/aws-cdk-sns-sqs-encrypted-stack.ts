import { Stack, StackProps, Construct, Aws } from '@aws-cdk/core';

import { KMSKey } from './customMasterKey';
import { NewUserCreatedTopic } from './newUserCreatedSNSTopic';
import { SendWelcomeEmailQueue } from './sendWelcomeEmailQueue';
import { SqsSubscription } from '@aws-cdk/aws-sns-subscriptions';
import {
  Subscription,
  SubscriptionProps,
  SubscriptionProtocol
} from '@aws-cdk/aws-sns';
import { sendWelcomeEmailFunction } from './sendWelcomeEmailLambda';

export class AwsCdkSnsSqsEncryptedStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // this will create a KMS Custom Master Key that will enable Server Side
    // Encryption (SSE) for both SQS and SNS.
    const key = new KMSKey(this, 'newUserCreatedKMSEncryptionKey');

    // create an sns topic for when new users are created
    // an sqs topic an be subscribed to by multiple subscribers
    // in our case, when a new user is created, we publish a message and one
    // queue just send welcomes email.
    const topic = new NewUserCreatedTopic(this, 'newUserCreatedSNSTopic', key);

    // create an sqs queue and a dead letter for it. if messages aren't
    // delivered in five retries, then they are sent to our dead letter queue.
    const queue = new SendWelcomeEmailQueue(this, 'sendWelcomeEmailQueues', {
      key: key,
      topic: topic
    });
    const subscriptionProps: SubscriptionProps = {
      topic: topic,
      protocol: SubscriptionProtocol.SQS,
      endpoint: queue.queueArn
    };
    new Subscription(
      queue,
      'sendWelcomeEmailQueueSubscription',
      subscriptionProps
    );

    new sendWelcomeEmailFunction(this, 'SendWelcomeEmailFunction', {
      key: key,
      queue: queue
    });
  }
}
