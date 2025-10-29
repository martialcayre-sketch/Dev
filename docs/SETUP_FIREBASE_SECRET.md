# Configuration manuelle du Firebase Service Account pour GitHub Actions

## ⚠️ Note importante

L'outil `firebase init hosting:github` a rencontré un problème d'autorisation.  
Suivez ces étapes pour configurer manuellement le secret GitHub.

## 🔑 Étape 1 : Créer le Service Account Firebase

### Option A : Via Firebase Console (Recommandé)

1. **Ouvrir la console Firebase** :
   - URL : <https://console.firebase.google.com/project/neuronutrition-app/settings/serviceaccounts/adminsdk>
   - Ou : Firebase Console → ⚙️ Project Settings → Service Accounts

2. **Générer une nouvelle clé privée** :
   - Cliquer sur le bouton **"Generate new private key"**
   - ⚠️ Un pop-up de confirmation apparaît
   - Cliquer sur **"Generate key"**
   - Un fichier JSON est téléchargé : `neuronutrition-app-xxxxx.json`

3. **Sauvegarder le fichier** :
   - ⚠️ **NE PAS COMMITTER CE FICHIER DANS GIT**
   - Le garder en lieu sûr pour cette configuration
   - Vous pourrez le supprimer après avoir configuré GitHub

### Option B : Via Firebase CLI

```bash
# Se connecter à Firebase
firebase login

# Créer un service account (nécessite les permissions admin)
firebase projects:addsdk
```

## 📋 Étape 2 : Ajouter le secret dans GitHub

### Via l'interface GitHub

1. **Ouvrir les secrets du repository** :
   - URL : <https://github.com/martialcayre-sketch/Dev/settings/secrets/actions>
   - Ou : Repository → Settings → Secrets and variables → Actions

2. **Créer un nouveau secret** :
   - Cliquer sur **"New repository secret"**

3. **Remplir les informations** :
   - **Name** : `FIREBASE_SERVICE_ACCOUNT_NEURONUTRITION_APP`
   - **Value** : Copier **TOUT** le contenu du fichier JSON téléchargé
   
   Le contenu doit ressembler à :
   ```json
   {
     "type": "service_account",
     "project_id": "neuronutrition-app",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "...",
     "client_id": "...",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
     "client_x509_cert_url": "..."
   }
   ```

4. **Ajouter le secret** :
   - Cliquer sur **"Add secret"**
   - ✅ Le secret est maintenant configuré

### Via GitHub CLI (Alternative)

```bash
# Installer GitHub CLI si nécessaire
# https://cli.github.com/

# Se connecter
gh auth login

# Ajouter le secret
gh secret set FIREBASE_SERVICE_ACCOUNT_NEURONUTRITION_APP < neuronutrition-app-xxxxx.json
```

## ✅ Étape 3 : Vérifier la configuration

### Vérification visuelle

1. Aller sur : <https://github.com/martialcayre-sketch/Dev/settings/secrets/actions>
2. Vous devriez voir : `FIREBASE_SERVICE_ACCOUNT_NEURONUTRITION_APP` ✅

### Test avec une Pull Request

1. **Créer une branche de test** :
   ```bash
   cd c:\Dev\neuronutrition-app
   git checkout -b test/preview-hosting-setup
   ```

2. **Faire un petit changement** :
   ```bash
   # PowerShell
   Add-Content -Path apps\patient\index.html -Value "`n<!-- Test preview hosting -->"
   ```

3. **Commit et push** :
   ```bash
   git add .
   git commit -m "test: vérification GitHub Actions preview hosting"
   git push origin test/preview-hosting-setup
   ```

4. **Créer la Pull Request** :
   - Aller sur GitHub
   - Cliquer sur "Compare & pull request"
   - Créer la PR

5. **Vérifier l'exécution** :
   - Aller dans l'onglet **"Actions"** : <https://github.com/martialcayre-sketch/Dev/actions>
   - Vous devriez voir l'action **"Firebase Hosting Preview"** en cours
   - Attendre la fin de l'exécution (2-3 minutes)
   - Un commentaire devrait apparaître dans la PR avec les URLs de preview

## 🐛 Troubleshooting

### Erreur : "Missing Firebase Service Account"

**Cause** : Le secret n'est pas configuré ou le nom est incorrect

**Solution** :
- Vérifier que le nom du secret est exactement : `FIREBASE_SERVICE_ACCOUNT_NEURONUTRITION_APP`
- Vérifier que le JSON est valide (pas de caractères manquants)

### Erreur : "Invalid service account"

**Cause** : Le JSON du service account est corrompu

**Solution** :
- Re-télécharger le fichier JSON depuis Firebase Console
- Vérifier qu'il n'y a pas de caractères ajoutés/supprimés lors du copier-coller

### Erreur : "Permission denied"

**Cause** : Le service account n'a pas les bonnes permissions

**Solution** :
- Dans Firebase Console → IAM & Admin
- Vérifier que le service account a le rôle : **Firebase Hosting Admin**

### L'action ne se déclenche pas

**Cause** : Les fichiers modifiés ne correspondent pas aux paths de déclenchement

**Solution** :
- Vérifier que vous avez modifié un fichier dans :
  - `apps/patient/**`
  - `apps/practitioner/**`
  - `firebase.json`
  - `.firebaserc`

## 🧹 Nettoyage après configuration

Une fois le secret configuré dans GitHub, vous pouvez :

1. **Supprimer le fichier JSON local** :
   ```bash
   # ⚠️ Vérifier d'abord que le secret GitHub fonctionne !
   Remove-Item neuronutrition-app-xxxxx.json
   ```

2. **Fermer la branche de test** (après validation) :
   ```bash
   git checkout main
   git branch -D test/preview-hosting-setup
   git push origin --delete test/preview-hosting-setup
   ```

## 📚 Ressources

- [Firebase Service Accounts](https://firebase.google.com/docs/admin/setup#initialize-sdk)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Firebase Hosting Preview Channels](https://firebase.google.com/docs/hosting/test-preview-deploy)

## 🆘 Besoin d'aide ?

Si vous rencontrez des problèmes :
1. Vérifier les logs de l'action GitHub : <https://github.com/martialcayre-sketch/Dev/actions>
2. Consulter la documentation : `docs/PREVIEW_HOSTING.md`
3. Vérifier le statut Firebase : <https://status.firebase.google.com/>
