#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsCdkSnsSqsEncryptedStack } from '../lib/aws-cdk-sns-sqs-encrypted-stack';

const app = new cdk.App();
new AwsCdkSnsSqsEncryptedStack(app, 'AwsCdkSnsSqsEncryptedStack');
