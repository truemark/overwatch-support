$ErrorActionPreference = 'Continue'

Write-Host "Stopping Fluent Bit service..."
Stop-Service -Name "fluent-bit" -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3
sc.exe delete fluent-bit 2>$null

Write-Host "Removing Fluent Bit files..."
Remove-Item -Recurse -Force "C:\Program Files\FluentBit" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "C:\fluent-bit" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$env:ProgramData\FluentBit" -ErrorAction SilentlyContinue

# (Optional) Remove service registry key if left behind
Remove-Item -Path "HKLM:\SYSTEM\CurrentControlSet\Services\fluent-bit" -Recurse -ErrorAction SilentlyContinue

Write-Host "Fluent Bit uninstallation completed"