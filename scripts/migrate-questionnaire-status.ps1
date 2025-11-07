# Script PowerShell pour migrer les statuts de questionnaires
# Usage : .\scripts\migrate-questionnaire-status.ps1

Write-Host "`n════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  📋 MIGRATION DES STATUTS DE QUESTIONNAIRES" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "Ce script va ajouter les champs de statut aux questionnaires existants." -ForegroundColor White
Write-Host "Tous les questionnaires sans statut recevront :`n" -ForegroundColor White
Write-Host "  • status: 'pending' | 'in_progress' | 'completed'" -ForegroundColor Yellow
Write-Host "  • submittedAt: null" -ForegroundColor Yellow
Write-Host "  • completedAt: null (si absent)`n" -ForegroundColor Yellow

$response = Read-Host "Voulez-vous continuer ? (O/N)"
if ($response -ne "O" -and $response -ne "o") {
    Write-Host "`n❌ Migration annulée" -ForegroundColor Red
    exit 0
}

Write-Host "`n🚀 Lancement de la migration...`n" -ForegroundColor Green

try {
    node scripts/migrate-questionnaire-status.mjs
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host "`n════════════════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host "  ✅ MIGRATION RÉUSSIE" -ForegroundColor Green
        Write-Host "════════════════════════════════════════════════════════════`n" -ForegroundColor Green
        
        Write-Host "Les questionnaires ont été migrés avec succès." -ForegroundColor White
        Write-Host "Vous pouvez maintenant utiliser le système de soumission.`n" -ForegroundColor White
    } else {
        Write-Host "`n════════════════════════════════════════════════════════════" -ForegroundColor Red
        Write-Host "  ❌ MIGRATION ÉCHOUÉE" -ForegroundColor Red
        Write-Host "════════════════════════════════════════════════════════════`n" -ForegroundColor Red
        
        Write-Host "Vérifiez les logs ci-dessus pour plus de détails.`n" -ForegroundColor Yellow
        exit $exitCode
    }
} catch {
    Write-Host "`n❌ Erreur lors de l'exécution du script:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
