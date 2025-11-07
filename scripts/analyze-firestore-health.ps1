# Script d'analyse de santé de la base Firestore
# Détecte les problèmes et incohérences dans les données

Write-Host "`n════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔍 ANALYSE DE SANTÉ FIRESTORE" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Vérifier que serviceAccountKey.json existe
if (-not (Test-Path "C:\Dev\serviceAccountKey.json")) {
    Write-Host "❌ ERREUR: serviceAccountKey.json introuvable`n" -ForegroundColor Red
    Write-Host "📝 Pour générer la clé:" -ForegroundColor Yellow
    Write-Host "   1. Allez sur https://console.firebase.google.com" -ForegroundColor White
    Write-Host "   2. Projet → Paramètres → Comptes de service" -ForegroundColor White
    Write-Host "   3. Cliquez sur 'Générer une nouvelle clé privée'" -ForegroundColor White
    Write-Host "   4. Sauvegardez le fichier sous C:\Dev\serviceAccountKey.json`n" -ForegroundColor White
    exit 1
}

Write-Host "✅ Service Account Key trouvé`n" -ForegroundColor Green

Write-Host "📊 Analyse en cours..." -ForegroundColor Cyan
Write-Host "   • Patients" -ForegroundColor White
Write-Host "   • Praticiens" -ForegroundColor White
Write-Host "   • Questionnaires" -ForegroundColor White
Write-Host "   • Tokens d'invitation" -ForegroundColor White
Write-Host "   • Collections système`n" -ForegroundColor White

# Exécuter le script d'analyse
try {
    cd C:\Dev
    node scripts/analyze-firestore-health.mjs
    
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host "`n════════════════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host "  ✅ ANALYSE TERMINÉE" -ForegroundColor Green
        Write-Host "════════════════════════════════════════════════════════════`n" -ForegroundColor Green
        
        Write-Host "📝 Consultez le rapport ci-dessus pour:" -ForegroundColor Cyan
        Write-Host "   • Statistiques détaillées" -ForegroundColor White
        Write-Host "   • Problèmes détectés (critiques, avertissements, infos)" -ForegroundColor White
        Write-Host "   • Recommandations d'actions correctives`n" -ForegroundColor White
        
        Write-Host "🔧 ACTIONS RAPIDES:" -ForegroundColor Yellow
        Write-Host "   Migration mode-de-vie → life-journey:" -ForegroundColor White
        Write-Host "   .\scripts\migrate-mode-de-vie-to-life-journey.ps1`n" -ForegroundColor Cyan
        
    } else {
        Write-Host "`n❌ L'analyse a échoué (code: $exitCode)`n" -ForegroundColor Red
    }
    
} catch {
    Write-Host "`n❌ ERREUR lors de l'exécution:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "`n"
    exit 1
}
