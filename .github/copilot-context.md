# GitHub Copilot & Codex - Project Context

> **NeuroNutrition App** - Healthcare Web Application for Practitioner-Patient Management  
> **Last Updated:** November 10, 2025

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

- **Runtime:** Node.js 20.18.0
- **Functions:** Firebase Cloud Functions v2 (2nd gen)
- **Region:** europe-west1
- **Database:** Firestore (NoSQL document store)
- **Storage:** Firebase Storage (for future file uploads)

### DevOps

- **Package Manager:** pnpm 9.15.9 (workspaces)
- **Build System:** Turbo 2.6.0 (monorepo builds)
- **CI/CD:** GitHub Actions
- **Testing:** Jest (unit), Playwright (E2E)
- **Container:** Docker (Alpine Node 20.18.0)

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
  "firebase-admin": "^12.7.0",
  "firebase-functions": "^5.x",
  "express": "^4.19.2"
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

### Questionnaire Document

```typescript
interface Questionnaire {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  responses: Record<string, any>;
  assignedAt: Timestamp;
  completedAt?: Timestamp;
  submittedToPractitioner?: boolean;
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

## 🔄 Recent Optimizations (Nov 10, 2025)

1. ✅ Docker security: Alpine base (reduced vulnerabilities)
2. ✅ TypeScript: Removed deprecated `baseUrl`
3. ✅ ESLint: Added `projectService` + `tsconfigRootDir`
4. ✅ Package exports: Moved `types` before `import`/`require`
5. ✅ Code splitting: Lazy loading reduced bundles by 60%
6. ✅ pnpm: Aligned to 9.15.9
7. ✅ Firebase CLI: Updated to 14.24.2
8. ✅ CI/CD: Modernized workflow (Node 20.18.0, corepack)
9. ✅ Bundle tracking: Added rollup-plugin-visualizer
10. ✅ Husky: Removed deprecated hooks

## 📚 Important Documentation

- **Firebase Hosting:** [docs/PREVIEW_HOSTING.md](./docs/PREVIEW_HOSTING.md)
- **Life Journey:** [LIFE_JOURNEY_INTEGRATION.md](./LIFE_JOURNEY_INTEGRATION.md)
- **Migration Guide:** [MIGRATION_PATIENTS_LIFE_JOURNEY.md](./MIGRATION_PATIENTS_LIFE_JOURNEY.md)
- **Practitioner Signin:** [PRACTITIONER_SIGNIN_IMPLEMENTED.md](./PRACTITIONER_SIGNIN_IMPLEMENTED.md)

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
10. Document complex logic with comments

**Environment:** Windows, PowerShell, pnpm 9.15.9, Node 20.18.0
