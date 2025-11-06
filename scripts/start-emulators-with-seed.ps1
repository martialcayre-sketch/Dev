#!/usr/bin/env pwsh
# Script pour démarrer les émulateurs et initialiser les comptes de test

Write-Host "🔥 Démarrage des émulateurs Firebase avec comptes de test..." -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot\..

# Démarrer les émulateurs en arrière-plan
$emulatorJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    firebase emulators:start
}

Write-Host "⏳ Attente du démarrage des émulateurs..." -ForegroundColor Yellow

# Attendre que l'émulateur Auth soit prêt (max 30 secondes)
$maxWait = 30
$waited = 0
$authReady = $false

while ($waited -lt $maxWait -and -not $authReady) {
    Start-Sleep -Seconds 2
    $waited += 2
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5004" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 400) {
            $authReady = $true
            Write-Host "✅ Émulateur Auth prêt!" -ForegroundColor Green
        }
    } catch {
        Write-Host "." -NoNewline
    }
}

Write-Host ""

if ($authReady) {
    Write-Host ""
    Write-Host "🌱 Initialisation des comptes de test..." -ForegroundColor Cyan
    node scripts/seed-auth-emulator.mjs
    
    Write-Host ""
    Write-Host "✅ Émulateurs prêts avec comptes de test!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Services disponibles:" -ForegroundColor Cyan
    Write-Host "   - Emulator UI:  http://localhost:5000" -ForegroundColor White
    Write-Host "   - Auth:         http://localhost:5004" -ForegroundColor White
    Write-Host "   - Firestore:    http://localhost:5003" -ForegroundColor White
    Write-Host "   - Functions:    http://localhost:5006" -ForegroundColor White
    Write-Host ""
    Write-Host "📧 Comptes de test disponibles:" -ForegroundColor Cyan
    Write-Host "   - test.praticien@example.com" -ForegroundColor White
    Write-Host "   - praticien@neuronutrition.fr" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Utilisez 'Se connecter avec Google' sur http://localhost:3010/login" -ForegroundColor Yellow
    Write-Host ""
    
    # Garder le job actif
    Write-Host "⌨️  Appuyez sur Ctrl+C pour arrêter les émulateurs" -ForegroundColor Gray
    Wait-Job $emulatorJob
} else {
    Write-Host "❌ Timeout: l'émulateur Auth n'a pas démarré" -ForegroundColor Red
    Stop-Job $emulatorJob
    Remove-Job $emulatorJob
    exit 1
}
