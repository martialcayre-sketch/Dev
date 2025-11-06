# Script PowerShell pour marquer le token comme utilisé via Firebase CLI

Write-Host "`n🔧 Correction du token d'invitation pour plexmartial@gmail.com`n" -ForegroundColor Cyan

# Afficher les étapes
Write-Host "Ce script va:" -ForegroundColor Yellow
Write-Host "  1. Marquer le token Hd43QF2A73s97iQLLy8V comme utilisé" -ForegroundColor White
Write-Host "  2. Ajouter le timestamp usedAt`n" -ForegroundColor White

# Créer un fichier JSON temporaire pour la mise à jour
$updateData = @{
    used = $true
    usedAt = @{
        ".sv" = "timestamp"
    }
} | ConvertTo-Json -Depth 10

# Écrire dans un fichier temporaire
$tempFile = Join-Path $env:TEMP "firebase-token-update.json"
$updateData | Out-File -FilePath $tempFile -Encoding UTF8

Write-Host "📝 Fichier de mise à jour créé: $tempFile`n" -ForegroundColor Green

Write-Host "⚠️  IMPORTANT:" -ForegroundColor Red
Write-Host "Firebase CLI ne supporte pas directement la mise à jour Firestore via commande." -ForegroundColor Yellow
Write-Host "Utilisez plutôt la console Firebase ou le script Node.js.`n" -ForegroundColor Yellow

Write-Host "🌐 Ouvrir la console Firebase?" -ForegroundColor Cyan
Write-Host "   Appuyez sur [O] pour ouvrir dans le navigateur" -ForegroundColor White
Write-Host "   Appuyez sur [N] pour annuler`n" -ForegroundColor White

$response = Read-Host "Votre choix"

if ($response -eq "O" -or $response -eq "o") {
    Start-Process "chrome.exe" "https://console.firebase.google.com/project/neuronutrition-app/firestore/databases/-default-/data/~2FinvitationTokens~2FHd43QF2A73s97iQLLy8V"
    Write-Host "`n✅ Console Firebase ouverte" -ForegroundColor Green
    Write-Host "`nÉtapes manuelles:" -ForegroundColor Yellow
    Write-Host "  1. Cliquez sur 'Edit' pour modifier le document" -ForegroundColor White
    Write-Host "  2. Changez 'used' de false à true" -ForegroundColor White
    Write-Host "  3. Ajoutez un champ 'usedAt' de type timestamp" -ForegroundColor White
    Write-Host "  4. Cliquez sur 'Update'" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "`n❌ Annulé`n" -ForegroundColor Red
}
