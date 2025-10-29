## Étape 12 - Vérification

### 🔍 Commandes locales de vérification

1. Vérification de l'environnement :

```bash
powershell -ExecutionPolicy Bypass -File .\tools\verify-env.ps1
```

2. Vérification du déploiement :

```bash
powershell -ExecutionPolicy Bypass -File .\tools\verify-hosting.ps1
```

3. Tests unitaires :

```bash
# Lancer les tests une fois
pnpm -C apps/web test

# Mode watch
pnpm -C apps/web test:watch

# Avec couverture
pnpm -C apps/web test:coverage
```

4. Tests e2e :

```bash
# Tests locaux (démarre un serveur de dev)
pnpm -C apps/web e2e:local

# Interface UI Playwright
pnpm -C apps/web e2e:ui

# Tests sur production
pnpm -C apps/web e2e:prod
```

### 🔥 Vérification Firebase Emulator

1. Démarrer les émulateurs :

```bash
pnpm emu:test
```

2. Accès aux interfaces :

- UI Emulator : http://localhost:4000
- Site web : http://localhost:5000
- Firestore : http://localhost:8080
- Functions : http://localhost:5001

### 🌐 Vérification production

- Site web : https://neuronutrition-app.web.app
- Console Firebase : https://console.firebase.google.com/project/neuronutrition-app

### ❗ Dépannage courant

1. Ports occupés

```bash
# Vérifier les ports utilisés
netstat -ano | findstr "4000 5000 5001 8080 9099 9199"

# Tuer un processus
taskkill /PID <PID> /F
```

2. Fichier .env.local manquant

```bash
# Copier le template
cp apps/web/.env.example apps/web/.env.local

# Éditer avec vos valeurs
code apps/web/.env.local
```

3. Token Firebase manquant

```bash
# Générer un nouveau token
firebase login:ci

# Le sauvegarder dans GitHub
gh secret set FIREBASE_TOKEN
```

4. Erreurs de certificat Windows

```bash
# Installer les certificats Playwright
pnpm -C apps/web exec playwright install-deps
```

5. Réinitialisation complète

```bash
# Nettoyer les builds et caches
pnpm clean
rm -rf node_modules
rm -rf apps/*/node_modules
pnpm install

# Réinitialiser les émulateurs
firebase emulators:clearall
```
