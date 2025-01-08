import * as fs from 'fs';
import * as path from 'node:path';

export function getOtelCollectorConfig(prometheusEndPoint?: string): string {
  const yamlTemplate = fs.readFileSync(
    path.resolve(__dirname, '../../support/ecs-otel-task-metrics-config.yaml'),
    'utf-8'
  );

  if (prometheusEndPoint) {
    return yamlTemplate.replace(
      /\$\{AWS_PROMETHEUS_ENDPOINT\}/g,
      prometheusEndPoint
    );
  }

  return yamlTemplate;
}
