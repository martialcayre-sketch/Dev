# Script de test local du workflow preview
# Usage: .\scripts\test-preview-local.ps1

Write-Host "🧪 Test local du workflow Firebase Hosting Preview" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Split-Path -Parent $PSScriptRoot

# Vérifier qu'on est dans le bon dossier
if (-not (Test-Path "$projectRoot\firebase.json")) {
    Write-Host "❌ firebase.json introuvable. Exécutez ce script depuis le dossier scripts/" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Dossier projet: $projectRoot" -ForegroundColor Gray
Write-Host ""

# Step 1: Build patient placeholder
Write-Host "1️⃣  Build placeholder Patient..." -ForegroundColor Yellow
$patientOutDir = "$projectRoot\apps\patient\out"
if (-not (Test-Path $patientOutDir)) {
    New-Item -ItemType Directory -Path $patientOutDir | Out-Null
}

if (Test-Path "$projectRoot\apps\patient\index.html") {
    Copy-Item "$projectRoot\apps\patient\index.html" "$patientOutDir\index.html" -Force
    Write-Host "   ✅ apps/patient/out/index.html créé" -ForegroundColor Green
} else {
    Write-Host "   ❌ apps/patient/index.html introuvable" -ForegroundColor Red
    exit 1
}

# Step 2: Build practitioner placeholder
Write-Host "2️⃣  Build placeholder Practitioner..." -ForegroundColor Yellow
$practitionerOutDir = "$projectRoot\apps\practitioner\out"
if (-not (Test-Path $practitionerOutDir)) {
    New-Item -ItemType Directory -Path $practitionerOutDir | Out-Null
}

if (Test-Path "$projectRoot\apps\practitioner\index.html") {
    Copy-Item "$projectRoot\apps\practitioner\index.html" "$practitionerOutDir\index.html" -Force
    Write-Host "   ✅ apps/practitioner/out/index.html créé" -ForegroundColor Green
} else {
    Write-Host "   ❌ apps/practitioner/index.html introuvable" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "3️⃣  Déploiement sur un channel de test..." -ForegroundColor Yellow
Write-Host ""

$channelName = "local-test-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Write-Host "   Channel: $channelName" -ForegroundColor Cyan

# Demander confirmation
$response = Read-Host "   Voulez-vous déployer sur Firebase ? (O/N)"
if ($response -ne "O" -and $response -ne "o") {
    Write-Host ""
    Write-Host "✅ Test de build réussi. Déploiement annulé." -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Pour déployer manuellement:" -ForegroundColor Cyan
    Write-Host "   firebase hosting:channel:deploy $channelName --only patient" -ForegroundColor Gray
    Write-Host "   firebase hosting:channel:deploy $channelName --only practitioner" -ForegroundColor Gray
    exit 0
}

Write-Host ""
Write-Host "🚀 Déploiement Patient..." -ForegroundColor Cyan
Push-Location $projectRoot
firebase hosting:channel:deploy $channelName --only patient --expires 1h

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Patient déployé" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erreur lors du déploiement Patient" -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Host ""
Write-Host "🚀 Déploiement Practitioner..." -ForegroundColor Cyan
firebase hosting:channel:deploy $channelName --only practitioner --expires 1h

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Practitioner déployé" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erreur lors du déploiement Practitioner" -ForegroundColor Red
    Pop-Location
    exit 1
}

Pop-Location

Write-Host ""
Write-Host "✅ Test complet réussi !" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 URLs de preview (expire dans 1h):" -ForegroundColor Cyan
Write-Host "   Patient:       https://neuronutrition-app-patient--$channelName-<hash>.web.app" -ForegroundColor Blue
Write-Host "   Practitioner:  https://neuronutrition-app-practitioner--$channelName-<hash>.web.app" -ForegroundColor Blue
Write-Host ""
Write-Host "📋 Commandes utiles:" -ForegroundColor Cyan
Write-Host "   Lister les channels: firebase hosting:channel:list" -ForegroundColor Gray
Write-Host "   Supprimer ce test:   firebase hosting:channel:delete $channelName" -ForegroundColor Gray
Write-Host ""
