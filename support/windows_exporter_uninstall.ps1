$ErrorActionPreference = 'Continue'

Write-Host "Stopping windows_exporter service..."
Stop-Service -Name "windows_exporter" -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3
sc.exe delete windows_exporter 2>$null

Write-Host "Removing windows_exporter files..."
Remove-Item -Recurse -Force "C:\Program Files\windows_exporter" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "C:\windows_exporter" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$env:ProgramData\windows_exporter" -ErrorAction SilentlyContinue

Write-Host "Removing firewall rules..."
netsh advfirewall firewall delete rule name="windows_exporter" dir=in 2>$null
netsh advfirewall firewall delete rule name="windows_exporter 9182" dir=in 2>$null

Write-Host "windows_exporter uninstallation completed"