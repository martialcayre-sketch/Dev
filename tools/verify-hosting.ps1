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

# Build web
Write-Step "Construction du site web"
try {
    Push-Location "$PSScriptRoot/../apps/web"
    $buildOutput = & pnpm build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Build réussi"
    }
    else {
        Write-Failure "Échec du build: $buildOutput"
        exit 1
    }
}
catch {
    Write-Failure "Erreur lors du build: $_"
    exit 1
}
finally {
    Pop-Location
}

# Déploiement canal de prévisualisation
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$channelId = "verify-$timestamp"
Write-Step "Déploiement sur le canal de prévisualisation: $channelId"

    try {
        $deployOutput = & firebase hosting:channel:deploy $channelId --json 2>&1
        if ($LASTEXITCODE -eq 0) {
            # Try to parse JSON output from firebase CLI
            $allText = $deployOutput -join "`n"
            try {
                $json = $allText | ConvertFrom-Json -ErrorAction Stop
                if ($json.result) {
                    # result contains site keys; take the first site's url
                    $first = $json.result | Get-Member -MemberType NoteProperty | Select-Object -First 1 -ExpandProperty Name
                    if ($first) {
                        $channelUrl = $json.result.$first.url
                    }
                }
            }
            catch {
                # not JSON or parsing failed; fall back to text search
                $channelUrl = $null
            }

            if (-not $channelUrl) {
                # Fallback: search for any https:// URL in the output
                $match = [Regex]::Match($allText, "https?://[\w\-\.]+")
                if ($match.Success) { $channelUrl = $match.Value }
            }

            if ($channelUrl) {
                Write-Success "Canal déployé: $channelUrl"

                # Test HTTP
                Write-Step "Test de l'URL du canal"
                Start-Sleep -Seconds 5  # Attendre que le site soit disponible

                try {
                    $response = Invoke-WebRequest -Uri $channelUrl -UseBasicParsing
                    if ($response.StatusCode -eq 200 -and $response.Content -match "Vite") {
                        Write-Success "Site accessible et contient le mot-clé 'Vite'"
                    }
                    else {
                        Write-Failure "Le site est accessible mais ne contient pas le mot-clé 'Vite'"
                    }
                }
                catch {
                    Write-Failure "Erreur lors du test HTTP: $_"
                }
            }
            else {
                Write-Failure "Impossible de trouver l'URL du canal dans la sortie"
            }
        }
        else {
            Write-Failure "Échec du déploiement: $deployOutput"
        }
    }
catch {
    Write-Failure "Erreur lors du déploiement: $_"
}

# Nettoyage du canal (optionnel, décommentez si nécessaire)
# Write-Step "Nettoyage du canal de prévisualisation"
# firebase hosting:channel:delete $channelId -f 2>&1

# Résumé
Write-Host "`n📋 Résumé de la vérification:" -ForegroundColor Yellow
if ($global:HasErrors) {
    Write-Host "❌ Des erreurs ont été détectées. Veuillez corriger les problèmes ci-dessus." -ForegroundColor Red
    exit 1
}
else {
    Write-Host "✅ Vérification du déploiement réussie!" -ForegroundColor Green
    exit 0
}