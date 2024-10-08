import * as fs from 'fs';
import * as path from 'node:path';
import * as yaml from 'js-yaml';

export interface OtelEnvironmentConfig {
  environmentName: string;
  enabled: boolean;
  applicationPrometheusWriteEndpoint: string;
  ecsPrometheusWriteEndpoint: string;
  region: string;
  projectName: string;
}

export interface StageData {
  enabled: boolean;
  applicationPrometheusWriteEndpoint: string;
  ecsPrometheusWriteEndpoint: string;
}

export interface RegionData {
  stages: Record<string, StageData>;
}

export interface YamlData {
  regions: Record<string, RegionData>;
  project: Project;
}

export interface Project {
  name: string;
}

export function getSupportedOtelEnvironments(
  region: string
): OtelEnvironmentConfig[] {
  const environments: OtelEnvironmentConfig[] = [];

  const fileContents = fs.readFileSync(
    path.resolve(
      __dirname,
      '../../support/otel-supported-environments-config.yaml'
    ),
    'utf-8'
  );
  const data = yaml.load(fileContents) as YamlData;

  // Check if the region exists
  if (data.regions && data.regions[region]) {
    const stages = data.regions[region].stages;

    // Loop through the stages
    for (const [stageName, stageData] of Object.entries(stages)) {
      environments.push({
        environmentName: stageName,
        enabled: stageData.enabled,
        applicationPrometheusWriteEndpoint:
          stageData.applicationPrometheusWriteEndpoint,
        ecsPrometheusWriteEndpoint: stageData.ecsPrometheusWriteEndpoint,
        region,
        projectName: data.project.name,
      });
    }
  }

  return environments;
}
