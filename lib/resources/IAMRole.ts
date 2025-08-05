import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { BypassCdkHiddenServicesProps } from '../interfaces/stackProps';

export function createLambdaRole(scope: Construct, props: BypassCdkHiddenServicesProps): iam.Role {
  // Create IAM Role for Lambda
  const lambdaRole = new iam.Role(scope, 'LambdaExecutionRole', {
    roleName: `lambda-execution-role-poc`,
    assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    description: 'IAM Role for Lambda functions with basic policies and S3 permissions',
    managedPolicies: [
      // Basic Lambda execution policy
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      // X-Ray tracing policy (since tracing is enabled)
      iam.ManagedPolicy.fromAwsManagedPolicyName('AWSXRayDaemonWriteAccess'),
    ],
    inlinePolicies: {
      // S3 permissions for putting objects
      S3PutObjectPolicy: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              's3:PutObject',
              's3:PutObjectAcl',
              's3:PutObjectVersionAcl'
            ],
            resources: [
              `arn:aws:s3:::${props.environment.EXISTING_S3_BUCKET_NAME}/*`
            ]
          })
        ]
      }),
      // Additional CloudWatch Logs permissions
      CloudWatchLogsPolicy: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              'logs:CreateLogGroup',
              'logs:CreateLogStream',
              'logs:PutLogEvents',
              'logs:DescribeLogGroups',
              'logs:DescribeLogStreams',
              // Log retention management permissions
              'logs:PutRetentionPolicy',
              'logs:DeleteRetentionPolicy',
              'logs:DescribeLogGroups',
              'logs:ListTagsLogGroup',
              'logs:TagLogGroup',
              'logs:UntagLogGroup'
            ],
            resources: [
              `arn:aws:logs:${props.region}:${props.account}:log-group:/aws/lambda/*`,
              `arn:aws:logs:${props.region}:${props.account}:log-group:/aws/lambda/*:log-stream:*`
            ]
          })
        ]
      })
    }
  });

  return lambdaRole;
}