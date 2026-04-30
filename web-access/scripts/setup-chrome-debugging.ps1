# Chrome Remote Debugging Auto-Setup
# This script configures Chrome to auto-allow remote debugging

$ErrorActionPreference = "Stop"

$ChromeUserData = "$env:LOCALAPPDATA\Google\Chrome\User Data"
$PrefsFile = Join-Path $ChromeUserData "Default\Preferences"

if (Test-Path $PrefsFile) {
    $BackupFile = "$PrefsFile.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Copy-Item $PrefsFile $BackupFile -Force
    Write-Host "[OK] Backup created: $BackupFile"

    $content = Get-Content $PrefsFile -Raw -Encoding UTF8
    $prefs = $content | ConvertFrom-Json

    if (-not $prefs.PSObject.Properties.Name.Contains('devtools')) {
        Add-Member -InputObject $prefs -Name 'devtools' -Value ([PSCustomObject]@{}) -Force
    }

    $prefs.devtools | Add-Member -NotePropertyName 'remote_debugging_allowed' -NotePropertyValue $true -Force

    $prefs | ConvertTo-Json -Depth 20 | Set-Content $PrefsFile -Encoding UTF8
    Write-Host "[OK] Preferences updated - remote debugging auto-allowed"
} else {
    Write-Host "[!] Preferences file not found. Please run Chrome once first."
}

# Create desktop shortcut
$Desktop = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $Desktop "Chrome-RemoteDebug.lnk"
$WScriptShell = New-Object -ComObject WScript.Shell
$Shortcut = $WScriptShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$Shortcut.Arguments = "--remote-debugging-port=9222 --remote-allow-origins=* --user-data-dir=`"$ChromeUserData`""
$Shortcut.Description = "Chrome with Remote Debugging for web-access skill"
$Shortcut.Save()

Write-Host "[OK] Shortcut created: $ShortcutPath"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Close all Chrome windows"
Write-Host "2. Launch Chrome using the desktop shortcut"
Write-Host "3. Run: node scripts/check-deps.mjs to verify"
