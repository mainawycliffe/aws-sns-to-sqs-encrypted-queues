package main

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/mainawycliffe/aws-sns-to-sqs-encrypted-queue/src/users"
)

func sendWelcomeEmailHandler(ctx context.Context, sqsEvent events.SQSEvent) error {
	for _, message := range sqsEvent.Records {
		// this message is an SNS Record(SNSEntity), to get to the message, we need to
		// decode it and get the body
		snsMessage := events.SNSEntity{}
		err := json.Unmarshal([]byte(message.Body), &snsMessage)
		if err != nil {
			panic(err)
		}
		publishedMessage := User{}
		err = json.Unmarshal([]byte(snsMessage.Message), &publishedMessage)
		if err != nil {
			panic(err)
		}
		// send welcome email here
		fmt.Printf("Welcome email sent to: \t %s<%s> \n", publishedMessage.FullName, publishedMessage.Email)
	}
	return nil
}

func main() {
	lambda.Start(sendWelcomeEmailHandler)
}
