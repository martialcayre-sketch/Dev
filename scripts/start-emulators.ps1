# Script pour démarrer les émulateurs Firebase
# Usage: .\scripts\start-emulators.ps1

Write-Host "🚀 Démarrage des émulateurs Firebase..." -ForegroundColor Cyan
Write-Host ""

$projectRoot = "c:\Dev\neuronutrition-app"

# Se placer dans le dossier du projet
Set-Location $projectRoot

# Démarrer les émulateurs
Write-Host "📦 Lancement: Auth, Firestore, Functions" -ForegroundColor Yellow
Write-Host ""

firebase emulators:start --only auth,firestore,functions

Write-Host ""
Write-Host "✅ Émulateurs arrêtés" -ForegroundColor Green
