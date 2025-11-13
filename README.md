# Neuronutrition App

Application de neuronutrition avec espaces Patient et Praticien.

## 🏗️ Architecture

- **Frontend Production** : Apps Vite React (patient-vite, practitioner-vite)
- **Backend** : Firebase Cloud Functions Gen2 (Node.js 20, région europe-west1)
- **Base de données** : Firestore (collection root `questionnaires/{templateId}_{patientUid}`)
- **Authentification** : Firebase Auth
- **Hébergement** : Firebase Hosting
- **Secrets** : Firebase Secret Manager (MANUAL_ASSIGN_SECRET, MIGRATION_SECRET)
- **Monorepo** : pnpm workspaces + Turborepo

## 🚀 Démarrage rapide

### Développement local

```bash
# Patient (port 3020)
pnpm --filter @neuronutrition/patient dev

# Practitioner (port 3010)
pnpm --filter @neuronutrition/practitioner dev

# API Functions (émulateur)
pnpm -C functions serve
```

### Déploiement

```bash
# Hosting (placeholders)
firebase deploy --only hosting:patient
firebase deploy --only hosting:practitioner

# Functions (API)
firebase deploy --only functions
```

## 🧪 Preview Hosting (Pull Requests)

Les Pull Requests déclenchent automatiquement des **previews temporaires** sur Firebase Hosting.

- ✅ Preview automatique pour chaque PR
- ✅ URLs uniques par PR
- ✅ Expiration après 7 jours
- ✅ Commentaire auto dans la PR

**Configuration** : Voir [docs/PREVIEW_HOSTING.md](docs/PREVIEW_HOSTING.md)

**Setup** : Exécuter `.\scripts\setup-github-preview.ps1`

## 📚 Documentation

- [Preview Hosting](docs/PREVIEW_HOSTING.md) - Configuration GitHub Actions preview
- [API Backend Questionnaires](docs/API_BACKEND_QUESTIONNAIRES.md) - Cloud Functions et routes
- [Scripts de gestion des questionnaires](docs/SCRIPTS_QUESTIONNAIRES.md) - Audit, backfill, purge
- [Optimisation du stockage des questionnaires](docs/QUESTIONNAIRE_STORAGE_OPTIMIZATION.md) - Architecture root-only
- [Architecture Backend](ARCHITECTURE_BACKEND_2025.md) - Vue d'ensemble du backend
- [Setup Firebase Secret](docs/SETUP_FIREBASE_SECRET.md) - Configuration des secrets
- [No Code](docs/NO_CODE.md) - Documentation du mode no-code
- [Verify](docs/VERIFY.md) - Scripts de vérification
- [E2E Testing](E2E_TESTING_SUMMARY.md) - Tests end-to-end

## 🌐 URLs

### Production

- Patient: <https://neuronutrition-app-patient.web.app>
- Practitioner: <https://neuronutrition-app-practitioner.web.app>

### Local

- Patient: <http://localhost:3020>
- Practitioner: <http://localhost:3010>
- Functions: <http://localhost:5002>

## 📦 Structure

```tree
neuronutrition-app/
├── apps/
│   ├── patient-vite/       # App Vite Patient (production)
│   ├── practitioner-vite/  # App Vite Practitioner (production)
│   ├── patient/            # App Next.js Patient (legacy)
│   ├── practitioner/       # App Next.js Practitioner (legacy)
│   ├── patient-spa/        # SPA Patient (legacy)
│   └── practitioner-spa/   # SPA Practitioner (legacy)
├── functions/              # Firebase Functions Gen2 (API, europe-west1)
├── packages/               # Packages partagés (shared-ui, shared-core, etc.)
├── scripts/                # Scripts utilitaires et migration
│   ├── audit-questionnaires.mjs       # Audit root vs subcollections
│   ├── backfill-questionnaires.mjs    # Migration vers root collection
│   ├── purge-legacy-questionnaires.mjs # Suppression sécurisée legacy
│   └── _deprecated/                   # Scripts archivés (double-write)
└── docs/                   # Documentation
```
