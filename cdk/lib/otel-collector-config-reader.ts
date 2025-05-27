import * as fs from 'fs';
import * as path from 'node:path';

export function getOtelCollectorConfig(
  region?: string,
  prometheusEndPoint?: string
): string {
  let yamlTemplate = fs.readFileSync(
    path.resolve(__dirname, '../../support/ecs-otel-task-metrics-config.yaml'),
    'utf-8'
  );

  if (region) {
    yamlTemplate = yamlTemplate.replace(/\$\{REGION\}/g, region);
  }

  if (prometheusEndPoint) {
    yamlTemplate = yamlTemplate.replace(
      /\$\{AWS_PROMETHEUS_ENDPOINT\}/g,
      prometheusEndPoint
    );
  }

  return yamlTemplate;
}
