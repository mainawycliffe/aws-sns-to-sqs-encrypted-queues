import { Construct, CfnOutput } from '@aws-cdk/core';

import { Topic, TopicProps } from '@aws-cdk/aws-sns';

export class SNSTopic extends Topic {
  public topic: Topic;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const topicProps: TopicProps = {
      displayName: 'SNSTopic'
    };

    // create a CMK Key to be used by SNS
    this.topic = new Topic(this, 'SomeTopicName', topicProps);

    // OPTIONAL: Export the ARN for use by other stacks
    new CfnOutput(this, 'SNS_SQS_CMK_ARN', {
      value: this.topic.topicArn,
      description: 'SNS and SQS SSE KMS Custom Master Key Arn',
      exportName: 'SNS_SQS_CMK_ARN'
    });
  }
}
