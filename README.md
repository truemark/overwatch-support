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

This project consists of a CDK project that installs the following components:

- Amazon Managed Prometheus (AMP)
- AWS SSM Documents for deploying Prometheus and Cloudwatch Agent
- Lambda function to deploy Prometheus and Cloudwatch Agent
- Roles to support metric collection

