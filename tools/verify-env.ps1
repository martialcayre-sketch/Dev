#!/usr/bin/env pwsh
$ErrorActionPreference = "Stop"
$global:HasErrors = $false

function Write-Step {
    param($Message)
    Write-Host "`n🔍 $Message..." -ForegroundColor Cyan
}

function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Failure {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
    $global:HasErrors = $true
}

function Test-Command {
    param($Command, $MinVersion = $null)
    
    try {
        $version = & $Command --version 2>&1
        if ($MinVersion -and $version -notmatch $MinVersion) {
            Write-Failure "$Command version $version ne correspond pas à la version minimum requise ($MinVersion)"
            return $false
        }
        return $true
    }
    catch {
        Write-Failure "$Command non trouvé"
        return $false
    }
}

function Test-EnvFile {
    param($Path)
    
    if (-not (Test-Path $Path)) {
        Write-Failure "Fichier $Path non trouvé"
        return $false
    }
    
    $content = Get-Content $Path -Raw
    $hasAllVars = $true
    
        @('VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID',
            'VITE_FIREBASE_STORAGE_BUCKET', 'VITE_FIREBASE_MESSAGING_SENDER_ID', 'VITE_FIREBASE_APP_ID') | ForEach-Object {
                $pattern = "^$_=.+$"
                if ($content -notmatch $pattern) {
                        Write-Failure "Variable $_ manquante ou vide dans $Path"
                        $hasAllVars = $false
                }
        }
    
    return $hasAllVars
}

# Vérification des versions
Write-Step "Vérification des versions"
$versionsOk = $true

if (-not (Test-Command "node" "v20")) { $versionsOk = $false }
if (-not (Test-Command "pnpm" "8")) { $versionsOk = $false }
if (-not (Test-Command "git")) { $versionsOk = $false }
if (-not (Test-Command "firebase")) { $versionsOk = $false }
if (-not (Test-Command "gh")) { $versionsOk = $false }

if ($versionsOk) {
    Write-Success "Toutes les dépendances sont installées avec les bonnes versions"
}

# Vérification des fichiers
Write-Step "Vérification des fichiers de configuration"
$requiredFiles = @(
    "firebase.json",
    ".firebaserc",
    "firestore.rules",
    "storage.rules",
    "apps/web/src/lib/firebase.ts"
)

foreach ($file in $requiredFiles) {
    if (Test-Path "$PSScriptRoot/../$file") {
        Write-Success "Fichier $file trouvé"
    }
    else {
        Write-Failure "Fichier $file manquant"
    }
}

# Vérification .env.local
Write-Step "Vérification du fichier .env.local"
$envOk = Test-EnvFile "$PSScriptRoot/../apps/web/.env.local"
if ($envOk) {
    Write-Success "Configuration .env.local valide"
}

# Test du build
Write-Step "Test du build web"
try {
    Push-Location "$PSScriptRoot/../apps/web"
    $buildOutput = pnpm build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Build web réussi"
    }
    else {
        Write-Failure "Échec du build web: $buildOutput"
    }
}
catch {
    Write-Failure "Erreur lors du build web: $_"
}
finally {
    Pop-Location
}

# Test Firebase
Write-Step "Test de la configuration Firebase"
try {
        & firebase projects:list 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Configuration Firebase OK"

            & firebase hosting:sites:list 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Configuration Hosting OK"
            }
            else {
                Write-Failure "Erreur lors de la vérification des sites Hosting"
            }
        }
        else {
            Write-Failure "Erreur lors de la vérification du projet Firebase"
        }
}
catch {
    Write-Failure "Erreur lors des tests Firebase: $_"
}

# Résumé
Write-Host "`n📋 Résumé des vérifications:" -ForegroundColor Yellow
if ($global:HasErrors) {
    Write-Host "❌ Des erreurs ont été détectées. Veuillez corriger les problèmes ci-dessus." -ForegroundColor Red
    exit 1
}
else {
    Write-Host "✅ Toutes les vérifications sont passées avec succès!" -ForegroundColor Green
    exit 0
}