# Guide de Construction - Neuronutrition App

## 🚀 Démarrage rapide (testé et validé)

Ce guide a été testé sur Alpine Linux avec Container dev. Adaptez les commandes selon votre environnement.

### 1️⃣ Prérequis

- **Node.js** : Version 20.x (Alpine container) ou 22.16.0+ (testé ✅)
- **pnpm** : Version **10.22.0** (dernière stable)
- **Java** : Requis pour Firebase emulators (inclus dans devcontainer)

#### Installation rapide des prérequis

```bash
# Node.js (exemple avec Alpine Linux)
sudo apk add --no-cache nodejs npm

# pnpm (global - version mise à jour)
sudo npm install -g pnpm@10.22.0

# Java (pour Firebase emulators)
sudo apk add --no-cache openjdk11-jre
```

### 2️⃣ Installation des dépendances

```bash
# Cloner le repo et naviguer dans le dossier
cd /votre/chemin/vers/Dev

# Installer toutes les dépendances du workspace
pnpm install
```

**Note importante** : Si vous rencontrez des erreurs MUSL/glibc avec Node.js :

1. Modifiez temporairement `.npmrc` : `use-node-version=22.16.0`
2. Modifiez temporairement `package.json` : `"node": ">=20.17.0 <23"`
3. Modifiez temporairement `.tool-versions` : `node 22.16.0`

### 3️⃣ Construction (Build)

Les packages partagés **doivent être construits en premier** :

```bash
# 1. Construire les packages partagés (obligatoire)
pnpm --filter @neuronutrition/shared-questionnaires build
pnpm --filter @neuronutrition/shared-api build

# 2. Construire les applications web
pnpm run build:web

# 3. Construire les Functions (TypeScript)
pnpm --filter functions build

# 4. Construire l'API (pas de build requis, simple Express.js)
pnpm -C api build  # script placeholder qui affiche "JS build not required"
```

#### Commandes de build alternatives

```bash
# Build workspace complet (peut échouer sur les filtres "web")
pnpm run build

# Build individuels
pnpm -C apps/patient-vite build
pnpm -C apps/practitioner-vite build
pnpm -C functions build
```

### 4️⃣ Tests et Linting

```bash
# Linting (fonctionne avec des erreurs non-bloquantes)
pnpm -C apps/practitioner-vite run lint

# Tests E2E avec Playwright (nécessite serveurs démarrés)
npx playwright test

# Tests unitaires (pas de scripts configurés dans les apps actuellement)
# Les scripts `pnpm run test` et `pnpm run lint` cherchent un projet "web" inexistant
```

### 5️⃣ Développement local

#### Option A : Lancement manuel (recommandé pour débuter)

```bash
# Terminal 1 : App Patient
pnpm run dev:patient
# ➜ http://localhost:3020

# Terminal 2 : App Practitioner
pnpm run dev:practitioner
# ➜ http://localhost:3010 (avec warnings non-bloquants)

# Terminal 3 : API Express (optionnel)
pnpm -C api start
# ➜ http://localhost:PORT (voir api/src/server.js pour le port)
```

#### Option B : Firebase Emulators (nécessite Java)

```bash
# Authentification Firebase (requise)
npx firebase login

# Démarrer emulators (Firestore, Auth, Functions)
pnpm run dev:emu
# ➜ UI: http://localhost:5000
# ➜ Functions API: http://localhost:5002

# Puis démarrer les apps dans d'autres terminaux
pnpm run dev:patient
pnpm run dev:practitioner
```

#### Option C : Script automatisé (Linux/Mac)

```bash
# Démarrer toute la stack (Linux/Mac uniquement)
pnpm run dev:stack:linux
```

### 6️⃣ Vérifications de fonctionnement

✅ **URLs de test** :

- Patient App: http://localhost:3020
- Practitioner App: http://localhost:3010
- Firebase Emulators UI: http://localhost:5000 (si lancé)
- API Health: http://localhost:5002/.../api/health (si emulators)

✅ **Build artifacts vérifiés** :

- `apps/patient-vite/dist/` - Application patient buildée
- `apps/practitioner-vite/dist/` - Application practitioner buildée
- `packages/shared-questionnaires/dist/` - Package partagé
- `packages/shared-api/dist/` - Package API partagé
- `functions/lib/` - Functions TypeScript compilées

### 7️⃣ Déploiement

#### Firebase Hosting + Functions

```bash
# Authentification (si pas fait)
npx firebase login
npx firebase use neuronutrition-app  # ou votre project-id

# Déploiement hosting (apps statiques)
npx firebase deploy --only hosting:patient,hosting:practitioner

# Déploiement Functions (API backend)
npx firebase deploy --only functions
```

#### Google Cloud Run (alternative)

```bash
# API
pnpm run deploy:run

# Apps individuelles
pnpm run deploy:run:patient
pnpm run deploy:run:practitioner
```

## 🔧 Résolution de problèmes

### Erreur "MUSL/glibc" avec pnpm

- **Solution** : Modifiez `.npmrc`, `package.json`, `.tool-versions` pour utiliser Node 22.x
- **Cause** : pnpm essaie de télécharger Node 20.17.0 incompatible avec Alpine Linux

### "No projects matched the filters"

- **Solution** : Utilisez les commandes directes (`pnpm -C apps/...`) au lieu des filtres
- **Cause** : Le workspace ne contient pas de projet nommé "web"

### Emulators ne démarrent pas

- **Solution** : Installez Java (`sudo apk add openjdk11-jre`) et authentifiez Firebase
- **Cause** : Firebase emulators nécessitent Java et authentification

### Apps Vite avec warnings de dépendances

- **Solution** : Les warnings Victory/Firebase dans l'app practitioner sont non-bloquants
- **Cause** : Configuration Vite `optimizeDeps.include` avec packages manquants

### Build échoue sur packages manquants

- **Solution** : Construisez les packages partagés **avant** les apps
- **Ordre obligatoire** : `shared-questionnaires` + `shared-api` → puis apps

## 📁 Structure résumée

```
Dev/
├── apps/
│   ├── patient-vite/        # App Next.js/Vite Patient (port 3020)
│   └── practitioner-vite/   # App Next.js/Vite Practitioner (port 3010)
├── packages/
│   ├── shared-questionnaires/  # Package questionnaires (à builder en 1er)
│   ├── shared-api/            # Package API client (à builder en 1er)
│   └── ...                    # Autres packages partagés
├── functions/               # Firebase Functions (TypeScript)
├── api/                    # API Express.js simple
└── e2e/                   # Tests Playwright
```

## ✅ Statut de test (Nov 12, 2025 - Mise à jour complète)

- ✅ Installation dépendances : **Réussie** (pnpm 10.22.0 install)
- ✅ Build packages partagés : **Réussi** (shared-questionnaires + shared-api)
- ✅ Build Turbo complet : **Réussi** (13 packages, 1m19s)
- ✅ Build apps web : **Réussi** (patient-vite + practitioner-vite via Turbo)
- ✅ Dev servers : **Fonctionnels** (3020 + 3010)
- ⚠️ Emulators Firebase : **Nécessitent Java** (non testé)
- ✅ Versions mises à jour : **firebase-admin 13.6.0**, **turbo 2.6.1**, **pnpm 10.22.0**

### 🆕 Dernières améliorations (Nov 2025)

- **firebase-admin** : 12.7.0 → **13.6.0** (dernière stable)
- **pnpm** : 9.15.4 → **10.22.0** (dernière stable)
- **turbo** : Nouveau ! **2.6.1** (gestion de monorepo)
- **Scripts** : Migration vers `turbo run build/test/lint`
- **CI/Linting** : Ajout de **@playwright/test 1.56.1**, **husky 9.1.7**, **cspell 8.19.4**
- **Performance** : Cache Turbo activé, build parallélisé

### 🚀 Commandes mises à jour (post-upgrade)

#### Build moderne (avec Turbo)

````bash
# Build global avec cache et parallélisation
pnpm run build

# Build ciblé apps uniquement
pnpm run build:web

# Linting global
pnpm run lint

# Tests global
pnpm run test

# Type checking global
pnpm run typecheck
```---

**Ce guide a été généré automatiquement et testé en live. Pour des questions spécifiques, consultez les fichiers `docs/DEV_LOCAL.md` et `README.md`.**
````
