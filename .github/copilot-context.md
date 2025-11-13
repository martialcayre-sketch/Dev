# GitHub Copilot & Codex - Project Context

> **NeuroNutrition App** - Healthcare Web Application for Practitioner-Patient Management  
> **Last Updated:** 13 novembre 2025 - Migration root-only complétée

## 🎯 Project Overview

**Type:** Full-stack web application (Healthcare/Wellness)  
**Architecture:** Monorepo with separate Patient and Practitioner SPAs  
**Stack:** React 18 + TypeScript + Vite + Firebase  
**Deployment:** Firebase Hosting (multi-site) + Cloud Functions v2  
**Database:** Firestore NoSQL  
**Authentication:** Firebase Auth (Email, Google, Facebook, LinkedIn)

## 🏗️ Workspace Structure

```
C:/Dev/ (pnpm monorepo, 13 packages)
├── apps/
│   ├── patient-vite/          # Patient SPA (React + Vite, port 3020)
│   ├── practitioner-vite/     # Practitioner SPA (React + Vite, port 3010)
│   └── mobile/                # React Native (not in use)
├── packages/
│   ├── shared-core/           # Business logic, types, utilities
│   ├── shared-ui/             # Reusable UI components
│   ├── shared-charts/         # Chart components (Recharts)
│   ├── shared-questionnaires/ # Questionnaire definitions
│   ├── shared-api/            # API client utilities
│   ├── data-questionnaires/   # Questionnaire JSON data
│   └── corpus-ia/             # AI/ML utilities
├── functions/                 # Cloud Functions (Node 20, europe-west1)
│   ├── assignQuestionnaires.ts
│   ├── activatePatient.ts
│   └── invitePatient.ts
├── firebase.json              # Multi-site hosting config
├── firestore.rules            # Security rules
├── pnpm-workspace.yaml        # Workspace configuration
└── turbo.json                 # Turborepo build cache
```

## 🚀 Tech Stack

### Frontend (Both Apps)

- **Framework:** React 18.3.1 with TypeScript 5.9.3
- **Build:** Vite 5.4.20 (ESM, fast HMR)
- **Styling:** Tailwind CSS 3 + shadcn/ui components
- **Routing:** React Router 6
- **Charts:** Recharts 2.12.7
- **Firebase SDK:** v12.5.0 (modular)
- **State:** React Hooks (useState, useEffect, useMemo)
- **Forms:** React Hook Form + Zod validation

### Backend

- **Runtime:** Node.js 24.11.1 (Alpine Linux compatibility)
- **Functions:** Firebase Cloud Functions v2 (2nd gen)
- **Region:** europe-west1
- **Database:** Firestore (NoSQL document store)
- **Storage:** Firebase Storage (for future file uploads)

### DevOps

- **Package Manager:** pnpm 10.22.0+sha512.a8024f681e65c5fc6f0078d54b4d84267e65c7c8e7cf6b85d5acaa3b9e43fcbb4e0c0e4bab3b6f7eedbe59d13c43b6b42b29b6e7a5 (workspaces, hash-verified)
- **Build System:** Turbo 2.6.1 (monorepo builds with parallel execution)
- **CI/CD:** GitHub Actions
- **Testing:** Jest (unit), Playwright (E2E)
- **Container:** Docker (Alpine Node 24.11.1)

## 📝 Code Style & Patterns

### TypeScript Conventions

```typescript
// Use explicit return types for public functions
export function calculateScore(answers: Answers): ScoreResult {
  // ...
}

// Use type instead of interface for simple types
type QuestionnaireStatus = 'pending' | 'in_progress' | 'completed';

// Use interface for objects with methods
interface PatientService {
  getPatient(id: string): Promise<Patient>;
}

// Use Zod for runtime validation
const patientSchema = z.object({
  email: z.string().email(),
  displayName: z.string(),
});
```

### React Patterns

```typescript
// Use functional components with hooks
export function PatientDashboard() {
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Fetch data
  }, [user]);

  return <div>...</div>;
}

// Lazy load heavy components
const LifeJourneyPage = lazy(() => import('./pages/LifeJourneyPage'));

// Use custom hooks for reusable logic
function usePatientQuestionnaires(patientId: string) {
  const [questionnaires, setQuestionnaires] = useState([]);
  // ...
  return { questionnaires, loading, error };
}
```

### File Naming

- **Components:** PascalCase (e.g., `PatientDashboard.tsx`)
- **Hooks:** camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Utils:** camelCase (e.g., `calculateScore.ts`)
- **Types:** PascalCase in `types.ts` or `@types` folder
- **Tests:** Same name with `.test.ts` or `.spec.ts`

## 🔐 Security & Data Access

### Firestore Security Rules

```javascript
// Patients can only read/write their own data
match /patients/{uid} {
  allow read, write: if request.auth.uid == uid;
}

// Practitioners can read their patients' data
match /patients/{patientId} {
  allow read: if request.auth != null &&
    get(/databases/$(database)/documents/patients/$(patientId))
      .data.practitionerId == request.auth.uid;
}
```

### Authentication Flow

1. Patient signs up with invitation token
2. Cloud Function `activatePatient` creates Firestore document
3. Cloud Function `assignQuestionnaires` assigns default questionnaires
4. Patient logs in and accesses dashboard
5. Practitioner sees patient in their list

## 🎯 Key Features to Understand

### 1. Questionnaires System

- **Life Journey (SIIN):** 35 questions, 7 spheres, weighted scoring (0-180 points)
  - Spheres: Sommeil, Rythme, Stress, Activité, Toxiques, Relations, Alimentation
- **Plaintes & Douleurs:** Pain assessment (1-10 sliders)
- **Alimentaire:** DayFlow nutritional tracking
- **DNSM:** Neurotransmitter assessment

### 2. Code Splitting (Performance)

```typescript
// Apps use lazy loading for routes
const QuestionnaireDetailPage = lazy(() =>
  import('./pages/QuestionnaireDetailPage')
);

// Manual chunks in vite.config.ts
rollupOptions: {
  output: {
    manualChunks: {
      'react-vendor': ['react', 'react-dom', 'react-router-dom'],
      'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
      'charts': ['@neuronutrition/shared-charts', 'recharts'],
    }
  }
}
```

### 3. Bundle Optimization

- Patient app: 454KB largest chunk (61% reduction from 1.17MB)
- Practitioner app: 452KB largest chunk (60% reduction from 1.12MB)
- Visualizer plugin: `rollup-plugin-visualizer` generates stats.html

## 🛠️ Development Workflow

### Start Development

```bash
# Patient app (http://localhost:3020)
pnpm dev:patient

# Practitioner app (http://localhost:3010)
pnpm dev:practitioner

# Firebase emulators (Firestore, Auth, Functions)
pnpm dev:emu
```

### Build & Deploy

```bash
# Build all packages (Turbo cache)
pnpm build

# Deploy hosting only
firebase deploy --only hosting:patient
firebase deploy --only hosting:practitioner

# Deploy functions
firebase deploy --only functions
```

### Testing

```bash
# Unit tests (Jest)
pnpm -C functions test

# E2E tests (Playwright)
pnpm exec playwright test

# Specific test file
pnpm exec playwright test e2e/auth-debug.spec.ts
```

## 📦 Key Dependencies

### Patient & Practitioner Apps

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.x",
  "firebase": "^12.5.0",
  "recharts": "2.12.7",
  "tailwindcss": "^3.4.0",
  "vite": "^5.4.20",
  "@neuronutrition/shared-core": "workspace:*",
  "@neuronutrition/shared-charts": "workspace:*"
}
```

### Cloud Functions

```json
{
  "firebase-admin": "^13.6.0",
  "firebase-functions": "^5.x",
  "express": "^4.19.2",
  "@neuronutrition/shared-questionnaires": "workspace:*"
}
```

## 🎨 UI/UX Guidelines

### Tailwind Design Tokens

```css
/* Primary colors */
nn-primary-500: #4F46E5 (Indigo)
emerald-500: #10B981 (Success)
rose-500: #F43F5E (Error)
amber-500: #F59E0B (Warning)

/* Typography */
font-sans: system fonts
text-sm: 0.875rem
text-base: 1rem
text-2xl: 1.5rem
```

### Component Library

- Use existing components from `packages/shared-ui`
- Follow shadcn/ui patterns for new components
- Prefer Tailwind utility classes over custom CSS
- Use `clsx` for conditional classes

## 🔧 Configuration Files

### TypeScript (tsconfig.base.json)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "paths": {} // No baseUrl (deprecated)
  }
}
```

### ESLint (eslint.config.js)

```javascript
export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
];
```

### Vite (vite.config.ts)

```typescript
export default defineConfig({
  plugins: [
    react(),
    visualizer({ // Bundle analyzer
      filename: './dist/stats.html',
      gzipSize: true,
    })
  ],
  build: {
    chunkSizeWarningLimit: 500, // KB
    rollupOptions: {
      output: { manualChunks: {...} }
    }
  }
});
```

## 🚨 Common Pitfalls to Avoid

### 1. Direct Firestore Mutations

```typescript
// ❌ BAD: Direct write without validation
await setDoc(doc(db, 'patients', uid), data);

// ✅ GOOD: Use validated function
await updatePatientProfile(uid, validatedData);
```

### 2. Missing Error Boundaries

```typescript
// ✅ Wrap routes in ErrorBoundary
<ErrorBoundary>
  <Routes>...</Routes>
</ErrorBoundary>
```

### 3. Bundle Size Issues

```typescript
// ❌ BAD: Import entire library
import _ from 'lodash';

// ✅ GOOD: Import specific function
import { debounce } from 'lodash-es';
```

### 4. TypeScript baseUrl Deprecation

```json
// ❌ BAD: Using deprecated baseUrl
{ "baseUrl": ".", "paths": {...} }

// ✅ GOOD: Paths work without baseUrl in bundler mode
{ "paths": {...} }
```

## 📊 Data Models (Firestore)

### Questionnaire Document (ROOT COLLECTION)

```typescript
// Collection: questionnaires/{templateId}_{patientUid}
interface Questionnaire {
  id: string; // Format: {templateId}_{patientUid}
  templateId: string; // e.g., "dnsm", "life-journey"
  patientUid: string;
  title: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'completed';
  responses: Record<string, any>;
  assignedAt: Timestamp;
  submittedAt?: Timestamp;
  completedAt?: Timestamp;
}
```

**Note:** Legacy subcollection `patients/{uid}/questionnaires/{id}` has been purged (Nov 13, 2025).

### Patient Document

```typescript
interface Patient {
  email: string;
  displayName: string;
  practitionerId: string;
  invitationTokenId: string;
  createdAt: Timestamp;
  hasQuestionnairesAssigned: boolean;
  pendingQuestionnairesCount: number;
}
```

### Questionnaire Document (ROOT COLLECTION)

```typescript
// Collection: questionnaires/{templateId}_{patientUid}
interface Questionnaire {
  id: string; // Format: {templateId}_{patientUid}
  templateId: string; // e.g., "dnsm", "life-journey"
  patientUid: string;
  title: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'completed';
  responses: Record<string, any>;
  assignedAt: Timestamp;
  submittedAt?: Timestamp;
  completedAt?: Timestamp;
}
```

**Note:** Legacy subcollection `patients/{uid}/questionnaires/{id}` has been purged (Nov 13, 2025).

### Idempotency Document

```typescript
// Collection: idempotency/{submit|complete}_{questionnaireId}
interface IdempotencyDoc {
  operationType: 'submit' | 'complete';
  questionnaireId: string;
  createdAt: Timestamp;
  ttl: Timestamp; // Auto-delete after 7 days
}
```

### Life Journey Result

```typescript
interface LifeJourneyResult {
  answers: Record<string, number>;
  scores: {
    sommeil: { score: number; max: number; percent: number };
    rythme: { score: number; max: number; percent: number };
    // ... 7 spheres total
  };
  globalScore: { score: number; max: 180; percent: number };
  submittedAt: Timestamp;
}
```

## 🔄 Recent Optimizations (Nov 13, 2025)

1. ✅ **Root-only architecture:** Single source of truth `questionnaires/{templateId}_{patientUid}`
2. ✅ **Legacy purge:** 8/8 subcollections supprimées de manière sécurisée
3. ✅ **Maintenance scripts:** audit, backfill, purge disponibles
4. ✅ **Secret Manager:** MANUAL_ASSIGN_SECRET et MIGRATION_SECRET configurés
5. ✅ **Documentation complète:** Tous les docs mis à jour avec architecture actuelle
6. ✅ **Package Upgrades:** pnpm 10.22.0+sha512.a8024f681e65c5fc6f0078d54b4d84267e65c7c8e7cf6b85d5acaa3b9e43fcbb4e0c0e4bab3b6f7eedbe59d13c43b6b42b29b6e7a5, firebase-admin 13.6.0, Turbo 2.6.1
7. ✅ **Turbo Scripts:** Migration complète vers Turbo avec exécution parallèle
8. ✅ **Code splitting:** Lazy loading réduit bundles de 60%
9. ✅ **Docker security:** Alpine base (réduction des vulnérabilités)
10. ✅ **TypeScript:** Suppression du `baseUrl` déprécié
11. ✅ **ESLint:** Ajout de `projectService` + `tsconfigRootDir`
12. ✅ **Bundle tracking:** Ajout de rollup-plugin-visualizer

## 📚 Important Documentation

- **Scripts Guide:** [SCRIPTS_QUESTIONNAIRES.md](../docs/SCRIPTS_QUESTIONNAIRES.md)
- **Root-Only Architecture:** [QUESTIONNAIRE_STORAGE_OPTIMIZATION.md](../docs/QUESTIONNAIRE_STORAGE_OPTIMIZATION.md)
- **API Backend:** [API_BACKEND_QUESTIONNAIRES.md](../docs/API_BACKEND_QUESTIONNAIRES.md)
- **Build Instructions:** [BUILD.md](../BUILD.md)
- **Firebase Status:** [FIREBASE_STATUS.md](../FIREBASE_STATUS.md)
- **Windows Setup:** [DEVCONTAINER_WINDOWS.md](../DEVCONTAINER_WINDOWS.md)
- **Firebase Hosting:** [docs/PREVIEW_HOSTING.md](../docs/PREVIEW_HOSTING.md)

## 🎓 Learning Resources

- **React 18 Docs:** https://react.dev
- **Vite Guide:** https://vitejs.dev/guide
- **Firebase Docs:** https://firebase.google.com/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **TypeScript Handbook:** https://www.typescriptlang.org/docs
- **Recharts API:** https://recharts.org/en-US/api

---

**When writing code for this project:**

1. Follow TypeScript strict mode
2. Use functional React components with hooks
3. Lazy load heavy components
4. Validate data with Zod before Firestore writes
5. Handle loading and error states
6. Write unit tests for business logic
7. Keep bundles under 500KB per chunk
8. Use workspace packages for shared code
9. Respect Firestore security rules
10. **Use root collection `questionnaires/{templateId}_{patientUid}` for all questionnaire operations**
11. **Use maintenance scripts in `scripts/` for data operations (not `_deprecated/`)**
12. **Create idempotency documents for submit/complete operations**

**Environment:** Alpine Linux, bash, pnpm 10.22.0+sha512.a8024f681e65c5fc6f0078d54b4d84267e65c7c8e7cf6b85d5acaa3b9e43fcbb4e0c0e4bab3b6f7eedbe59d13c43b6b42b29b6e7a5, Node 24.11.1
