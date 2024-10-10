# Overwatch Support

## Overview

This project provides the below functionalities:
- Over watch support
- Open Telemetry (OTEL) Support

## 1. Over watch support
TBA

## 2. Open Telemetry support
- It ensures creation of SSM parameters for OpenTelemetry (OTel) configurations for various environments.

### (i) Running the CDK for OtelSupport Stack
When deploying the `OtelSupportStack` using AWS CDK, it is essential to specify the following context parameters to ensure the stack is configured correctly:

- **`ecsPrometheusWriteEndpoint`**: The endpoint for ECS Prometheus write.
- **`applicationPrometheusWriteEndpoint`**: The endpoint for application Prometheus write.
- **`environmentName`**: The name of the environment (e.g., dev, test, prod).

#### Example Command

Here is an example of how to run the CDK command with the required context parameters:

```sh
cdk deploy OtelSupport \
  -c primaryRegion=us-east-1 \
  -c trustedAccounts=acc \
  -c ecsPrometheusWriteEndpoint=https://example.com \
  -c applicationPrometheusWriteEndpoint=https://examplw.com \
  -c serviceName=test-serive \
  -c environmentName=dev \
  -c clusterName=billing-cluster \
  -c ecsApplicationLogsNamespace=ECS/AWSOTel/Application/1 \
  -c ecsApplicationLogGroup=/aws/ecs/application/metrics 
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
- **`ECS_CONTAINER_INSIGHTS_LOG_GROUP`**: The log group name for ECS container insights logs.

These environment variables are used in the OTel configuration templates to dynamically set values for various parameters, ensuring that the correct configuration is applied based on the environment.

#### Example

Here is an example of how to set these environment variables in a shell script:

```sh
export CLUSTER_NAME=my-cluster
export SERVICE_NAME=my-service
export ENVIRONMENT_NAME=dev
export REGION=us-west-2
export ECS_APPLICATION_LOG_GROUP=/aws/ecs/my-service/application
export ECS_CONTAINER_INSIGHTS_LOG_GROUP=/aws/ecs/my-service/container-insights
```
