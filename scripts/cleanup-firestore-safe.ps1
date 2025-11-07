# Script de nettoyage sécurisé de Firestore
# AVEC EXCLUSION pour annedogne1@gmail.com

Write-Host "`n════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔧 NETTOYAGE ET RÉPARATION FIRESTORE" -ForegroundColor Cyan
Write-Host "  ⚠️  AVEC EXCLUSION: annedogne1@gmail.com" -ForegroundColor Yellow
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

Write-Host "📋 Actions qui seront effectuées:" -ForegroundColor Cyan
Write-Host "   • Supprimer les tokens expirés non utilisés" -ForegroundColor White
Write-Host "   • Assigner des questionnaires aux patients sans questionnaires" -ForegroundColor White
Write-Host "   • Supprimer les doublons mode-de-vie/life-journey" -ForegroundColor White
Write-Host "   • Nettoyer les anciennes notifications (> 30 jours)`n" -ForegroundColor White

Write-Host "⚠️  EXCLUSION IMPORTANTE:" -ForegroundColor Yellow
Write-Host "   Patient: annedogne1@gmail.com" -ForegroundColor Red
Write-Host "   • Son token ne sera PAS supprimé" -ForegroundColor White
Write-Host "   • Ses questionnaires ne seront PAS modifiés" -ForegroundColor White
Write-Host "   • Ses données ne seront PAS touchées`n" -ForegroundColor White

$confirmation = Read-Host "Voulez-vous continuer? (oui/non)"

if ($confirmation -ne "oui") {
    Write-Host "`n❌ Nettoyage annulé par l'utilisateur`n" -ForegroundColor Yellow
    exit 0
}

Write-Host "`n🚀 Lancement du nettoyage...`n" -ForegroundColor Green

# Exécuter le script de nettoyage
try {
    Set-Location C:\Dev
    node scripts/cleanup-firestore-safe.mjs
    
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host "`n════════════════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host "  ✅ NETTOYAGE TERMINÉ AVEC SUCCÈS" -ForegroundColor Green
        Write-Host "════════════════════════════════════════════════════════════`n" -ForegroundColor Green
        
        Write-Host "📝 VÉRIFICATIONS RECOMMANDÉES:" -ForegroundColor Cyan
        Write-Host "`n1️⃣  FIREBASE CONSOLE" -ForegroundColor Yellow
        Write-Host "   Vérifiez que annedogne1@gmail.com n'a pas été modifié:" -ForegroundColor White
        Write-Host "   https://console.firebase.google.com/project/neuronutrition-app/firestore`n" -ForegroundColor Blue
        
        Write-Host "2️⃣  TEST PATIENT (AUTRE QUE ANNE)" -ForegroundColor Yellow
        Write-Host "   • Connectez-vous avec un autre compte patient" -ForegroundColor White
        Write-Host "   • Vérifiez que les questionnaires sont bien assignés`n" -ForegroundColor White
        
        Write-Host "3️⃣  TOKENS D'INVITATION" -ForegroundColor Yellow
        Write-Host "   • Les tokens expirés ont été nettoyés" -ForegroundColor White
        Write-Host "   • SAUF celui de annedogne1@gmail.com`n" -ForegroundColor White
        
    } else {
        Write-Host "`n❌ Le nettoyage a échoué (code: $exitCode)`n" -ForegroundColor Red
    }
    
} catch {
    Write-Host "`n❌ ERREUR lors de l'exécution:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "`n"
    exit 1
}
