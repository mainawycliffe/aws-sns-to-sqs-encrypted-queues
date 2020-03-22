import { Construct, CfnOutput } from '@aws-cdk/core';

import { Topic, TopicProps } from '@aws-cdk/aws-sns';
import { Key } from '@aws-cdk/aws-kms';
import { ServicePrincipal } from '@aws-cdk/aws-iam';

export class NewUserCreatedTopic extends Topic {
  constructor(scope: Construct, id: string, kmsMasterKey: Key) {
    const topicProps: TopicProps = {
      displayName: 'newUserCreatedSNSTopic',
      masterKey: kmsMasterKey,
      topicName: 'newUserCreatedSNSTopic'
    };

    super(scope, id, topicProps);

    kmsMasterKey.grantEncryptDecrypt(
      new ServicePrincipal('sns.amazonaws.com', {
        // conditions: {
        //   ArnEquals: {
        //     'aws:SourceArn': `arn:aws:sns:${Aws.REGION}:${Aws.ACCOUNT_ID}:newUserCreatedSNSTopic`
        //   }
        // }
      })
    );

    // OPTIONAL: Export the ARN for use by other stacks
    new CfnOutput(this, 'newUserCreatedSNSTopicArm', {
      value: this.topicArn,
      description: 'New User Created SNS Topic Arn',
      exportName: 'newUserCreatedSNSTopicArm'
    });
  }
}
