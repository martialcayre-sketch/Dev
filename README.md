# Neuronutrition App

Application de neuronutrition avec espaces Patient et Praticien.

## 🏗️ Architecture

- **Option A** (actuelle) : Hosting Firebase avec placeholders + API Functions
- **Apps Next.js** : Développement local (Patient: 3020, Practitioner: 3010)
- **API Functions** : Deployed on Firebase Functions (région: europe-west1)

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
│   ├── patient/          # App Next.js Patient
│   ├── practitioner/     # App Next.js Practitioner
│   ├── patient-spa/      # SPA Patient (legacy)
│   └── practitioner-spa/ # SPA Practitioner (legacy)
├── functions/            # Firebase Functions (API)
├── packages/             # Packages partagés
├── scripts/              # Scripts utilitaires
└── docs/                 # Documentation
```
