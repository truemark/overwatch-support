import {Construct} from 'constructs';
import {CfnDocument} from 'aws-cdk-lib/aws-ssm';

export class UninstallConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // CloudWatch Agent
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
            runCommand: [
              '#!/bin/bash',
              'set -euo pipefail',
              'echo "Stopping node_exporter service..."',
              'systemctl stop node_exporter 2>/dev/null || true',
              'systemctl disable node_exporter 2>/dev/null || true',
              'rm -f /etc/systemd/system/node_exporter.service 2>/dev/null || true',
              'rm -f /usr/lib/systemd/system/node_exporter.service 2>/dev/null || true',
              'systemctl daemon-reload 2>/dev/null || true',
              'systemctl reset-failed 2>/dev/null || true',
              'echo "Removing node_exporter files..."',
              'rm -rf /etc/prometheus/node_exporter 2>/dev/null || true',
              'rm -rf /opt/node_exporter 2>/dev/null || true',
              'rm -f /usr/local/bin/node_exporter 2>/dev/null || true',
              'userdel -r prometheus 2>/dev/null || true',
              'groupdel prometheus 2>/dev/null || true',
              'echo "node_exporter uninstallation completed"',
            ],
          },
        },
        {
          name: 'UninstallWindowsExporter',
          action: 'aws:runPowerShellScript',
          precondition: {StringEquals: ['platformType', 'Windows']},
          inputs: {
            timeoutSeconds: '1200',
            runCommand: [
              "$ErrorActionPreference = 'Continue'",
              'Write-Host "Stopping windows_exporter service..."',
              'Stop-Service -Name "windows_exporter" -ErrorAction SilentlyContinue',
              'Start-Sleep -Seconds 3',
              'sc.exe delete windows_exporter 2>$null',
              'Write-Host "Removing windows_exporter files..."',
              'Remove-Item -Recurse -Force "C:\\Program Files\\windows_exporter" -ErrorAction SilentlyContinue',
              'Remove-Item -Recurse -Force "C:\\windows_exporter" -ErrorAction SilentlyContinue',
              'Remove-Item -Recurse -Force "$env:ProgramData\\windows_exporter" -ErrorAction SilentlyContinue',
              'Write-Host "Removing firewall rule..."',
              'netsh advfirewall firewall delete rule name="windows_exporter" dir=in 2>$null',
              'netsh advfirewall firewall delete rule name="windows_exporter 9182" dir=in 2>$null',
              'Write-Host "windows_exporter uninstallation completed"',
            ],
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
            runCommand: [
              '#!/bin/bash',
              'set -euo pipefail',
              'echo "Stopping Fluent Bit service..."',
              'systemctl stop fluent-bit 2>/dev/null || true',
              'systemctl stop td-agent-bit 2>/dev/null || true',
              'systemctl disable fluent-bit 2>/dev/null || true',
              'systemctl disable td-agent-bit 2>/dev/null || true',
              'echo "Removing Fluent Bit packages..."',
              'if command -v dnf >/dev/null 2>&1; then',
              '  dnf remove -y fluent-bit td-agent-bit 2>/dev/null || true',
              'elif command -v yum >/dev/null 2>&1; then',
              '  yum remove -y fluent-bit td-agent-bit 2>/dev/null || true',
              'elif command -v apt-get >/dev/null 2>&1; then',
              '  apt-get remove -y fluent-bit td-agent-bit 2>/dev/null || true',
              '  apt-get autoremove -y 2>/dev/null || true',
              'fi',
              'echo "Cleaning up files..."',
              'rm -rf /etc/fluent-bit /etc/td-agent-bit 2>/dev/null || true',
              'rm -rf /var/lib/fluent-bit /var/log/fluent-bit 2>/dev/null || true',
              'rm -f /etc/systemd/system/fluent-bit.service 2>/dev/null || true',
              'rm -f /etc/systemd/system/td-agent-bit.service 2>/dev/null || true',
              'systemctl daemon-reload 2>/dev/null || true',
              'systemctl reset-failed 2>/dev/null || true',
              'echo "Fluent Bit uninstallation completed"',
            ],
          },
        },
        {
          name: 'UninstallFluentBitWindows',
          action: 'aws:runPowerShellScript',
          precondition: {StringEquals: ['platformType', 'Windows']},
          inputs: {
            timeoutSeconds: '1200',
            runCommand: [
              "$ErrorActionPreference = 'Continue'",
              'Write-Host "Stopping Fluent Bit service..."',
              'Stop-Service -Name "fluent-bit" -ErrorAction SilentlyContinue',
              'Start-Sleep -Seconds 3',
              'sc.exe delete fluent-bit 2>$null',
              'Write-Host "Removing Fluent Bit files..."',
              'Remove-Item -Recurse -Force "C:\\Program Files\\FluentBit" -ErrorAction SilentlyContinue',
              'Remove-Item -Recurse -Force "C:\\fluent-bit" -ErrorAction SilentlyContinue',
              'Remove-Item -Recurse -Force "$env:ProgramData\\FluentBit" -ErrorAction SilentlyContinue',
              'Remove-Item -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Services\\fluent-bit" -Recurse -ErrorAction SilentlyContinue',
              'Write-Host "Fluent Bit uninstallation completed"',
            ],
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
