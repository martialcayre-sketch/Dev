<#
Launch local dev stack (Windows PowerShell):
 - Firebase Emulators (Functions, Firestore, Auth)
 - Patient Next app (port 3020) with emulator flags
 - Practitioner Next app (port 3010) with emulator flags
#>

param(
  [switch]$NoEmu
)

Set-Location -Path (Join-Path $PSScriptRoot "..")

function Start-Window($title, $command) {
  Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    "Write-Host `"$title`" -ForegroundColor Cyan; $command"
  ) | Out-Null
}

if (-not $NoEmu) {
  Start-Window 'Emulators (functions,firestore,auth)' 'cmd /c firebase emulators:start --only functions,firestore,auth'
}

$env:NEXT_PUBLIC_USE_EMULATORS='1'

Start-Window 'Patient (dev :3020)' "$env:NEXT_PUBLIC_USE_EMULATORS='1'; pnpm -C apps/patient dev"

$env:NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR='1'
Start-Window 'Practitioner (dev :3010)' "$env:NEXT_PUBLIC_USE_EMULATORS='1'; $env:NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR='1'; pnpm -C apps/practitioner dev"

Write-Host 'La stack locale est en cours de lancement dans trois fenêtres:' -ForegroundColor Green
Write-Host ' - Emulators (http://localhost:5000)'
Write-Host ' - Patient:      http://localhost:3020'
Write-Host ' - Practitioner: http://localhost:3010'

