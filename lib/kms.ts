import { Construct, CfnOutput } from '@aws-cdk/core';

import { Key, KeyProps, IKey } from '@aws-cdk/aws-kms';
import {
  PolicyDocument,
  PolicyStatement,
  Effect,
  AccountRootPrincipal
} from '@aws-cdk/aws-iam';

export class KMSKey extends Key {
  constructor(scope: Construct, id: string) {
    // create a CMK KMS Key for Our Key
    const cmkKeyProps: KeyProps = {
      description:
        'Custom Master Key for Server-Side Encryption for SNS and SQS',
      policy: new PolicyDocument({
        assignSids: true,
        statements: [
          new PolicyStatement({
            actions: ['kms:*'],
            effect: Effect.ALLOW,
            resources: ['*'],
            principals: [new AccountRootPrincipal()] // Enable IAM User Permissions
          })
        ]
      })
    };

    super(scope, id, cmkKeyProps);

    // OPTIONAL: Export the ARN for use by other stacks
    new CfnOutput(this, 'newUserCreatedKMSKeyArn', {
      value: this.keyArn,
      description: 'SNS and SQS SSE KMS Custom Master Key Arn',
      exportName: 'newUserCreatedKMSKeyArn'
    });
  }
}
