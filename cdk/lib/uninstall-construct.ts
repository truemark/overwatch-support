import {Construct} from 'constructs';
import {CfnDocument} from 'aws-cdk-lib/aws-ssm';
import * as path from 'path';
import * as fs from 'fs';

export class UninstallConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // CloudWatch Agent — Distributor uninstall
    const cwDoc = {
      schemaVersion: '2.2',
      description:
        'Uninstall Amazon CloudWatch Agent using AWS Systems Manager Distributor.',
      parameters: {},
      mainSteps: [
        {
          name: 'UninstallCloudWatchAgent',
          action: 'aws:configurePackage',
          inputs: {
            name: 'AmazonCloudWatchAgent',
            action: 'Uninstall',
          },
        },
      ],
    };

    new CfnDocument(this, 'UninstallCloudWatchAgent', {
      content: cwDoc,
      documentType: 'Command',
      name: 'UninstallCloudWatchAgent',
      updateMethod: 'NewVersion',
    });

    // node_exporter / windows_exporter
    const nodeExporterLinuxUninstall = fs
      .readFileSync(
        path.join(
          __dirname,
          '..',
          '..',
          'support',
          'node_exporter_uninstall.sh'
        ),
        'utf-8'
      )
      .split('\n');

    const windowsExporterUninstall = fs
      .readFileSync(
        path.join(
          __dirname,
          '..',
          '..',
          'support',
          'windows_exporter_uninstall.ps1'
        ),
        'utf-8'
      )
      .split('\n');

    const nodeDoc = {
      schemaVersion: '2.2',
      description:
        'Uninstall node_exporter (Linux) or windows_exporter (Windows).',
      parameters: {},
      mainSteps: [
        {
          name: 'UninstallNodeExporterLinux',
          action: 'aws:runShellScript',
          precondition: {StringEquals: ['platformType', 'Linux']},
          inputs: {
            timeoutSeconds: '1200',
            runCommand: nodeExporterLinuxUninstall,
          },
        },
        {
          name: 'UninstallWindowsExporter',
          action: 'aws:runPowerShellScript',
          precondition: {StringEquals: ['platformType', 'Windows']},
          inputs: {
            timeoutSeconds: '1200',
            runCommand: windowsExporterUninstall,
          },
        },
      ],
    };

    new CfnDocument(this, 'UninstallNodeExporter', {
      content: nodeDoc,
      documentType: 'Command',
      name: 'UninstallNodeExporter',
      updateMethod: 'NewVersion',
    });

    // Fluent Bit
    const fluentBitLinuxUninstall = fs
      .readFileSync(
        path.join(
          __dirname,
          '..',
          '..',
          'support',
          'fluent-bit-linux-uninstall.sh'
        ),
        'utf-8'
      )
      .split('\n');

    const fluentBitWindowsUninstall = fs
      .readFileSync(
        path.join(
          __dirname,
          '..',
          '..',
          'support',
          'fluent-bit-windows-uninstall.ps1'
        ),
        'utf-8'
      )
      .split('\n');

    const fbDoc = {
      schemaVersion: '2.2',
      description: 'Uninstall Fluent Bit (Linux/Windows).',
      parameters: {},
      mainSteps: [
        {
          name: 'UninstallFluentBitLinux',
          action: 'aws:runShellScript',
          precondition: {StringEquals: ['platformType', 'Linux']},
          inputs: {
            timeoutSeconds: '1200',
            runCommand: fluentBitLinuxUninstall,
          },
        },
        {
          name: 'UninstallFluentBitWindows',
          action: 'aws:runPowerShellScript',
          precondition: {StringEquals: ['platformType', 'Windows']},
          inputs: {
            timeoutSeconds: '1200',
            runCommand: fluentBitWindowsUninstall,
          },
        },
      ],
    };

    new CfnDocument(this, 'UninstallFluentBit', {
      content: fbDoc,
      documentType: 'Command',
      name: 'UninstallFluentBit',
      updateMethod: 'NewVersion',
    });
  }
}
