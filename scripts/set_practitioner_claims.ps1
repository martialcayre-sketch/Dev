#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Set custom claims for a practitioner user via Firebase Cloud Function
    
.DESCRIPTION
    This script uses the deployed Cloud Function to set custom claims.
    You need to provide the ADMIN_API_KEY from your Functions environment.
    
.PARAMETER Email
    The email of the user
    
.PARAMETER Uid
    The Firebase UID of the user (if known)
    
.PARAMETER AdminApiKey
    The admin API key configured in Cloud Functions
    
.EXAMPLE
    .\set_practitioner_claims.ps1 -Uid "O9cYUHZLa1O2rb5S5Nxtizs75a92" -AdminApiKey "your-secret-key"
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$Email,
    
    [Parameter(Mandatory=$false)]
    [string]$Uid = "O9cYUHZLa1O2rb5S5Nxtizs75a92",
    
    [Parameter(Mandatory=$true)]
    [string]$AdminApiKey
)

$functionUrl = "https://europe-west1-neuronutrition-app.cloudfunctions.net/setUserAdmin"

Write-Host "🔐 Configuration des custom claims pour l'utilisateur..." -ForegroundColor Cyan
Write-Host "   UID: $Uid" -ForegroundColor Gray
Write-Host "   URL: $functionUrl" -ForegroundColor Gray

$headers = @{
    "Content-Type" = "application/json"
    "x-admin-api-key" = $AdminApiKey
}

$body = @{
    uid = $Uid
    admin = $true
    role = "practitioner"
    fullAdmin = $true
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $functionUrl -Method Post -Headers $headers -Body $body
    Write-Host "✅ Custom claims définis avec succès!" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT:" -ForegroundColor Yellow
    Write-Host "   L'utilisateur doit se DÉCONNECTER et se RECONNECTER" -ForegroundColor Yellow
    Write-Host "   pour que les nouveaux claims prennent effet." -ForegroundColor Yellow
} catch {
    Write-Host "❌ Erreur lors de la définition des claims:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
    exit 1
}
