$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$chrome = "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe"
$profile = Join-Path $root ".chrome-profile"

if (-not (Test-Path -LiteralPath $chrome)) {
  throw "Chrome was not found at $chrome"
}

New-Item -ItemType Directory -Force -Path $profile | Out-Null

Start-Process -FilePath $chrome -ArgumentList @(
  "--user-data-dir=$profile",
  "--disable-extensions-except=$root",
  "--load-extension=$root",
  "https://discord.com/channels/@me"
)
