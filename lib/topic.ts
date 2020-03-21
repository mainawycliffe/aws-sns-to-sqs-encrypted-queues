import { Construct, CfnOutput } from '@aws-cdk/core';

import { Topic, TopicProps } from '@aws-cdk/aws-sns';
import { Key } from '@aws-cdk/aws-kms';
import { ArnPrincipal } from '@aws-cdk/aws-iam';

export class SNSTopic extends Topic {
  constructor(scope: Construct, id: string, kmsMasterKey: Key) {
    const topicProps: TopicProps = {
      displayName: 'newUserCreatedSNSTopic',
      masterKey: kmsMasterKey,
      topicName: 'newUserCreatedSNSTopic'
    };

    super(scope, id, topicProps);

    // OPTIONAL: Export the ARN for use by other stacks
    new CfnOutput(this, 'newUserCreatedSNSTopicArm', {
      value: this.topicArn,
      description: 'New User Created SNS Topic Arn',
      exportName: 'newUserCreatedSNSTopicArm'
    });
  }
}
