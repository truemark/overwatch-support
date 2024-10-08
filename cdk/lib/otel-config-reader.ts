import fs from 'fs';
import path from 'node:path';

function applyTemplate(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(.*?)\}\}/g, (_, key) => data[key.trim()] || '');
}

function validateTemplate(renderedTemplate: string): boolean {
  const remainingPlaceholders = renderedTemplate.match(/\{\{(.*?)\}\}/g);
  return remainingPlaceholders === null;
}

export function getOtelConfig(region: string): string {
  const templateData = {
    region,
    age: 30,
    city: 'New York',
  };
  const yamlTemplate = fs.readFileSync(
    path.resolve(__dirname, '../../support/otel-task-metrics-config.yaml'),
    'utf-8'
  );

  const renderedTemplate = applyTemplate(yamlTemplate, templateData);

  const isValid = validateTemplate(renderedTemplate);

  if (!isValid) {
    throw new Error('Not all placeholders were replaced.');
  }
  return renderedTemplate;
}
