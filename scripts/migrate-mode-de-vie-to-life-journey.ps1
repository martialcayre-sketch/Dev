# Script de migration : mode-de-vie → life-journey
# Remplace l'ancien questionnaire par le nouveau pour tous les patients existants

Write-Host "`n════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔄 MIGRATION MODE-DE-VIE → LIFE-JOURNEY" -ForegroundColor Cyan
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

# Confirmation avant exécution
Write-Host "⚠️  ATTENTION: Ce script va modifier TOUS les patients existants`n" -ForegroundColor Yellow
Write-Host "📋 Actions qui seront effectuées:" -ForegroundColor Cyan
Write-Host "   • Trouver tous les patients avec 'mode-de-vie' assigné" -ForegroundColor White
Write-Host "   • Créer un nouveau questionnaire 'life-journey'" -ForegroundColor White
Write-Host "   • Copier le statut et les réponses (si complété)" -ForegroundColor White
Write-Host "   • Supprimer l'ancien 'mode-de-vie'`n" -ForegroundColor White

$confirmation = Read-Host "Voulez-vous continuer? (oui/non)"

if ($confirmation -ne "oui") {
    Write-Host "`n❌ Migration annulée par l'utilisateur`n" -ForegroundColor Yellow
    exit 0
}

Write-Host "`n🚀 Lancement de la migration...`n" -ForegroundColor Green

# Exécuter le script de migration
try {
    cd C:\Dev
    node scripts/migrate-mode-de-vie-to-life-journey.mjs
    
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host "`n════════════════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host "  ✅ MIGRATION TERMINÉE AVEC SUCCÈS" -ForegroundColor Green
        Write-Host "════════════════════════════════════════════════════════════`n" -ForegroundColor Green
        
        Write-Host "📝 PROCHAINES ÉTAPES:" -ForegroundColor Cyan
        Write-Host "`n1️⃣  VÉRIFICATION FIREBASE CONSOLE" -ForegroundColor Yellow
        Write-Host "   Ouvrez: https://console.firebase.google.com" -ForegroundColor White
        Write-Host "   → Firestore Database" -ForegroundColor White
        Write-Host "   → patients/{uid}/questionnaires" -ForegroundColor White
        Write-Host "   → Vérifiez que 'life-journey' existe" -ForegroundColor White
        Write-Host "   → Vérifiez que 'mode-de-vie' a été supprimé`n" -ForegroundColor White
        
        Write-Host "2️⃣  TEST CÔTÉ PATIENT" -ForegroundColor Yellow
        Write-Host "   • Connectez-vous avec un compte patient existant" -ForegroundColor White
        Write-Host "   • Allez sur /dashboard/questionnaires" -ForegroundColor White
        Write-Host "   • Vérifiez que 'Life Journey' apparaît" -ForegroundColor White
        Write-Host "   • Testez le remplissage si statut = pending`n" -ForegroundColor White
        
        Write-Host "3️⃣  TEST CÔTÉ PRATICIEN" -ForegroundColor Yellow
        Write-Host "   • Ouvrez une fiche patient" -ForegroundColor White
        Write-Host "   • Vérifiez que le radar graph s'affiche" -ForegroundColor White
        Write-Host "   • Si déjà complété, vérifiez les 6 dimensions`n" -ForegroundColor White
        
    } else {
        Write-Host "`n❌ La migration a échoué (code: $exitCode)`n" -ForegroundColor Red
    }
    
} catch {
    Write-Host "`n❌ ERREUR lors de l'exécution:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "`n"
    exit 1
}
