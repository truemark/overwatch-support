import {getOtelCollectorConfig} from './otel-collector-config-reader';
import * as fs from 'fs';
import * as path from 'node:path';

jest.mock('fs');
jest.mock('node:path');

const files = [
  'ecs-otel-task-metrics-config.yaml',
  'lambda-otel-task-metrics-config.yaml',
];

describe('getOtelCollectorConfig', () => {
  const mockYamlContent = `
    exporters:
      prometheusremotewrite/application:
        endpoint: \${AWS_PROMETHEUS_ENDPOINT}
  `;

  beforeEach(() => {
    (fs.readFileSync as jest.Mock).mockReturnValue(mockYamlContent);
    (path.resolve as jest.Mock).mockReturnValue('mocked/path/to/yaml');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each(files)(
    'should read %s and replace the placeholder with the provided prometheusEndPoint',
    fileName => {
      const prometheusEndPoint = 'http://example.com/prometheus';
      const result = getOtelCollectorConfig(fileName, prometheusEndPoint);
      expect(result).toContain(`endpoint: ${prometheusEndPoint}`);
    }
  );

  it.each(files)(
    'should read %s and return the content without replacement if no prometheusEndPoint is provided',
    fileName => {
      const result = getOtelCollectorConfig(fileName);
      expect(result).toContain('endpoint: ${AWS_PROMETHEUS_ENDPOINT}');
    }
  );

  it.each(files)('should throw an error if %s cannot be read', fileName => {
    (fs.readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error('File not found');
    });
    expect(() => getOtelCollectorConfig(fileName)).toThrow('File not found');
  });
});
