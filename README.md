# CDK Hidden Services POC

This repository contains a Proof of Concept (POC) that demonstrates a reproducible issue in AWS CDK when setting up log retention policies and S3 lifecycle policies. The CDK Construct automatically produces hidden Lambda functions and IAM roles that can lead to resource accumulation issues in large-scale deployments.

## Problem Statement

When using CDK constructs that include:
- **Log Retention Policies**: Automatically creates hidden Lambda functions to manage CloudWatch log retention
- **S3 Lifecycle Policies**: Also triggers the creation of hidden Lambda functions for lifecycle management

While these hidden services are only invoked once during deployment, they create persistent resources that can accumulate over time.

## Impact on Large-Scale Deployments

In enterprise environments with multiple projects in the same AWS account, this can lead to:

- **IAM Role Limitations**: AWS accounts have a soft limit of 1,000 IAM roles per account
- **Resource Accumulation**: Hidden Lambda functions and their associated IAM roles remain as "zombie" resources
- **Management Overhead**: Difficulty in tracking and managing these automatically created resources

### Example Scenario

Consider a deployment with 500 main Lambda functions, each with custom log retention policies:
- **Visible Resources**: 500 main Lambda functions
- **Hidden Resources**: 500 additional Lambda functions + 500 IAM roles (zombie mode)
- **Total Impact**: 1,000 Lambda functions and 1,000 IAM roles

## Project Structure

```
bypass-cdk-hidden-services/
├── bin/
│   └── index.ts                   # CDK app entry point
├── lib/
│   ├── index.ts                   # Main stack implementation and library exports
│   ├── interfaces/
│   │   └── stackProps.ts          # Type definitions
│   └── resources/
│       ├── IAMRole.ts             # IAM role definitions
│       ├── Lambda.ts              # Lambda function definitions
│       └── S3Lifecycle.ts         # S3 lifecycle policy definitions
├── src/                          # Source code directory
│   └── index.js                   # Source code
├── package.json                   # Node.js dependencies and scripts
├── package-lock.json              # Locked dependency versions
└── tsconfig.json                  # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- AWS CDK CLI
- AWS credentials configured

### Installation

```bash
npm install
```

### Development Commands

* `cdk deploy`      - Deploy the stack to AWS
* `cdk destroy`     - Remove the stack from AWS

## Solution

The solution to avoid hidden Lambda functions and IAM roles is to use **L1 constructs** instead of **L2 constructs** when defining:

- **Log Retention Policies**: Use `CfnLogGroup` with `retentionInDays` property instead of `LogGroup` with `removalPolicy`
- **S3 Lifecycle Policies**: Use `CfnBucket` with lifecycle configuration instead of `Bucket` with lifecycle rules

### Why L1 Constructs Work

L1 constructs are direct CloudFormation resource mappings that don't include the additional CDK logic that creates hidden services. They provide the same functionality without the overhead of automatic resource creation.

## Investigation Goals

This POC aims to:

1. **Reproduce the Issue**: Demonstrate how CDK creates hidden Lambda functions and IAM roles
2. **Quantify Impact**: Measure the resource accumulation in different scenarios
3. **Implement Solution**: Show how L1 constructs eliminate hidden resources
4. **Document Findings**: Provide clear documentation for the CDK community

## Contributing

This is a research project to understand and document CDK behavior. Contributions are welcome to:

- Improve the reproduction steps
- Add more test scenarios demonstrating L1 vs L2 construct differences
- Document best practices for avoiding hidden resources
- Create tooling to detect and manage hidden resources
- Share additional use cases where L1 constructs provide benefits

## Related Issues

This POC addresses concerns related to:
- AWS CDK resource management
- IAM role limits in multi-project environments
- Hidden service accumulation
- CloudFormation resource tracking
