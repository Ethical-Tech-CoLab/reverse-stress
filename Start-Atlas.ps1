$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
Write-Host 'Opening Resilience Atlas. Keep this terminal open while using the local server.'
Start-Process 'http://127.0.0.1:4173'
node server.js
