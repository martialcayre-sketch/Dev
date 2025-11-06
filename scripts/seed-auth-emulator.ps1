#!/usr/bin/env pwsh
# Script pour initialiser les comptes de test dans l'émulateur Auth

Write-Host "🔥 Initialisation des comptes de test Auth Emulator..." -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot\..

node scripts/seed-auth-emulator.mjs

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Comptes de test créés avec succès!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Erreur lors de la création des comptes" -ForegroundColor Red
    exit 1
}
