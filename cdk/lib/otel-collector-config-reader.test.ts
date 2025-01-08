import {getOtelCollectorConfig} from './otel-collector-config-reader';
import * as fs from 'fs';
import * as path from 'node:path';

jest.mock('fs');
jest.mock('node:path');

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

  it('should read the YAML file and replace the placeholder with the provided prometheusEndPoint', () => {
    const prometheusEndPoint = 'http://example.com/prometheus';
    const result = getOtelCollectorConfig(prometheusEndPoint);
    expect(result).toContain(`endpoint: ${prometheusEndPoint}`);
  });

  it('should read the YAML file and return the content without replacement if no prometheusEndPoint is provided', () => {
    const result = getOtelCollectorConfig();
    expect(result).toContain('endpoint: ${AWS_PROMETHEUS_ENDPOINT}');
  });

  it('should throw an error if the YAML file cannot be read', () => {
    (fs.readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error('File not found');
    });
    expect(() => getOtelCollectorConfig()).toThrow('File not found');
  });
});
