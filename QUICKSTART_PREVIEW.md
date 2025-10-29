# 🚀 Quick Start - Firebase Hosting Preview

## ✅ Fichiers créés

- ✅ `.github/workflows/preview-hosting.yml` - GitHub Action
- ✅ `docs/PREVIEW_HOSTING.md` - Documentation complète
- ✅ `docs/SETUP_FIREBASE_SECRET.md` - **Guide de configuration (LIRE EN PREMIER)**
- ✅ `scripts/setup-github-preview.ps1` - Script d'aide
- ✅ `scripts/test-preview-local.ps1` - Test local

## 🔧 Configuration requise (1 seule fois)

### Étape simple : Ajouter le secret GitHub

1. **Générer le service account** :
   - Ouvrir : <https://console.firebase.google.com/project/neuronutrition-app/settings/serviceaccounts/adminsdk>
   - Cliquer : **"Generate new private key"**
   - Télécharger le fichier JSON

2. **Ajouter dans GitHub** :
   - Ouvrir : <https://github.com/martialcayre-sketch/Dev/settings/secrets/actions>
   - Cliquer : **"New repository secret"**
   - Nom : `FIREBASE_SERVICE_ACCOUNT_NEURONUTRITION_APP`
   - Valeur : Copier TOUT le contenu du JSON
   - Cliquer : **"Add secret"**

3. **C'est tout !** 🎉

📚 **Guide détaillé** : Voir `docs/SETUP_FIREBASE_SECRET.md`

## 🧪 Tester

### Option 1 : Créer une PR de test

```bash
# Créer une branche
git checkout -b test/preview-hosting

# Modifier un fichier
echo "<!-- test -->" >> apps/patient/index.html

# Push et créer PR
git add .
git commit -m "test: preview hosting"
git push origin test/preview-hosting
```

### Option 2 : Test local

```powershell
.\scripts\test-preview-local.ps1
```

## 📋 Ce qui se passe ensuite

1. **À chaque PR** → L'action se déclenche automatiquement
2. **Build** → Les placeholders sont créés
3. **Deploy** → Sur des channels Firebase temporaires
4. **Commentaire** → Ajouté dans la PR avec les URLs

**Voir l'action** : <https://github.com/martialcayre-sketch/Dev/actions>

## ✨ Résultat attendu

Un commentaire dans la PR avec :

```
## 🚀 Firebase Hosting Preview

### 👤 Patient
- URL: https://neuronutrition-app-patient--pr-XX-patient-xxx.web.app
- Expire: dans 7 jours

### 👨‍⚕️ Practitioner  
- URL: https://neuronutrition-app-practitioner--pr-XX-practitioner-xxx.web.app
- Expire: dans 7 jours
```

## 🔗 Liens rapides

- 🔑 [Créer Service Account](https://console.firebase.google.com/project/neuronutrition-app/settings/serviceaccounts/adminsdk)
- 🔒 [GitHub Secrets](https://github.com/martialcayre-sketch/Dev/settings/secrets/actions)
- 🎬 [GitHub Actions](https://github.com/martialcayre-sketch/Dev/actions)
- 📚 [Doc complète](docs/PREVIEW_HOSTING.md)
