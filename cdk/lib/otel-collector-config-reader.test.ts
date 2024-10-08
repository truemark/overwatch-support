import * as fs from 'fs';
import * as path from 'node:path';
import {getOtelConfig} from './otel-collector-config-reader';

describe('getOtelConfig', () => {
  const templatePath = path.resolve(
    __dirname,
    '../../support/otel-task-metrics-config.yaml'
  );

  beforeAll(() => {
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found at path: ${templatePath}`);
    }
  });

  it('should read the real YAML file and render a valid configuration', () => {
    const configData = {
      applicationPrometheusWriteEndpoint: 'https://example.com',
      ecsPrometheusWriteEndpoint: 'https://ecs.example.com',
    };

    const result = getOtelConfig(configData);

    expect(result).toContain('https://example.com');
    expect(result).toContain('https://ecs.example.com');
  });

  it('should throw an error if not all placeholders are replaced', () => {
    const configData = {
      applicationPrometheusWriteEndpoint: 'https://example.com',
      // Missing `ecsPrometheusWriteEndpoint`
    };

    expect(() => getOtelConfig(configData)).toThrow(
      'Not all placeholders were replaced.'
    );
  });

  it('should throw an error if no configuration data is provided', () => {
    const configData = {
      applicationPrometheusWriteEndpoint: '',
      ecsPrometheusWriteEndpoint: '',
    };

    expect(() => getOtelConfig(configData)).toThrow(
      `Not all placeholders were replaced.`
    );
  });

  it('should throw an error if the file does not exist', () => {
    const configData = {
      applicationPrometheusWriteEndpoint: 'https://example.com',
      ecsPrometheusWriteEndpoint: 'https://ecs.example.com',
    };

    const originalPath = path.resolve(
      __dirname,
      '../../support/otel-task-metrics-config.yaml'
    );
    const tempPath = `${originalPath}.bak`;

    fs.renameSync(originalPath, tempPath);

    try {
      expect(() => getOtelConfig(configData)).toThrowError();
    } finally {
      // Restore the original file after the test
      fs.renameSync(tempPath, originalPath);
    }
  });
});
