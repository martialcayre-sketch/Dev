# NeuroNutrition App - Context & Structure

> **Dernière mise à jour:** 6 novembre 2025 - Intégration Life Journey + Scripts de migration

## 📋 Project Overview

**Name:** NeuroNutrition App  
**Type:** Healthcare Web Application (Practitioner-Patient Management)  
**Stack:** React 18 + TypeScript + Vite + Firebase  
**Workspace:** pnpm Monorepo  
**Hosting:** Firebase Hosting (Multi-site)  
**Database:** Firestore  
**Authentication:** Firebase Auth (Email, Google, Facebook, LinkedIn)  
**Functions:** Node.js 20 (2nd Gen Cloud Functions)

## 🔄 Recent Changes (Nov 6, 2025)

### Life Journey Questionnaire Integration

- ✅ **Nouveau questionnaire** : Life Journey (6 sphères) remplace mode-de-vie
- ✅ **Assignation automatique** : Inclus dans les 4 questionnaires par défaut
- ✅ **Type system étendu** : Support des questions `slider` (0-100)
- ✅ **Déploiement complet** : Cloud Functions + apps patient/praticien
- ⚠️ **Migration requise** : Les patients existants nécessitent une mise à jour

### Scripts de Migration Disponibles

Pour mettre à jour les patients existants avec le nouveau questionnaire :

```powershell
cd C:\Dev
.\scripts\migrate-mode-de-vie-to-life-journey.ps1
```

📚 **Documentation détaillée** :
- [LIFE_JOURNEY_INTEGRATION.md](./LIFE_JOURNEY_INTEGRATION.md) - Vue d'ensemble technique
- [MIGRATION_PATIENTS_LIFE_JOURNEY.md](./MIGRATION_PATIENTS_LIFE_JOURNEY.md) - Guide de migration complet

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
C:/Dev/
├── apps/
│   ├── patient-vite/          # Patient React App (Vite + TypeScript)
│   ├── practitioner-vite/     # Practitioner React App (Vite + TypeScript)
│   ├── shared-api/            # NEW: Shared Backend API (Express + TypeScript)
│   ├── patient/               # Legacy Next.js (not used in production)
│   ├── practitioner/          # Legacy Next.js (not used in production)
│   └── web/                   # Legacy Next.js (not used in production)
├── packages/
│   ├── shared-charts/         # NEW: Shared Chart Components (Recharts)
│   ├── shared-core/           # Shared business logic
│   ├── shared-ui/             # Shared UI components
│   ├── shared-questionnaires/ # Questionnaire data & definitions
│   ├── data-questionnaires/   # Questionnaire JSON data
│   └── config/                # Shared configuration
├── functions/
│   ├── src/
│   │   ├── index.ts                    # Cloud Functions entry point
│   │   ├── assignQuestionnaires.ts     # Auto-assign questionnaires to patients
│   │   ├── activatePatient.ts          # Patient account activation
│   │   └── invitePatient.ts            # Patient invitation system
│   └── package.json
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
├── patients/{uid}
│   ├── questionnaires/{id}          # Assigned questionnaires
│   │   ├── id: string
│   │   ├── title: string
│   │   ├── status: 'pending' | 'in_progress' | 'completed'
│   │   ├── responses: object
│   │   ├── assignedAt: Timestamp
│   │   └── completedAt: Timestamp
│   ├── lifejourney/{id}             # Life Journey results
│   │   ├── answers: object
│   │   ├── scores: object
│   │   ├── globalScore: { score, max, percent }
│   │   └── submittedAt: Timestamp
│   └── notifications/{id}           # Patient notifications
├── users/{uid}
│   └── surveys/{id}                 # Survey submissions
│       ├── type: 'lifejourney-v1'
│       ├── answers: object
│       ├── scores: object
│       └── submittedAt: Timestamp
├── practitioners/{uid}
│   └── invitations/{id}             # Invitation tokens
│       ├── email: string
│       ├── used: boolean
│       ├── expiresAt: Timestamp
│       └── createdAt: Timestamp
└── invitationTokens/{id}            # Global invitation tokens
    ├── email: string
    ├── practitionerId: string
    ├── used: boolean
    ├── expiresAt: Timestamp
    └── createdAt: Timestamp
```

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
- ✅ **Cloud Functions**: assignQuestionnaires, activatePatient, invitePatient (LIVE)
- ⏳ **Shared API**: https://neuronutrition-app.web.app (IN PROGRESS)

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

### Phase 1: Package Partagé (In Progress)

1. ✅ Create `packages/shared-charts`
2. ✅ Move `LifeJourneyRadar.tsx` to shared package
3. ✅ Move `usePatientLifeJourney.ts` to shared package
4. ✅ Install recharts in shared-charts only
5. ✅ Update patient-vite and practitioner-vite imports
6. ✅ Build and deploy practitioner app

### Phase 2: Shared Backend API (Next)

1. ⏳ Create `apps/shared-api` (Express + TypeScript)
2. ⏳ Implement `/api/patients/:id/lifejourney` endpoint
3. ⏳ Implement `/api/patients/:id/radar` endpoint
4. ⏳ Implement `/api/patients/:id/complaints` endpoint
5. ⏳ Configure Firebase Hosting for `neuronutrition-app.web.app`
6. ⏳ Deploy and test API endpoints

### Phase 3: Cleanup (After Deployment)

1. ⏳ Remove unused files and folders
2. ⏳ Remove legacy Next.js apps (apps/patient, apps/practitioner, apps/web)
3. ⏳ Clean up C:/Dev disk space
4. ⏳ Optimize GitHub repository size

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
// Patients can read/write their own data
match /patients/{uid} {
  allow read, write: if request.auth != null && request.auth.uid == uid;

  // Life Journey results: patient write, practitioner read
  match /lifejourney/{id} {
    allow write: if request.auth != null && request.auth.uid == uid;
    allow read: if request.auth != null &&
                   (request.auth.uid == uid ||
                    exists(/databases/$(database)/documents/patients/$(uid)) &&
                    get(/databases/$(database)/documents/patients/$(uid)).data.practitionerId == request.auth.uid);
  }
}

// Practitioners can read their patients' data
match /patients/{patientId} {
  allow read: if request.auth != null &&
                 get(/databases/$(database)/documents/patients/$(patientId)).data.practitionerId == request.auth.uid;
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

**Last Updated:** November 5, 2025  
**Version:** 2.0.0 (Vite Migration Complete)  
**Status:** In Active Development
