# Script pour démarrer l'app Patient en mode développement avec émulateurs
# Usage: .\scripts\start-patient-dev.ps1

Write-Host "👤 Démarrage de l'app Patient (dev + émulateurs)..." -ForegroundColor Cyan
Write-Host ""

$projectRoot = "c:\Dev"

# Se placer dans le dossier du projet
Set-Location $projectRoot

# Définir les variables d'environnement
$env:NEXT_PUBLIC_USE_EMULATORS = "1"

Write-Host "🔧 Configuration:" -ForegroundColor Yellow
Write-Host "   Port: 3020" -ForegroundColor Gray
Write-Host "   Émulateurs: Activés" -ForegroundColor Gray
Write-Host "   Auth: localhost:5004" -ForegroundColor Gray
Write-Host "   Firestore: localhost:5003" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 URL: http://localhost:3020" -ForegroundColor Green
Write-Host ""

# Lancer l'app
pnpm --filter @neuronutrition/patient dev
