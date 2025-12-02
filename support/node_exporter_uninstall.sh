#!/bin/bash
set -euo pipefail

echo "Stopping node_exporter service..."
systemctl stop node_exporter 2>/dev/null || true
systemctl disable node_exporter 2>/dev/null || true

echo "Removing systemd units..."
rm -f /etc/systemd/system/node_exporter.service 2>/dev/null || true
rm -f /usr/lib/systemd/system/node_exporter.service 2>/dev/null || true
systemctl daemon-reload 2>/dev/null || true
systemctl reset-failed 2>/dev/null || true

echo "Removing node_exporter files and user..."
rm -rf /etc/prometheus/node_exporter 2>/dev/null || true
rm -rf /opt/node_exporter 2>/dev/null || true
rm -f /usr/local/bin/node_exporter 2>/dev/null || true
userdel -r prometheus 2>/dev/null || true
groupdel prometheus 2>/dev/null || true

echo "node_exporter uninstallation completed"