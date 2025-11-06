# Rafraîchir le PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "🚀 Démarrage de l'application Practitioner (port 3010)..." -ForegroundColor Cyan
Set-Location c:\Dev\neuronutrition-app
pnpm --filter @neuronutrition/practitioner dev
