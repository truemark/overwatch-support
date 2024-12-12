[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri {{ WindowsExporterPackageUrl }} -OutFile C:\\windows\\temp\\windows_exporter.msi
Start-Process msiexec.exe -ArgumentList '/i C:\\windows\\temp\\windows_exporter.msi  ENABLED_COLLECTORS=cpu,cs,logical_disk,os,memory,iis' -NoNewWindow -Wait
Remove-Item C:\\windows\\temp\\windows_exporter.msi
Stop-Service -Name windows_exporter -ErrorAction SilentlyContinue
sc.exe delete windows_exporter
$ErrorActionPreference = "Stop"
if (Get-Service -Name windows_exporter -ErrorAction SilentlyContinue) {
    Write-Host "Service 'windows_exporter' exists, attempting to remove it."
    Stop-Service -Name windows_exporter -Force -ErrorAction SilentlyContinue
    sc.exe delete windows_exporter
    Start-Sleep -Seconds 5  # Allow time for the service to be fully deleted
    if (Get-Service -Name windows_exporter -ErrorAction SilentlyContinue) {
        Write-Error "Service 'windows_exporter' could not be removed. Reboot may be required."
        exit 1  # Exit with an error code to signal failure
    }
}
$commandLine ='"C:/Program Files/windows_exporter/windows_exporter.exe" --web.listen-address=:9182 --collectors.enabled=cpu,cs,logical_disk,os,memory,iis'
New-Service -Name 'windows_exporter' -BinaryPathName $commandLine -DisplayName 'Windows Exporter' -StartupType Automatic
Start-Service -Name "windows_exporter"
New-NetFirewallRule -DisplayName "Allow Node Exporter" -Direction Inbound -Protocol TCP -LocalPort 9182 -Action Allow
