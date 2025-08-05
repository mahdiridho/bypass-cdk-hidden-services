#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BypassCdkHiddenServices } from '../lib/index';

const app = new cdk.App();

new BypassCdkHiddenServices(app, `bypass-cdk-hidden-services-poc`, {
  account: <ACCOUNT>,
  region: <REGION>,
  environment: {
    LAMBDA_FUNCTION1_NAME: <LAMBDA_FUNCTION1_NAME>,
    LAMBDA_FUNCTION2_NAME: <LAMBDA_FUNCTION2_NAME>,
    LAMBDA_FUNCTION3_NAME: <LAMBDA_FUNCTION3_NAME>,
    CW_LOG_RETENTION_IN_DAYS: 5,
    EXISTING_S3_BUCKET_NAME: <EXISTING_S3_BUCKET_NAME>,
    PREFIX_PATH1: <PREFIX_PATH1>,
    PREFIX_PATH2: <PREFIX_PATH2>,
    S3_LIFETIME: 30
  }
});