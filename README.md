# Overwatch Support

## Overview

This project provides the below functionalities:
- Over watch support
- Open Telemetry (OTEL) Support

## 1. Over watch support
# Tagging Reference
| Tag Key | Tag Value     | Description                      |
| --- |---------------|----------------------------------|
| overwatch:install| node-exporter | Installs the node-exporter agent |
| overwatch:install| fluent-bit    | Installs the fluent-bit agent    |
| overwatch:install| cloudwatch-agent| Installs the cloudwatch agent  |
## 2. Open Telemetry support
- It ensures creation of SSM parameters for OpenTelemetry (OTel) configurations for various environments.

### (i) Running the CDK for OtelSupport Stack
When deploying the `OtelSupport` stack using AWS CDK, it is essential to specify the stack name `OtelSupport` as in the example below:

#### Example Command

Here is an example of how to run the CDK command with the required context parameters:

```sh
cdk deploy OtelSupport \
  -c primaryRegion=us-east-1 \
  -c trustedAccounts=acc 
```

### (ii) Consuming OTel Parameters
support for setting up OpenTelemetry (OTel) configurations for various environments. The configurations are managed using AWS Systems Manager (SSM) Parameters, which allows for centralized and secure management of configuration data.

#### Setting Environment Variables for OTel Parameter Consumers

To ensure that the OTel parameter consumers can correctly retrieve and use the configuration data, it is essential to set the following environment variables:

- **`CLUSTER_NAME`**: The name of the ECS cluster.
- **`SERVICE_NAME`**: The name of the ECS service.
- **`ENVIRONMENT_NAME`**: The name of the environment (e.g., dev, test, prod).
- **`REGION`**: The AWS region where the resources are deployed.
- **`ECS_APPLICATION_LOG_GROUP`**: The log group name for application logs.
- **`ECS_APPLICATION_LOGS_NAMESPACE`**: The CloudWatch Logs namespace for application logs.

These environment variables are used in the OTel configuration templates to dynamically set values for various parameters, ensuring that the correct configuration is applied based on the environment.

#### Example

Here is an example of how to set these environment variables in a shell script:

```sh
export CLUSTER_NAME=my-cluster
export SERVICE_NAME=my-service
export ENVIRONMENT_NAME=dev
export REGION=us-west-2
export ECS_APPLICATION_LOG_GROUP=/aws/ecs/my-service/application
export ECS_APPLICATION_LOGS_NAMESPACE=/aws/ecs/my-service/container-insights
```

This project consists of a CDK project that installs the following components:

- Amazon Managed Prometheus (AMP)
- AWS SSM Documents for deploying Prometheus and Cloudwatch Agent
- Lambda function to deploy Prometheus and Cloudwatch Agent
- Roles to support metric collection

