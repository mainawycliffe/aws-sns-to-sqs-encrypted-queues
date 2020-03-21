import { Stack, StackProps, Construct, CfnOutput } from '@aws-cdk/core';

import { KMSKey } from './kms';
import { SNSTopic } from './topic';
import { SendWelcomeEmailQueue } from './sqs';
import { SqsSubscription } from '@aws-cdk/aws-sns-subscriptions';
import { ServicePrincipal } from '@aws-cdk/aws-iam';

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
    const topic = new SNSTopic(this, 'newUserCreatedSNSTopic', key);

    // create an sqs queue and a dead letter for it. if messages aren't
    // delivered in five retries, then they are sent to our dead letter queue.
    const sqs = new SendWelcomeEmailQueue(
      this,
      'sendWelcomeEmailQueues',
      key,
      topic
    );
    // create a CMK Key to be used by SNS
    const key = new KMSKey(this, 'createCMKKey');
    const topic = new SNSTopic(this, 'mySNSTopic');
  }
}
