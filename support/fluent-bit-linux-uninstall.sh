#!/bin/bash
set -euo pipefail

echo "Stopping Fluent Bit service(s)..."
systemctl stop fluent-bit 2>/dev/null || true
systemctl stop td-agent-bit 2>/dev/null || true
systemctl disable fluent-bit 2>/dev/null || true
systemctl disable td-agent-bit 2>/dev/null || true

echo "Removing Fluent Bit packages..."
if command -v dnf >/dev/null 2>&1; then
  dnf remove -y fluent-bit td-agent-bit 2>/dev/null || true
elif command -v yum >/dev/null 2>&1; then
  yum remove -y fluent-bit td-agent-bit 2>/dev/null || true
elif command -v apt-get >/dev/null 2>&1; then
  apt-get remove -y fluent-bit td-agent-bit 2>/dev/null || true
  apt-get autoremove -y 2>/dev/null || true
fi

echo "Cleaning up files..."
rm -rf /etc/fluent-bit /etc/td-agent-bit 2>/dev/null || true
rm -rf /var/lib/fluent-bit /var/log/fluent-bit 2>/dev/null || true
rm -f /etc/systemd/system/fluent-bit.service 2>/dev/null || true
rm -f /etc/systemd/system/td-agent-bit.service 2>/dev/null || true

systemctl daemon-reload 2>/dev/null || true
systemctl reset-failed 2>/dev/null || true

echo "Fluent Bit uninstallation completed"