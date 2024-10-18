import * as fs from 'fs';
import * as path from 'node:path';
import {getOtelCollectorConfig} from './otel-collector-config-reader';

describe('getOtelConfig', () => {
  const templatePath = path.resolve(
    __dirname,
    '../../support/ecs-otel-task-metrics-config.yaml'
  );

  beforeAll(() => {
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found at path: ${templatePath}`);
    }
  });

  it('should read the real YAML file and render a valid configuration', () => {
    const configData = {};

    const result = getOtelCollectorConfig(configData);

    expect(result).toContain('${CLUSTER_NAME}');
    expect(result).toContain('${ENVIRONMENT_NAME}');
  });

  it('should throw an error if the file does not exist', () => {
    const configData = {};

    const originalPath = path.resolve(
      __dirname,
      '../../support/ecs-otel-task-metrics-config.yaml'
    );
    const tempPath = `${originalPath}.bak`;

    fs.renameSync(originalPath, tempPath);

    try {
      expect(() => getOtelCollectorConfig(configData)).toThrowError();
    } finally {
      // Restore the original file after the test
      fs.renameSync(tempPath, originalPath);
    }
  });
});
