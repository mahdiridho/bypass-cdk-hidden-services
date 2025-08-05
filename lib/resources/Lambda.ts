import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { IRole } from 'aws-cdk-lib/aws-iam';
import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';

// Get log retention from config
function getLogRetention(environment: any): RetentionDays {
  const retention = Number(environment.CW_LOG_RETENTION_IN_DAYS);
  return Object.values(RetentionDays).includes(retention)
    ? retention
    : RetentionDays.ONE_WEEK;
}

// it will produce hidden lambda + iam role for log retention policy
export function createLambdaFunc1(scope: Construct, props: any, lambdaRole: IRole) {
  const { environment } = props;

  const logRetention = getLogRetention(environment);

  return new NodejsFunction(scope, 'lambdaFunc1', {
    functionName: environment.LAMBDA_FUNCTION1_NAME,
    runtime: lambda.Runtime.NODEJS_22_X,
    architecture: lambda.Architecture.ARM_64,
    entry: './src/index.js',
    handler: 'handler',
    role: lambdaRole,
    tracing: lambda.Tracing.ACTIVE,
    timeout: Duration.seconds(30),
    memorySize: 1024,
    logRetention
  });
}

// it will produce hidden lambda for log retention policy but reuse existing iam role
export function createLambdaFunc2(scope: Construct, props: any, lambdaRole: IRole) {
  const { environment } = props;

  const logRetention = getLogRetention(environment);

  return new NodejsFunction(scope, 'lambdaFunc2', {
    functionName: environment.LAMBDA_FUNCTION2_NAME,
    runtime: lambda.Runtime.NODEJS_22_X,
    architecture: lambda.Architecture.ARM_64,
    entry: './src/index.js',
    handler: 'handler',
    role: lambdaRole,
    tracing: lambda.Tracing.ACTIVE,
    timeout: Duration.seconds(30),
    memorySize: 1024,
    logRetention,
    logRetentionRole: lambdaRole
  });
}

// it won't produce both hidden lambda and iam role
export function createLambdaFunc3(scope: Construct, props: any, lambdaRole: IRole) {
  const { environment } = props;

  return new NodejsFunction(scope, 'lambdaFunc3', {
    functionName: environment.LAMBDA_FUNCTION3_NAME,
    runtime: lambda.Runtime.NODEJS_22_X,
    architecture: lambda.Architecture.ARM_64,
    entry: './src/index.js',
    handler: 'handler',
    role: lambdaRole,
    tracing: lambda.Tracing.ACTIVE,
    timeout: Duration.seconds(30),
    memorySize: 1024
  });
}