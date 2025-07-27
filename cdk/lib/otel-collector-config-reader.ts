import * as fs from 'fs';
import * as path from 'node:path';

export function getOtelCollectorConfig(
  fileName: string,
  region?: string,
  prometheusEndPoint?: string
): string {
  let yamlTemplate = fs.readFileSync(
    path.resolve(__dirname, `../../support/${fileName}`),
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
