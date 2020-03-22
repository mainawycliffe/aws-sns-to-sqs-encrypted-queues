import * as AWS from 'aws-sdk';
import {} from 'aws-sdk/clients/lambda';

export function sendWelcomeEmail(event: any, context: any, callback: any) {
  console.log({ event, context, callback });
  console.log('I am ');
}
