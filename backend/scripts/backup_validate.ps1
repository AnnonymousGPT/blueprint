# Database Backup & Snapshot Restoration Validation Utility
# Runs pg_dump to create a backup, then restores it into a temporary database to verify snapshot integrity.

$EnvFile = Join-Path $PSScriptRoot "..\.env"
if (Test-Path $EnvFile) {
    Get-Content $EnvFile | Where-Object { $_ -match '=' -and $_ -notmatch '^#' } | ForEach-Object {
        $parts = $_ -split '=', 2
        $key = $parts[0].Trim()
        $value = $parts[1].Trim().Trim('"').Trim("'")
        [System.Environment]::SetEnvironmentVariable($key, $value)
    }
}

$DbUrl = [System.Environment]::GetEnvironmentVariable("DATABASE_URL")
if (-not $DbUrl) {
    Write-Error "DATABASE_URL not found in environment."
    Exit 1
}

# Parse connection string variables
$Pattern = "^postgresql://([^:]+):([^@]+)@([^:/]+):?(\d*)/([^?]+)"
if ($DbUrl -match $Pattern) {
    $User = $Matches[1]
    $Pass = $Matches[2]
    $Host = $Matches[3]
    $Port = if ($Matches[4]) { $Matches[4] } else { 5432 }
    $DbName = $Matches[5]
} else {
    Write-Error "Could not parse DATABASE_URL: $DbUrl"
    Exit 1
}

Write-Host "========================================="
Write-Host "DATABASE BACKUP VALIDATION START"
Write-Host "Target Database Host: $Host"
Write-Host "Target DB Name: $DbName"
Write-Host "========================================="

$BackupFile = Join-Path $PSScriptRoot "snapshot_temp_backup.sql"
$RestoredDbName = "temp_restore_verify"

# Set password environment variable for pg_dump/psql
$env:PGPASSWORD = $Pass

Write-Host "[1/4] Running pg_dump to verify snapshot creation..."
pg_dump -h $Host -p $Port -U $User -d $DbName -F c -b -v -f $BackupFile
if ($LASTEXITCODE -ne 0) {
    Write-Error "pg_dump failed to create database snapshot."
    Exit 1
}
Write-Host "[PASS] Snapshot file successfully created at $BackupFile"

Write-Host "[2/4] Initializing temporary database for restoration check..."
# Drop first if exists
psql -h $Host -p $Port -U $User -d postgres -c "DROP DATABASE IF EXISTS $RestoredDbName;" | Out-Null
psql -h $Host -p $Port -U $User -d postgres -c "CREATE DATABASE $RestoredDbName;"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create temporary validation database."
    Remove-Item $BackupFile -ErrorAction SilentlyContinue
    Exit 1
}

Write-Host "[3/4] Restoring snapshot file into temporary validation database..."
pg_restore -h $Host -p $Port -U $User -d $RestoredDbName -v $BackupFile
if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARNING] pg_restore exited with non-zero. Verifying if database schema successfully populated..."
}

Write-Host "[4/4] Validating schema integrity in restored database..."
$Tables = @("User", "Session", "Expert", "ServiceRequest", "Document", "AuditLog")
$Failed = $false

foreach ($Table in $Tables) {
    $Query = "SELECT COUNT(*) FROM `"$Table`";"
    $Result = psql -h $Host -p $Port -U $User -d $RestoredDbName -t -c $Query
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Validation failed: Table '$Table' is missing or unreadable in restored database."
        $Failed = $true
    } else {
        $Count = $Result.Trim()
        Write-Host "[PASS] Restored Table '$Table' holds $Count records."
    }
}

# Cleanup
Write-Host "Cleaning up temporary database and snapshot file..."
psql -h $Host -p $Port -U $User -d postgres -c "DROP DATABASE IF EXISTS $RestoredDbName;" | Out-Null
Remove-Item $BackupFile -ErrorAction SilentlyContinue
$env:PGPASSWORD = $null

if ($Failed) {
    Write-Error "Database Backup and Restore validation FAILED."
    Exit 1
} else {
    Write-Host "========================================="
    Write-Host "DATABASE BACKUP VALIDATION SUCCESSFUL"
    Write-Host "========================================="
}
