import { StackProps } from 'aws-cdk-lib';

export interface BypassCdkHiddenServicesProps extends StackProps {
  account: string;
  region: string;
  environment: any;
}
