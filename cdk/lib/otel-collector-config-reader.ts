import * as fs from 'fs';
import * as path from 'node:path';

function applyTemplate(template: string, data: Record<string, string>): string {
  return template.replace(/\{\{(.*?)}}/g, (_, key) => {
    const trimmedKey = key.trim();
    return data[trimmedKey] !== undefined &&
      data[trimmedKey] !== null &&
      data[trimmedKey] !== ''
      ? data[trimmedKey]
      : `{{${trimmedKey}}}`;
  });
}

function isValidTemplate(renderedTemplate: string): boolean {
  const remainingPlaceholders = renderedTemplate.match(/\{\{(.*?)}}/g);
  return remainingPlaceholders === null;
}

export function getOtelCollectorConfig(configData: {
  readonly applicationPrometheusWriteEndpoint?: string;
  readonly ecsPrometheusWriteEndpoint?: string;
  readonly environmentName?: string;
  readonly serviceName?: string;
  readonly clusterName?: string;
  readonly ecsApplicationLogsNamespace?: string;
  readonly ecsApplicationLogGroup?: string;
}): string {
  const yamlTemplate = fs.readFileSync(
    path.resolve(__dirname, '../../support/ecs-otel-task-metrics-config.yaml'),
    'utf-8'
  );

  const renderedTemplate = applyTemplate(yamlTemplate, configData);

  const isValid = isValidTemplate(renderedTemplate);

  if (!isValid) {
    throw new Error('Not all placeholders were replaced.');
  }
  return renderedTemplate;
}
