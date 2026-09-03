#Requires -Version 5.1
<#
.SYNOPSIS
  ZERO MVP installer (Windows, PowerShell 5.1).
  Builds the React newtab, stages the extension, and copies chrome/ into your Firefox profile.
#>
$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$NewtabDir = Join-Path $Root 'newtab'
$ExtensionDir = Join-Path $Root 'extension'
$ChromeDir = Join-Path $Root 'chrome'

Write-Host '== ZERO MVP install ==' -ForegroundColor White

# 1. Build newtab (npm run build -> newtab/dist)
if (-not (Test-Path -LiteralPath (Join-Path $NewtabDir 'node_modules'))) {
  Write-Host '[1/3] npm install…' -ForegroundColor Cyan
  & npm --prefix "$NewtabDir" install
  if (-not $?) { throw 'npm install failed' }
}
Write-Host '[2/3] npm run build…' -ForegroundColor Cyan
& npm --prefix "$NewtabDir" run build
if (-not $?) { throw 'npm run build failed' }

# 2. Copy dist into the extension folder (chrome_url_overrides.newtab -> dist/index.html)
$DistDir = Join-Path $NewtabDir 'dist'
$DistTarget = Join-Path $ExtensionDir 'dist'
if (-not (Test-Path -LiteralPath $DistDir)) { throw "dist/ missing at $DistDir" }
if (Test-Path -LiteralPath $DistTarget) { Remove-Item -LiteralPath $DistTarget -Recurse -Force }
Copy-Item -Path $DistDir -Destination $DistTarget -Recurse -Force
Write-Host "[ok] staged extension dist -> $DistTarget" -ForegroundColor Green

# 3. Copy chrome/ into the default Firefox profile
$ProfilesRoot = Join-Path $env:APPDATA 'Mozilla\Firefox\Profiles'
if (-not (Test-Path -LiteralPath $ProfilesRoot)) {
  Write-Warning "Firefox profiles dir not found: $ProfilesRoot"
  Write-Warning 'Create a profile first (run Firefox once), then re-run this script.'
} else {
  $Profile = Get-ChildItem -LiteralPath $ProfilesRoot -Directory |
    Where-Object { $_.Name -like '*.default*' } |
    Select-Object -First 1
  if (-not $Profile) { $Profile = Get-ChildItem -LiteralPath $ProfilesRoot -Directory | Select-Object -First 1 }
  $ChromeTarget = Join-Path $Profile.FullName 'chrome'
  New-Item -ItemType Directory -Force -Path $ChromeTarget | Out-Null
  Copy-Item -Path (Join-Path $ChromeDir 'userChrome.css') -Destination (Join-Path $ChromeTarget 'userChrome.css') -Force
  Copy-Item -Path (Join-Path $ChromeDir 'userContent.css') -Destination (Join-Path $ChromeTarget 'userContent.css') -Force
  Write-Host "[ok] chrome/ -> $ChromeTarget" -ForegroundColor Green
  Write-Host "Profile: $($Profile.FullName)" -ForegroundColor DarkGray
}

Write-Host ''
Write-Host 'Next (3-step demo):' -ForegroundColor Yellow
Write-Host '  1. about:config -> toolkit.legacyUserProfileCustomizations.stylesheets = true'
Write-Host '  2. Restart Firefox (picks up chrome/userChrome.css)'
Write-Host "  3. about:debugging -> This Firefox -> Load Temporary Add-on -> $ExtensionDir\manifest.json"
Write-Host '  Open a new tab: pixel-perfect ZERO, search -> DuckDuckGo, shortcuts persist.' -ForegroundColor White
