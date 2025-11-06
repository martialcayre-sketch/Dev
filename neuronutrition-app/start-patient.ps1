# Rafraîchir le PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "🚀 Démarrage de l'application Patient (port 3020)..." -ForegroundColor Cyan
Set-Location c:\Dev\neuronutrition-app
pnpm --filter @neuronutrition/patient dev
