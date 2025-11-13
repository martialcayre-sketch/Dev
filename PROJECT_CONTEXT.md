# NeuroNutrition App - Context & Structure

> **Dernière mise à jour:** 13 novembre 2025 - Migration root-only terminée + Purge legacy complétée

## 📋 Project Overview

**Name:** NeuroNutrition App  
**Type:** Healthcare Web Application (Practitioner-Patient Management)  
**Stack:** React 18 + TypeScript + Vite + Firebase  
**Workspace:** pnpm Monorepo  
**Hosting:** Firebase Hosting (Multi-site)  
**Database:** Firestore (root-only questionnaire storage)  
**Authentication:** Firebase Auth (Email, Google, Facebook, LinkedIn)  
**Functions:** Node.js 20 (Cloud Functions Gen2, europe-west1)

## 🔄 Recent Changes (Nov 13, 2025)

### Migration Root-Only Complétée

- ✅ **Architecture root-only** : Collection unique `questionnaires/{templateId}_{patientUid}`
- ✅ **Purge legacy** : 8/8 sous-collections supprimées de manière sécurisée
- ✅ **Scripts de maintenance** : audit, backfill, purge disponibles
- ✅ **Déploiement production** : Apps Vite + Cloud Functions Gen2 actives
- ✅ **Documentation complète** : Tous les docs mis à jour avec architecture actuelle
- ✅ **Secrets Manager** : MANUAL_ASSIGN_SECRET et MIGRATION_SECRET configurés

### Scripts de Maintenance Disponibles

Pour auditer, migrer ou purger les données de questionnaires :

```bash
# Audit de l'état actuel
node scripts/audit-questionnaires.mjs --all --csv audit.csv

# Backfill (si nécessaire)
node scripts/backfill-questionnaires.mjs --all --limit 500

# Purge sécurisée des legacy (déjà exécutée)
node scripts/purge-legacy-questionnaires.mjs --all --csv purge.csv --confirm delete
```

📚 **Documentation détaillée** :

- [SCRIPTS_QUESTIONNAIRES.md](./docs/SCRIPTS_QUESTIONNAIRES.md) - Guide complet des scripts
- [QUESTIONNAIRE_STORAGE_OPTIMIZATION.md](./docs/QUESTIONNAIRE_STORAGE_OPTIMIZATION.md) - Architecture root-only
- [API_BACKEND_QUESTIONNAIRES.md](./docs/API_BACKEND_QUESTIONNAIRES.md) - API Cloud Functions

## 🏗️ Architecture

### Multi-Site Firebase Hosting

```
neuronutrition-app (Project ID)
├── neuronutrition-app.web.app              # Site 1: Shared Backend API (NEW)
├── neuronutrition-app-patient.web.app      # Site 2: Patient App
└── neuronutrition-app-practitioner.web.app # Site 3: Practitioner App
```

### Monorepo Structure

```
/workspaces/Dev/
├── apps/
│   ├── patient-vite/          # Patient React App (Vite + TypeScript) - PRODUCTION
│   ├── practitioner-vite/     # Practitioner React App (Vite + TypeScript) - PRODUCTION
│   ├── patient/               # Legacy Next.js (deprecated)
│   ├── practitioner/          # Legacy Next.js (deprecated)
│   └── shared/                # Shared configuration
├── packages/
│   ├── shared-charts/         # Shared Chart Components (Recharts)
│   ├── shared-core/           # Shared business logic
│   ├── shared-ui/             # Shared UI components
│   ├── shared-questionnaires/ # Questionnaire data & definitions
│   ├── data-questionnaires/   # Questionnaire JSON data
│   └── config/                # Shared configuration
├── functions/
│   ├── src/
│   │   ├── index.ts                    # Cloud Functions entry point
│   │   ├── http/                       # HTTP routes (Express)
│   │   │   └── routes/
│   │   │       └── questionnaires.ts       # Questionnaire endpoints
│   │   ├── assignQuestionnaires.ts     # Auto-assign to root collection
│   │   ├── activatePatient.ts          # Patient activation (assigns questionnaires)
│   │   ├── manualAssignQuestionnaires.ts # Manual assignment callable
│   │   └── onQuestionnaireCompleted.ts # Trigger on root collection
│   └── package.json
├── scripts/
│   ├── audit-questionnaires.mjs       # Audit root vs subcollections
│   ├── backfill-questionnaires.mjs    # Migration vers root collection
│   ├── purge-legacy-questionnaires.mjs # Suppression sécurisée legacy
│   └── _deprecated/                   # Scripts archivés (double-write legacy)
├── docs/
│   ├── SCRIPTS_QUESTIONNAIRES.md      # Guide des scripts de maintenance
│   ├── QUESTIONNAIRE_STORAGE_OPTIMIZATION.md # Architecture root-only
│   ├── API_BACKEND_QUESTIONNAIRES.md  # API Cloud Functions
│   ├── CHATGPT_INSTRUCTIONS.md        # Instructions pour ChatGPT
│   └── COPILOT_CONTEXT.md             # Context pour Copilot
├── firebase.json              # Firebase configuration (hosting, functions, firestore)
├── firestore.rules            # Firestore security rules
├── firestore.indexes.json     # Firestore composite indexes
├── pnpm-workspace.yaml        # pnpm workspace configuration
└── package.json               # Root package.json
```

## 🔐 Authentication & Authorization

### User Roles

- **Patient**: Self-service account, assigned questionnaires, view results
- **Practitioner**: Manage patients, view dashboards, assign questionnaires
- **Admin**: Super-admin (not implemented yet)

### Custom Claims (Firestore)

```typescript
// Patient Document: patients/{uid}
{
  email: string,
  displayName: string,
  practitionerId: string,        // Linked practitioner
  invitationTokenId: string,     // Token used to create account
  createdAt: Timestamp,
  hasQuestionnairesAssigned: boolean,
  pendingQuestionnairesCount: number
}

// Practitioner Document: practitioners/{uid}
{
  email: string,
  displayName: string,
  role: 'practitioner',
  createdAt: Timestamp,
  patients: string[]             // Array of patient UIDs
}
```

## 📊 Data Model (Firestore)

### Collections Structure

```
firestore/
├── questionnaires/{templateId}_{patientUid}  # ROOT COLLECTION (single source of truth)
│   ├── id: string                          # Format: {templateId}_{patientUid}
│   ├── templateId: string                  # e.g., "dnsm", "life-journey"
│   ├── patientUid: string
│   ├── title: string
│   ├── status: 'pending' | 'in_progress' | 'submitted' | 'completed'
│   ├── responses: object
│   ├── assignedAt: Timestamp
│   ├── submittedAt: Timestamp | null
│   └── completedAt: Timestamp | null
├── patients/{uid}
│   ├── email: string
│   ├── displayName: string
│   ├── practitionerId: string
│   ├── invitationTokenId: string
│   ├── createdAt: Timestamp
│   ├── hasQuestionnairesAssigned: boolean
│   └── pendingQuestionnairesCount: number
├── practitioners/{uid}
│   ├── email: string
│   ├── displayName: string
│   ├── role: 'practitioner'
│   ├── createdAt: Timestamp
│   └── patients: string[]                # Array of patient UIDs
├── idempotency/{submit|complete}_{questionnaireId}  # Prevent duplicate operations
│   ├── operationType: 'submit' | 'complete'
│   ├── questionnaireId: string
│   ├── createdAt: Timestamp
│   └── ttl: Timestamp (auto-delete after 7 days)
└── invitationTokens/{id}
    ├── email: string
    ├── practitionerId: string
    ├── used: boolean
    ├── expiresAt: Timestamp
    └── createdAt: Timestamp
```

### ⚠️ Deprecated (Legacy)

```
patients/{uid}/questionnaires/{id}  # DEPRECATED - Purged Nov 13, 2025
```

Les sous-collections `patients/{uid}/questionnaires/{id}` ont été supprimées. Tous les questionnaires sont maintenant exclusivement dans la collection root.

## 🎯 Key Features

### 1. Patient App (`neuronutrition-app-patient.web.app`)

- **Authentication**: Email, Google, Facebook, LinkedIn
- **Signup with Token**: Invitation-based registration
- **Dashboard**: View assigned questionnaires
- **Questionnaires**:
  - **Plaintes et Douleurs**: Slider-based pain/complaints assessment (1-10 scale)
  - **Life Journey (SIIN)**: 7 Spheres of Life (35 questions, weighted scoring 0-4/8/12)
  - **Alimentaire**: Nutritional assessment (DayFlow form)
  - **DNSM**: Dopamine-Noradreanaline-Serotonin-Melatonin neurotransmitter assessment
- **Results**: Radar charts, bar graphs, completion status

### 2. Practitioner App (`neuronutrition-app-practitioner.web.app`)

- **Patient Management**: List, search, invite patients
- **Patient Detail Page**:
  - View patient info
  - Complaints bar chart
  - Life Journey radar chart (7 spheres)
  - Questionnaire status
- **Invitation System**: Generate tokens, send email invitations
- **Dashboard**: Overview of pending questionnaires

### 3. Questionnaires System

#### Life Journey - 7 Sphères Vitales (SIIN Method)

**35 questions, 7 spheres, weighted scoring**

**Scoring System:**

- Standard questions: 0-4 points
- Special questions: 0-8 points
- Critical questions: 0-12 points
- Total: 180 points (100%)

**7 Spheres:**

1. **Sommeil** (Sleep): 4+4+4+4+12 = 28 points
2. **Rythme Biologique** (Biological Rhythm): 4+8+8+4+4 = 28 points
3. **Adaptation Stress** (Stress Adaptation): 8+4+4+8+4 = 28 points
4. **Activité Physique** (Physical Activity): 4+4+4+4+4 = 20 points
5. **Exposition Toxiques** (Toxic Exposure): 4+8+4+4+4 = 24 points
6. **Relations Sociales** (Social Relations): 8+8+8+4+4 = 32 points
7. **Alimentation** (Nutrition): 4+4+4+4+4 = 20 points

**Features:**

- Randomized answer order (cognitive bias prevention)
- Interactive sphere selection
- Real-time scoring calculation
- Radar chart visualization
- Disabled state during submission
- Success message with 2-second delay before navigation
- Dual save: `users/{uid}/surveys` AND `patients/{uid}/lifejourney/{id}`

## 🔧 Technical Stack

### Frontend (Patient & Practitioner Apps)

```json
{
  "framework": "React 18",
  "build": "Vite 5",
  "language": "TypeScript 5",
  "styling": "Tailwind CSS 3",
  "routing": "React Router 6",
  "charts": "Recharts 2.12.7",
  "firebase": "Firebase SDK 10",
  "state": "React Hooks (useState, useEffect, useMemo)"
}
```

### Backend (Cloud Functions)

```json
{
  "runtime": "Node.js 20",
  "generation": "2nd Gen Cloud Functions",
  "region": "europe-west1",
  "framework": "Firebase Functions SDK",
  "language": "TypeScript"
}
```

### Database (Firestore)

```json
{
  "type": "NoSQL Document Database",
  "security": "Firestore Rules",
  "indexes": "Composite indexes for complex queries"
}
```

## 🚀 Deployment

### Current Deployment Status

- ✅ **Patient App**: https://neuronutrition-app-patient.web.app (LIVE)
- ✅ **Practitioner App**: https://neuronutrition-app-practitioner.web.app (LIVE)
- ✅ **Cloud Functions Gen2**: assignQuestionnaires, activatePatient, manualAssignQuestionnaires, HTTP API (LIVE)
- ✅ **Questionnaire Storage**: Root-only `questionnaires/{templateId}_{patientUid}` (LIVE)
- ✅ **Legacy Purge**: 8/8 subcollections deleted (COMPLETED)

### Build Commands

```bash
# Build patient app
cd apps/patient-vite && npm run build

# Build practitioner app
cd apps/practitioner-vite && npm run build

# Build shared API
cd apps/shared-api && npm run build

# Deploy all
npx firebase deploy --only hosting,functions
```

## 🔄 Current Issues & Solutions

### Issue 1: Practitioner App Build Failure

**Problem:** `recharts` module not found in practitioner-vite  
**Root Cause:** Code duplication between patient-vite and practitioner-vite  
**Solution (Phase 1):** Create `packages/shared-charts` with recharts as peer dependency  
**Solution (Phase 2):** Shared API backend for chart data endpoints

### Issue 2: Code Duplication

**Problem:** `LifeJourneyRadar` component duplicated in both apps  
**Solution:** Move to `packages/shared-charts` for single source of truth

### Issue 3: Architecture Scalability

**Problem:** Direct Firestore access from frontends, no centralized API  
**Solution:** Implement shared backend API on `neuronutrition-app.web.app`

## 🎯 Active Development Goals

### ✅ Phase 1: Migration Root-Only (Terminée - Nov 13, 2025)

1. ✅ Refactor de toutes les Cloud Functions pour root-only
2. ✅ Scripts de maintenance (audit, backfill, purge)
3. ✅ Configuration des secrets dans Secret Manager
4. ✅ Déploiement production des apps et functions
5. ✅ Purge sécurisée des sous-collections legacy
6. ✅ Mise à jour complète de la documentation

### Phase 2: Améliorations Futures

1. ⏳ Tests d'intégration avec Firestore emulator
2. ⏳ Cloud Scheduler pour audits périodiques automatiques
3. ⏳ Extension de la couverture E2E (Playwright)
4. ⏳ OpenTelemetry tracing pour Cloud Functions
5. ⏳ Analytics et dashboards praticien avancés

## 📝 Important Notes

### Development Environment

- **OS**: Windows
- **Shell**: PowerShell (pwsh.exe)
- **Package Manager**: pnpm (workspace mode)
- **Node.js**: v20.12.2
- **npm**: v11.6.2 (not recommended, use pnpm)
- **Python**: 3.14 (for OCR scripts)

### Firebase Configuration

```json
{
  "projectId": "neuronutrition-app",
  "region": "europe-west1",
  "hosting": {
    "patient": "neuronutrition-app-patient",
    "practitioner": "neuronutrition-app-practitioner",
    "web": "neuronutrition-app"
  }
}
```

### Workspace Configuration (pnpm-workspace.yaml)

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'functions'
  - 'api'
```

### Key Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "recharts": "^2.12.7",
  "firebase": "^10.7.1",
  "tailwindcss": "^3.4.0",
  "vite": "^5.4.0",
  "typescript": "^5.3.0"
}
```

## 🔒 Security Rules

### Firestore Rules (firestore.rules)

```javascript
// Root questionnaires collection
match /questionnaires/{questionnaireId} {
  allow read: if request.auth != null &&
    (resource.data.patientUid == request.auth.uid ||
     request.auth.token.practitioner == true);

  allow write: if false; // Only Cloud Functions can write
}

// Patients can read their own data
match /patients/{uid} {
  allow read: if request.auth != null && request.auth.uid == uid;
  allow write: if request.auth != null && request.auth.uid == uid;
}

// Practitioners can read their patients' data
match /patients/{patientId} {
  allow read: if request.auth != null &&
                 get(/databases/$(database)/documents/patients/$(patientId)).data.practitionerId == request.auth.uid;
}

// Idempotency documents (Cloud Functions only)
match /idempotency/{docId} {
  allow read, write: if false; // Only Cloud Functions
}
```

## 🌐 Environment Variables

### .env (Cloud Functions)

```bash
PATIENT_APP_URL=https://neuronutrition-app-patient.web.app
PRACTITIONER_APP_URL=https://neuronutrition-app-practitioner.web.app
```

## 📦 Package Versions

### Root Dependencies

- pnpm: 9.15.4
- firebase-tools: 13.22.0
- turbo: 2.3.3

### App Dependencies

- react: 18.2.0
- react-dom: 18.2.0
- recharts: 2.12.7
- firebase: 10.7.1
- vite: 5.4.20
- tailwindcss: 3.4.0

## 🎨 Design System

### Color Palette (Tailwind)

- Primary: `nn-primary-500` (#4F46E5 - Indigo)
- Success: `emerald-500` (#10B981)
- Error: `rose-500` (#F43F5E)
- Warning: `amber-500` (#F59E0B)
- Background: `slate-950` (#020617)

### Typography

- Font: System fonts (sans-serif)
- Headings: Bold, 2xl-3xl
- Body: Regular, sm-base

## 🔗 External Services

- **Firebase Auth**: Email, Google, Facebook, LinkedIn providers
- **Firestore**: Database
- **Firebase Hosting**: Static site hosting
- **Cloud Functions**: Serverless backend
- **Firebase Storage**: File uploads (not used yet)

---

**Last Updated:** 13 novembre 2025  
**Version:** 3.0.0 (Root-Only Architecture + Legacy Purge Complete)  
**Status:** Production Stable
