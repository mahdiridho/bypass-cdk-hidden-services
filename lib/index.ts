import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BypassCdkHiddenServicesProps } from './interfaces/stackProps';
import { createLambdaRole } from './resources/IAMRole';
import { createLambdaFunc1, createLambdaFunc2, createLambdaFunc3 } from './resources/Lambda';
import { S3Lifecycle } from './resources/S3Lifecycle';
import { CloudWatchLogsClient, PutRetentionPolicyCommand } from '@aws-sdk/client-cloudwatch-logs';
import { S3Client, PutBucketLifecycleConfigurationCommand, LifecycleRule } from '@aws-sdk/client-s3';

export class BypassCdkHiddenServices extends Stack {

  constructor(scope: Construct, id: string, props: BypassCdkHiddenServicesProps) {
    super(scope, id, props);
    const { region, environment } = props;

    // IAM: Lambda role
    const lambdaRole = createLambdaRole(this, props);
    
    // Lambda: Create offline module function
    createLambdaFunc1(this, props, lambdaRole);
    createLambdaFunc2(this, props, lambdaRole);
    const lambdaFunc3 = createLambdaFunc3(this, props, lambdaRole);

    // Configure CW Log Retention
    this.setupCWLogRetention(region, lambdaFunc3.logGroup.logGroupName, environment.CW_LOG_RETENTION_IN_DAYS);

    // Configure S3 Lifecycle Policy
    // this approach will produce both hidden lambda and iam role
    new S3Lifecycle(this, 'S3Lifecycle', {
      bucketName: environment.EXISTING_S3_BUCKET_NAME,
      prefix: environment.PREFIX_PATH1,
      expirationDays: environment.S3_LIFETIME
    });
    // this approach won't produce both hidden lambda and iam role
    this.setupS3Lifetime(region, environment.EXISTING_S3_BUCKET_NAME, environment.PREFIX_PATH2, environment.S3_LIFETIME);
  }

  private setupS3Lifetime(region: string, bucketName: string, prefix: string, expirationDays: number): void {
    const s3Client = new S3Client({ region });

    const lifecycleRule: LifecycleRule = {
      ID: `${prefix.replace('/', '-')}-lifecycle`,
      Status: 'Enabled',
      Filter: {
        Prefix: prefix,
      },
      Expiration: {
        Days: expirationDays,
      },
      AbortIncompleteMultipartUpload: {
        DaysAfterInitiation: 1,
      },
    };

    const command = new PutBucketLifecycleConfigurationCommand({
      Bucket: bucketName,
      LifecycleConfiguration: {
        Rules: [lifecycleRule],
      },
    });

    // Execute the command asynchronously but don't await in constructor
    s3Client.send(command)
      .then((response: any) => {
        console.log("Setup S3 lifetime response:", response);
      })
      .catch((error: any) => {
        console.error('Error configuring lifetime policy:', error);
      });
  }

  private setupCWLogRetention(region: string, logGroupName: string, retentionDays: number): void {
    const cloudWatchLogsClient = new CloudWatchLogsClient({ region });

    const command = new PutRetentionPolicyCommand({
      logGroupName: logGroupName,
      retentionInDays: retentionDays
    });
    
    cloudWatchLogsClient.send(command)
      .then((response: any) => {
        console.log("Setup CW Log Retention response:", response);
      })
      .catch((error: any) => {
        console.error('Error configuring CW Log Retention:', error);
      });
  }
}
