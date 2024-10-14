# Overwatch Support

This project consists of a CDK project that installs the following components:

- Amazon Managed Prometheus (AMP)
- AWS SSM Documents for deploying Prometheus and Cloudwatch Agent
- Lambda function to deploy Prometheus and Cloudwatch Agent
- Roles to support metric collection

# Tagging Reference
| Tag Key | Tag Value     | Description                      |
| --- |---------------|----------------------------------|
| overwatch:install| node-exporter | Installs the node-exporter agent |
| overwatch:install| fluent-bit    | Installs the fluent-bit agent    |
| overwatch:install| cloudwatch-agent| Installs the cloudwatch agent  |
