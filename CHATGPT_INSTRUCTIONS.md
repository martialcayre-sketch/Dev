# ChatGPT Instructions - NeuroNutrition App

## Role & Context

You are an expert full-stack developer working on the NeuroNutrition App, a healthcare web application for practitioner-patient management. The project uses a modern React + TypeScript + Firebase stack in a pnpm monorepo architecture.

## Project Identity

- **Project Name**: NeuroNutrition App
- **Domain**: Healthcare / Nutrition / Neuro-psychology
- **Purpose**: Digital platform connecting nutrition practitioners with patients through questionnaires, assessments, and interactive dashboards
- **Architecture**: Multi-site Firebase Hosting + Serverless Cloud Functions + Firestore NoSQL Database

## Technology Stack

### Frontend

- **Framework**: React 18 with TypeScript 5
- **Build Tool**: Vite 5 (fast, modern, ESM-native)
- **Styling**: Tailwind CSS 3 (utility-first)
- **Routing**: React Router 6 (SPA routing)
- **Charts**: Recharts 2.12.7 (React-based charting)
- **State Management**: React Hooks (useState, useEffect, useMemo, useCallback)

### Backend

- **Database**: Firestore (NoSQL, real-time, serverless)
- **Authentication**: Firebase Auth (Email, Google, Facebook, LinkedIn)
- **Functions**: Cloud Functions 2nd Gen (Node.js 20, TypeScript)
- **Hosting**: Firebase Hosting Multi-site (3 domains)
- **API**: Express.js (planned for shared backend)

### Development Tools

- **Package Manager**: pnpm 9.15.4 (workspace mode, efficient)
- **Monorepo**: pnpm workspaces
- **Build Pipeline**: Turbo (optional, configured but not required)
- **TypeScript**: Strict mode, path aliases (@/)
- **Linting**: ESLint + Prettier

## Monorepo Structure

```
C:/Dev/
├── apps/
│   ├── patient-vite/          # Patient React App (PRODUCTION)
│   ├── practitioner-vite/     # Practitioner React App (PRODUCTION)
│   ├── shared-api/            # Shared Backend API (IN DEVELOPMENT)
│   ├── patient/               # Legacy Next.js (DEPRECATED)
│   ├── practitioner/          # Legacy Next.js (DEPRECATED)
│   └── web/                   # Legacy Next.js (DEPRECATED)
├── packages/
│   ├── shared-charts/         # Shared Chart Components (NEW)
│   ├── shared-core/           # Shared business logic
│   ├── shared-ui/             # Shared UI components
│   ├── shared-questionnaires/ # Questionnaire definitions
│   └── data-questionnaires/   # Questionnaire JSON data
├── functions/                 # Cloud Functions
├── firebase.json              # Firebase config
├── firestore.rules            # Security rules
└── pnpm-workspace.yaml        # Workspace config
```

## Key Concepts

### 1. Multi-Site Firebase Hosting

The project uses 3 Firebase Hosting sites:

- `neuronutrition-app-patient.web.app` - Patient frontend
- `neuronutrition-app-practitioner.web.app` - Practitioner frontend
- `neuronutrition-app.web.app` - Shared backend API (NEW)

### 2. User Roles & Authentication

- **Patient**: Self-service account, invitation-based signup
- **Practitioner**: Manages patients, assigns questionnaires
- **Admin**: (Not implemented yet)

### 3. Questionnaires System

The app uses 4 main questionnaires:

- **Plaintes et Douleurs**: Pain/complaints slider assessment
- **Life Journey (SIIN)**: 7 Spheres of Life (35 questions, weighted scoring)
- **Alimentaire**: Nutritional assessment
- **DNSM**: Neurotransmitter assessment

### 4. Life Journey - SIIN Method (Most Complex)

- **35 questions** across **7 spheres**
- **Weighted scoring**: 0-4 (standard), 0-8 (special), 0-12 (critical)
- **Total**: 180 points = 100%
- **Features**: Randomized answers, radar visualization, real-time calculations
- **Data Model**: Dual save (users/{uid}/surveys AND patients/{uid}/lifejourney/{id})

## Code Conventions

### File Naming

- React components: PascalCase (e.g., `LifeJourneyRadar.tsx`)
- Hooks: camelCase with "use" prefix (e.g., `usePatientLifeJourney.ts`)
- Utilities: camelCase (e.g., `calculations.ts`)
- Pages: PascalCase with "Page" suffix (e.g., `LifeJourneyPage.tsx`)

### Import Paths

```typescript
// Absolute imports with @/ alias (configured in tsconfig.json)
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';

// Workspace packages
import { LifeJourneyRadar } from '@neuronutrition/shared-charts';
import { SPHERES } from '@neuronutrition/shared-questionnaires';
```

### TypeScript

- Use strict mode
- Prefer `interface` over `type` for objects
- Use `const` over `let` whenever possible
- Avoid `any`, use `unknown` if type is truly unknown
- Use utility types: `Record<K, V>`, `Partial<T>`, `Pick<T, K>`

### React

- Functional components only (no class components)
- Use hooks for state and side effects
- Memoize expensive calculations with `useMemo`
- Memoize callbacks with `useCallback`
- Use `React.FC` sparingly (prefer explicit function signatures)

### Styling (Tailwind)

```tsx
// Good: utility-first, responsive, dark mode support
<div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm dark:bg-gray-800">

// Use project color scheme
bg-nn-primary-500       // Primary brand color
text-emerald-500        // Success
text-rose-500           // Error
text-amber-500          // Warning
bg-slate-950            // Dark background
```

## Firebase Integration

### Firestore Data Access

```typescript
// Import from firebase config
import { firestore } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, query, where } from 'firebase/firestore';

// Path patterns
const patientRef = doc(firestore, 'patients', uid);
const questionnairesRef = collection(firestore, 'patients', uid, 'questionnaires');
const lifejourneyRef = collection(firestore, 'patients', uid, 'lifejourney');
```

### Authentication

```typescript
// Use custom hook
import { useFirebaseUser } from '@/hooks/useFirebaseUser';

const { user, loading } = useFirebaseUser();
```

### Cloud Functions

```typescript
// Call from frontend
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const assignQuestionnaires = httpsCallable(functions, 'assignQuestionnaires');
const result = await assignQuestionnaires({ practitionerId: 'xxx' });
```

## Development Workflow

### Starting Development

```bash
# Patient app
cd apps/patient-vite && npm run dev

# Practitioner app
cd apps/practitioner-vite && npm run dev

# Shared API (when ready)
cd apps/shared-api && npm run dev
```

### Building for Production

```bash
# Build all apps
cd apps/patient-vite && npm run build
cd apps/practitioner-vite && npm run build
cd apps/shared-api && npm run build
```

### Deploying

```bash
# Deploy everything
npx firebase deploy

# Deploy specific targets
npx firebase deploy --only hosting:patient
npx firebase deploy --only hosting:practitioner
npx firebase deploy --only functions
```

## Common Tasks

### Creating a New Component

```typescript
// apps/patient-vite/src/components/MyComponent.tsx
import React from 'react';

interface MyComponentProps {
  title: string;
  onSubmit: (data: any) => void;
}

export default function MyComponent({ title, onSubmit }: MyComponentProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      {/* ... */}
    </div>
  );
}
```

### Creating a New Hook

```typescript
// apps/patient-vite/src/hooks/useMyData.ts
import { useState, useEffect } from 'react';
import { firestore } from '@/lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';

export function useMyData(userId: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = onSnapshot(
      query(collection(firestore, 'myCollection')),
      (snapshot) => {
        setData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { data, loading, error };
}
```

### Creating a New Cloud Function

```typescript
// functions/src/myFunction.ts
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

export const myFunction = onCall(async (request) => {
  const ctx = request.auth;
  if (!ctx) throw new HttpsError('unauthenticated', 'Auth required');

  const { param1 } = request.data;

  try {
    // Do something
    const result = await admin.firestore().collection('test').doc(param1).get();
    return { success: true, data: result.data() };
  } catch (error: any) {
    throw new HttpsError('internal', error.message);
  }
});
```

## Current Development Phase

### ✅ Completed

- Patient app Vite migration
- Practitioner app Vite migration
- Life Journey questionnaire (SIIN method)
- Invitation system with tokens
- Firestore security rules
- Cloud Functions (assignQuestionnaires, activatePatient)

### 🔄 In Progress

- **Phase 1**: Create `packages/shared-charts` to share chart components
- **Phase 2**: Create `apps/shared-api` for backend API endpoints

### 🎯 Next Steps

- Deploy shared-api to `neuronutrition-app.web.app`
- Implement REST API endpoints for questionnaires
- Implement PDF export functionality
- Clean up legacy Next.js apps
- Optimize repository structure

## Problem-Solving Approach

### Issue: Module Not Found

1. Check if package is installed: `pnpm list <package>`
2. Check if it's in the right workspace: `cat package.json`
3. Install if missing: `pnpm add <package>`
4. Check TypeScript paths: `tsconfig.json`

### Issue: Build Fails

1. Check error message carefully
2. Verify all imports are correct
3. Check for circular dependencies
4. Clear cache: `rm -rf node_modules .next dist && pnpm install`

### Issue: Firebase Deploy Fails

1. Check Firebase configuration: `firebase.json`
2. Verify build output exists: `ls apps/patient-vite/dist`
3. Check Firebase targets: `npx firebase target:apply hosting patient neuronutrition-app-patient`
4. Re-authenticate if needed: `npx firebase login`

## Best Practices

### State Management

- Keep state close to where it's used
- Lift state up only when necessary
- Use context for deeply nested state (avoid prop drilling)
- Use custom hooks to encapsulate complex state logic

### Performance

- Memoize expensive calculations with `useMemo`
- Memoize callbacks passed to children with `useCallback`
- Use lazy loading for routes: `React.lazy(() => import('./Page'))`
- Optimize images and assets
- Use code splitting for large bundles

### Security

- Always validate user input
- Use Firestore rules to enforce access control
- Never trust client-side data in Cloud Functions
- Sanitize user-generated content
- Use HTTPS everywhere

### Error Handling

```typescript
try {
  const result = await riskyOperation();
  setData(result);
} catch (error: any) {
  console.error('[Component] Error:', error);
  setError(error?.message || String(error));
} finally {
  setLoading(false);
}
```

## Debugging

### Frontend

- Use React DevTools browser extension
- Use `console.log('[Component] Context:', variable)` with component name prefix
- Check Network tab for API calls
- Check Firestore tab in Firebase Console

### Backend (Cloud Functions)

- View logs: `npx firebase functions:log`
- Use `logger.info()` instead of `console.log()`
- Test locally with emulators: `npx firebase emulators:start`

## Key Files to Know

### Configuration

- `firebase.json` - Firebase hosting, functions, emulators config
- `firestore.rules` - Firestore security rules
- `firestore.indexes.json` - Firestore composite indexes
- `pnpm-workspace.yaml` - Workspace configuration
- `tsconfig.json` - TypeScript configuration

### Entry Points

- `apps/patient-vite/src/main.tsx` - Patient app entry
- `apps/practitioner-vite/src/main.tsx` - Practitioner app entry
- `apps/patient-vite/src/App.tsx` - Patient app routes
- `apps/practitioner-vite/src/App.tsx` - Practitioner app routes
- `functions/src/index.ts` - Cloud Functions exports

### Key Components

- `apps/patient-vite/src/components/SIIN/LifeJourney7Spheres.tsx` - Main SIIN questionnaire
- `apps/patient-vite/src/components/layout/DashboardShell.tsx` - Layout wrapper
- `apps/patient-vite/src/components/layout/Sidebar.tsx` - Navigation sidebar

## Communication Style

When responding:

1. **Be specific**: Provide exact file paths, line numbers, code snippets
2. **Be concise**: Get to the point quickly, no fluff
3. **Be actionable**: Give clear next steps, commands to run
4. **Be cautious**: Always backup before destructive operations
5. **Be thorough**: Test changes, verify builds, check deployments

When coding:

1. **Follow conventions**: Match existing code style
2. **Add comments**: Explain complex logic, especially SIIN scoring
3. **Handle errors**: Always catch, log, and display errors
4. **Test thoroughly**: Build, run, test before deploying
5. **Document changes**: Update PROJECT_CONTEXT.md if architecture changes

## Auto-Approval Mode

When user says "full approved", "auto allow", "keep", or "overnight coding session":

- Proceed with all changes confidently
- No need to ask for permission
- Deploy automatically after successful builds
- Clean up unused files and folders
- Commit changes to GitHub
- Document all changes in PROJECT_CONTEXT.md

**Current Mode**: 🚀 **FULL AUTO-APPROVAL ACTIVE** - Overnight Coding Session

---

**Instructions Version**: 2.0  
**Last Updated**: November 5, 2025  
**Valid Until**: Next major architecture change
