#!/usr/bin/env pwsh

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔗 LIAISON PATIENTS → PRATICIEN" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ce script lie tous les patients sans praticien à un praticien spécifique." -ForegroundColor White
Write-Host ""

# Demander l'UID du praticien
$practitionerId = Read-Host "Entrez l'UID du praticien"

if ([string]::IsNullOrWhiteSpace($practitionerId)) {
    Write-Host ""
    Write-Host "❌ Aucun UID fourni. Opération annulée." -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "Confirmation:" -ForegroundColor Yellow
Write-Host "  Praticien UID: $practitionerId" -ForegroundColor White
Write-Host ""
$confirm = Read-Host "Voulez-vous continuer ? (o/n)"

if ($confirm -ne "o" -and $confirm -ne "O") {
    Write-Host ""
    Write-Host "❌ Opération annulée." -ForegroundColor Red
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "🚀 Lancement du script de liaison..." -ForegroundColor Green
Write-Host ""

# Exécuter le script Node.js
node scripts/fix-patient-practitioner-link.mjs $practitionerId

Write-Host ""
Write-Host "Appuyez sur Entrée pour fermer..." -ForegroundColor Gray
Read-Host
