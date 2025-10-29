# Script pour configurer le Firebase Service Account pour GitHub Actions
# Usage: .\scripts\setup-github-preview.ps1

Write-Host "🔧 Configuration Firebase Hosting Preview pour GitHub Actions" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Firebase CLI est installé
$firebaseInstalled = Get-Command firebase -ErrorAction SilentlyContinue
if (-not $firebaseInstalled) {
    Write-Host "❌ Firebase CLI n'est pas installé." -ForegroundColor Red
    Write-Host "   Installez-le avec: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Firebase CLI détecté" -ForegroundColor Green
Write-Host ""

# Vérifier la connexion Firebase
Write-Host "📋 Vérification de la connexion Firebase..." -ForegroundColor Cyan
firebase projects:list 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Vous n'êtes pas connecté à Firebase." -ForegroundColor Red
    Write-Host "   Connectez-vous avec: firebase login" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Connecté à Firebase" -ForegroundColor Green
Write-Host ""

# Instructions pour créer le service account
Write-Host "📝 Étapes pour configurer le preview hosting:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Générer le Service Account Firebase" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Option A - Automatique (recommandé):" -ForegroundColor White
Write-Host "   firebase init hosting:github" -ForegroundColor Gray
Write-Host ""
Write-Host "   Option B - Manuelle:" -ForegroundColor White
Write-Host "   a. Aller sur: https://console.firebase.google.com/project/neuronutrition-app/settings/serviceaccounts/adminsdk" -ForegroundColor Gray
Write-Host "   b. Cliquer sur 'Generate new private key'" -ForegroundColor Gray
Write-Host "   c. Télécharger le fichier JSON" -ForegroundColor Gray
Write-Host ""

Write-Host "2️⃣  Ajouter le secret dans GitHub" -ForegroundColor Yellow
Write-Host ""
Write-Host "   a. Aller sur: https://github.com/martialcayre-sketch/Dev/settings/secrets/actions" -ForegroundColor Gray
Write-Host "   b. Cliquer sur 'New repository secret'" -ForegroundColor Gray
Write-Host "   c. Nom du secret: FIREBASE_SERVICE_ACCOUNT_NEURONUTRITION_APP" -ForegroundColor Green
Write-Host "   d. Valeur: Copier tout le contenu du fichier JSON" -ForegroundColor Gray
Write-Host ""

Write-Host "3️⃣  Tester la configuration" -ForegroundColor Yellow
Write-Host ""
Write-Host "   a. Créer une branche: git checkout -b test/preview-hosting" -ForegroundColor Gray
Write-Host "   b. Modifier un fichier: echo 'test' >> apps/patient/index.html" -ForegroundColor Gray
Write-Host "   c. Push et créer une PR" -ForegroundColor Gray
Write-Host "   d. Vérifier que l'action se déclenche dans l'onglet 'Actions'" -ForegroundColor Gray
Write-Host ""

# Proposer d'ouvrir les URLs
Write-Host "🔗 Liens utiles:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Firebase Console:  https://console.firebase.google.com/project/neuronutrition-app" -ForegroundColor Blue
Write-Host "   GitHub Secrets:    https://github.com/martialcayre-sketch/Dev/settings/secrets/actions" -ForegroundColor Blue
Write-Host "   GitHub Actions:    https://github.com/martialcayre-sketch/Dev/actions" -ForegroundColor Blue
Write-Host ""

# Demander si on veut lancer la config automatique
$response = Read-Host "Voulez-vous lancer la configuration automatique maintenant ? (O/N)"
if ($response -eq "O" -or $response -eq "o") {
    Write-Host ""
    Write-Host "🚀 Lancement de firebase init hosting:github..." -ForegroundColor Cyan
    Write-Host ""
    firebase init hosting:github
} else {
    Write-Host ""
    Write-Host "✅ Configuration manuelle à suivre selon les étapes ci-dessus." -ForegroundColor Green
    Write-Host ""
}

Write-Host "📚 Documentation complète: docs/PREVIEW_HOSTING.md" -ForegroundColor Cyan
Write-Host ""
