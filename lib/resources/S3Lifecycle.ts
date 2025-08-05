import * as cr from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

export interface S3LifecycleProps {
  bucketName: string;
  prefix: string;
  expirationDays: number;
}

/**
 * Simple S3 construct to update lifecycle policy for existing bucket with specific prefix
 */
export class S3Lifecycle extends Construct {
  constructor(scope: Construct, id: string, props: S3LifecycleProps) {
    super(scope, id);

    const { bucketName, prefix, expirationDays } = props;

    // Create lifecycle rule
    const lifecycleRule = {
      Id: `lifecycle-${prefix.replace(/[^a-zA-Z0-9]/g, '-')}`,
      Status: 'Enabled',
      Filter: {
        Prefix: prefix
      },
      Expiration: {
        Days: expirationDays
      }
    };

    // Apply lifecycle policy to existing bucket
    new cr.AwsCustomResource(this, 'LifecyclePolicy', {
      onCreate: {
        service: 'S3',
        action: 'putBucketLifecycleConfiguration',
        parameters: {
          Bucket: bucketName,
          LifecycleConfiguration: {
            Rules: [lifecycleRule]
          }
        },
        physicalResourceId: cr.PhysicalResourceId.of(`lifecycle-${bucketName}-${prefix}`)
      },
      onUpdate: {
        service: 'S3',
        action: 'putBucketLifecycleConfiguration',
        parameters: {
          Bucket: bucketName,
          LifecycleConfiguration: {
            Rules: [lifecycleRule]
          }
        },
        physicalResourceId: cr.PhysicalResourceId.of(`lifecycle-${bucketName}-${prefix}`)
      },
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
        resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE
      })
    });
  }
}
