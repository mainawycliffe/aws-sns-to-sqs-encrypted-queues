package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/sns"
	"github.com/bxcodec/faker/v3"
	"github.com/mainawycliffe/aws-sns-to-sqs-encrypted-queue/src/users"
)

// Ideally, this is triggered by an event of new user created i.e sign up or
// something. For instance you can use AWS Congito Post Confirmation to do this.
func PublishNewUserCreatedMessage() (string, error) {
	topicArn := os.Getenv("NewUserTopicARN")
	// if topicArn is empty please fail
	if topicArn == "" {
		return "", errors.New("Topic arn environment variable not set")
	}
	awsSession := session.Must(session.NewSessionWithOptions(session.Options{}))
	snsService := sns.New(awsSession)
	message := users.User{}
	err := faker.FakeData(&message)
	if err != nil {
		return "", err
	}
	messageByte, err := json.Marshal(&message)
	if err != nil {
		return "", err
	}
	messageStr := string(messageByte)
	result, err := snsService.Publish(&sns.PublishInput{
		Message:  &messageStr,
		TopicArn: &topicArn,
	})
	if err != nil {
		return "", err
	}
	fmt.Println(*result.MessageId)
	return *result.MessageId, nil
}

func main() {
	lambda.Start(PublishNewUserCreatedMessage)
}
