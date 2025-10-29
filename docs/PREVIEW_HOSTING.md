# GitHub Actions - Firebase Hosting Preview

Cette action GitHub déploie automatiquement des **previews** de vos apps Patient et Practitioner sur Firebase Hosting pour chaque Pull Request.

## 🎯 Fonctionnement

### Déclenchement
L'action se déclenche automatiquement sur :
- **Pull Requests** vers `main` ou `develop`
- **Modifications** dans :
  - `apps/patient/**`
  - `apps/practitioner/**`
  - `firebase.json`
  - `.firebaserc`

### Ce qui se passe

1. **Build** : Création des placeholders HTML pour Patient et Practitioner
2. **Deploy** : Déploiement sur des channels Firebase temporaires
3. **Comment** : Ajout automatique d'un commentaire dans la PR avec les URLs de preview
4. **Expiration** : Les previews expirent automatiquement après **7 jours**

## 🔧 Configuration requise

### Secret GitHub à ajouter

Vous devez ajouter un **Firebase Service Account** dans les secrets GitHub.

#### Étapes :

1. **Générer la clé de service Firebase** :
   ```bash
   firebase init hosting:github
   ```
   
   Ou manuellement :
   ```bash
   # Créer un service account dans Firebase Console
   # IAM & Admin > Service Accounts > Create Service Account
   # Permissions : Firebase Hosting Admin
   ```

2. **Ajouter le secret dans GitHub** :
   - Aller dans votre repo GitHub
   - Settings > Secrets and variables > Actions
   - Cliquer sur **New repository secret**
   - Nom : `FIREBASE_SERVICE_ACCOUNT_NEURONUTRITION_APP`
   - Valeur : Coller le contenu du fichier JSON de service account

## 📋 Exemple d'utilisation

### Créer une PR avec preview

```bash
# Créer une branche
git checkout -b feature/nouvelle-page-patient

# Modifier l'app patient
echo "Nouveau contenu" >> apps/patient/index.html

# Commit et push
git add .
git commit -m "feat(patient): ajout nouvelle page"
git push origin feature/nouvelle-page-patient

# Créer la PR sur GitHub
# → L'action se déclenche automatiquement
```

### Résultat dans la PR

Un commentaire sera automatiquement ajouté avec :
- 🔗 URL du preview Patient
- 🔗 URL du preview Practitioner
- ⏰ Date d'expiration
- ✅ Checklist de tests

Exemple d'URL générée :
```
https://neuronutrition-app-patient--pr-42-patient-abc123.web.app
https://neuronutrition-app-practitioner--pr-42-practitioner-xyz789.web.app
```

## 🎨 Personnalisation

### Modifier la durée d'expiration

Dans `.github/workflows/preview-hosting.yml`, changez la valeur `expires` :

```yaml
expires: 14d  # 14 jours au lieu de 7
```

### Ajouter d'autres triggers

```yaml
on:
  pull_request:
    branches:
      - main
      - develop
      - staging  # Ajouter staging
  push:
    branches:
      - develop  # Preview sur push vers develop
```

### Désactiver pour certains fichiers

```yaml
on:
  pull_request:
    paths-ignore:
      - 'docs/**'
      - '*.md'
```

## 🔍 Debugging

### Voir les logs de l'action

1. Aller dans votre repo GitHub
2. Actions > Firebase Hosting Preview
3. Cliquer sur le run en cours ou terminé
4. Voir les logs détaillés de chaque step

### Erreurs courantes

**Error: Missing Firebase Service Account**
- Vérifier que le secret `FIREBASE_SERVICE_ACCOUNT_NEURONUTRITION_APP` existe
- Vérifier que le JSON est valide

**Error: Invalid target**
- Vérifier que les targets `patient` et `practitioner` existent dans `.firebaserc`

**Error: Build failed**
- Vérifier que les fichiers `apps/patient/index.html` et `apps/practitioner/index.html` existent

## 🚀 Commandes manuelles

### Tester le preview localement

```bash
# Build les placeholders
mkdir -p apps/patient/out
cp apps/patient/index.html apps/patient/out/index.html

mkdir -p apps/practitioner/out
cp apps/practitioner/index.html apps/practitioner/out/index.html

# Déployer sur un channel de preview
firebase hosting:channel:deploy preview-test --only patient
firebase hosting:channel:deploy preview-test --only practitioner
```

### Lister les channels actifs

```bash
firebase hosting:channel:list
```

### Supprimer un channel

```bash
firebase hosting:channel:delete pr-42-patient
firebase hosting:channel:delete pr-42-practitioner
```

## 📊 Avantages

✅ **Validation avant merge** : Tester les changements avant de les pousser en production  
✅ **Isolation** : Chaque PR a ses propres URLs de preview  
✅ **Automatique** : Pas besoin de déployer manuellement  
✅ **Temporaire** : Nettoyage automatique après 7 jours  
✅ **Collaboration** : Partager facilement les previews avec l'équipe  

## 🔗 Ressources

- [Firebase Hosting Preview Channels](https://firebase.google.com/docs/hosting/test-preview-deploy)
- [GitHub Actions - Firebase](https://github.com/FirebaseExtended/action-hosting-deploy)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
