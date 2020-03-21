import { Stack, StackProps, Construct, CfnOutput } from '@aws-cdk/core';

import { KMSKey } from './kms';
import { SNSTopic } from './topic';

export class AwsCdkSnsSqsEncryptedStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // create a CMK Key to be used by SNS
    const key = new KMSKey(this, 'createCMKKey');
    const topic = new SNSTopic(this, 'mySNSTopic');
  }
}
