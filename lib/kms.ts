import { Construct, CfnOutput } from '@aws-cdk/core';

import { Key, KeyProps, IKey } from '@aws-cdk/aws-kms';
import {
  PolicyDocument,
  PolicyStatement,
  Effect,
  AccountRootPrincipal
} from '@aws-cdk/aws-iam';

export class KMSKey extends Key {
  public kmsKey: IKey;

  constructor(scope: Construct, id: string) {
    super(scope, id);

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
    const cmk = new Key(this, 'SNS_SQS_CMK', cmkKeyProps);

    // OPTIONAL: Export the ARN for use by other stacks
    new CfnOutput(this, 'SNS_SQS_CMK_ARN', {
      value: cmk.keyArn,
      description: 'SNS and SQS SSE KMS Custom Master Key Arn',
      exportName: 'SNS_SQS_CMK_ARN'
    });

    this.kmsKey = cmk;
  }
}
