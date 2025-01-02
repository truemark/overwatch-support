[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri {{ Windows64FluentbitPackageUrl }} -OutFile C:\\windows\\temp\\fluentbit.exe
Start-Process -FilePath "C:\Windows\Temp\fluentbit.exe" -ArgumentList "/S" -NoNewWindow -Wait
Remove-Item C:\\windows\\temp\\fluentbit.exe
Stop-Service -Name fluentbit -ErrorAction SilentlyContinue
sc.exe delete fluent-bit
Start-Sleep -Seconds 5  # Allow time for the service to be removed
$ErrorActionPreference = "Stop"

# Check if the service still exists
if (Get-Service -Name fluent-bit -ErrorAction SilentlyContinue) {
    Write-Host "Service 'fluent-bit' exists, attempting to remove it."
    Stop-Service -Name fluent-bit -Force -ErrorAction SilentlyContinue
    sc.exe delete fluent-bit
    Start-Sleep -Seconds 5  # Allow time for the service to be fully deleted
    if (Get-Service -Name fluent-bit -ErrorAction SilentlyContinue) {
        Write-Error "Service 'fluent-bit' could not be removed. Reboot may be required."
        exit 1  # Exit with an error code to signal failure
    }
}

# Function to get IMDSv2 token
function Get-IMDSToken {
    $token = Invoke-RestMethod -Method PUT -Uri http://169.254.169.254/latest/api/token -Headers @{"X-aws-ec2-metadata-token-ttl-seconds"="21600"}
    return $token
}

# Function to get EC2 metadata
function Get-Metadata {
    param (
        [string]$Uri,
        [string]$Token
    )
    $headers = @{"X-aws-ec2-metadata-token" = $Token}
    try {
        $response = Invoke-RestMethod -Uri $Uri -Headers $headers
        return $response
    } catch {
        Write-Error "Failed to get metadata from $Uri"
        throw $_
    }
}

# Retrieve EC2 metadata values
$token = Get-IMDSToken

$instanceId = Get-Metadata -Uri "http://169.254.169.254/latest/meta-data/instance-id" -Token $token
$instancePrivateIp = Get-Metadata -Uri "http://169.254.169.254/latest/meta-data/local-ipv4" -Token $token
$instanceHostname = Get-Metadata -Uri "http://169.254.169.254/latest/meta-data/local-hostname" -Token $token
$hostname = hostname

# Create the configuration content
$configContent = @"
[SERVICE]
    # Flush interval seconds
    flush        60

    # Daemon
    daemon       Off

    # Log_Level error warning info debug trace
    log_level    info

    # Parsers File
    parsers_file parsers.conf

    # Plugins File
    plugins_file plugins.conf

    # HTTP Server
    # ===========
    # Enable/Disable the built-in HTTP Server for metrics
    http_server  Off
    http_listen  0.0.0.0
    http_port    2020
[INPUT]
    name prometheus_scrape
    host localhost
    port 9182
    tag node_metrics
    metrics_path /metrics?format=prometheus
    scrape_interval 60s
[OUTPUT]
    Name                prometheus_remote_write
    Match               node_metrics
    Host                {{ PrometheusHostname }}
    Port                443
    URI                 /workspaces/{{ PrometheusWorkspace }}/api/v1/remote_write
    Retry_Limit         False
    tls                 On
    tls.verify          On
    Add_label           job ec2
    Add_label           host $hostname
    Add_label           instance $instanceId
    Add_label           private_ip $instancePrivateIp
    Add_label           local_hostname $instanceHostname
    # AWS credentials
    aws_auth            on
    aws_region          {{ Region }}
"@

# Write the configuration content to the file
Set-Content -Path "C:\Program Files\fluent-bit\conf\fluent-bit.conf" -Value $configContent

$commandLine ='"C:\Program Files\fluent-bit\bin\fluent-bit.exe" -c "C:\Program Files\fluent-bit\conf\fluent-bit.conf"'

# Create the service
New-Service -Name 'fluent-bit' -BinaryPathName $commandLine -DisplayName 'Fluent Bit' -StartupType Automatic
Start-Service -Name "fluent-bit"
