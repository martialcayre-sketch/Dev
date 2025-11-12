# ChatGPT Project Instructions - NeuroNutrition App

## 🎯 Project Identity

**Project Name:** NeuroNutrition App  
**Project Type:** Healthcare Web Application (Practitioner-Patient Management System)  
**Primary Goal:** Enable practitioners to manage patients and assign health questionnaires; allow patients to complete questionnaires and view their results.  
**Tech Stack:** React + TypeScript + Vite + Firebase (Firestore, Auth, Functions, Hosting)  
**Development Environment:** Alpine Linux, Node 22.16.0, pnpm 10.22.0  
**Repository:** GitHub (martialcayre-sketch/Dev)

## 📂 Project Structure

This is a **pnpm monorepo** with 13 packages:

```
C:/Dev/
├── apps/
│   ├── patient-vite/          # Patient web app (React + Vite, TypeScript)
│   ├── practitioner-vite/     # Practitioner web app (React + Vite, TypeScript)
│   └── mobile/                # React Native app (not currently used)
├── packages/
│   ├── shared-core/           # Shared business logic, types, utilities
│   ├── shared-ui/             # Reusable UI components (Tailwind + shadcn/ui)
│   ├── shared-charts/         # Chart components (Recharts wrapper)
│   ├── shared-questionnaires/ # Questionnaire definitions and logic
│   ├── shared-api/            # API client utilities
│   ├── data-questionnaires/   # JSON data for questionnaires
│   └── corpus-ia/             # AI/ML utilities (future)
├── functions/                 # Firebase Cloud Functions (Node 20, TypeScript)
├── firebase.json              # Firebase multi-site hosting configuration
├── firestore.rules            # Firestore security rules
├── pnpm-workspace.yaml        # Workspace configuration
└── turbo.json                 # Turborepo build cache configuration
```

## 🚀 How to Work with This Project

### Understanding the Architecture

1. **Frontend Apps:** Two separate React SPAs

   - **Patient App:** Runs on port 3020, deployed to `neuronutrition-app-patient.web.app`
   - **Practitioner App:** Runs on port 3010, deployed to `neuronutrition-app-practitioner.web.app`

2. **Shared Packages:** Reusable code shared between apps

   - Use workspace protocol: `"@neuronutrition/shared-core": "workspace:*"`
   - Located in `packages/` directory

3. **Backend:** Firebase Cloud Functions (serverless, Node 20)

   - `assignQuestionnaires`: Auto-assign default questionnaires to new patients
   - `activatePatient`: Initialize patient account on signup
   - `invitePatient`: Handle practitioner invitations

4. **Database:** Firestore (NoSQL)

   - Collections: `patients`, `practitioners`, `users`, `invitationTokens`
   - Security enforced via `firestore.rules`

5. **DevOps & Tooling:**
   - **Package Manager:** pnpm 10.22.0 (hash-verified workspace protocol)
   - **Build System:** Turbo 2.6.1 (parallel execution, smart caching)
   - **Runtime:** Node.js 22.16.0 (Alpine Linux compatibility)
   - **Firebase Admin:** 13.6.0 (latest stable)
   - **Container:** Docker Alpine with optimized Windows WSL 2 support

### Common Development Tasks

#### Starting Development Servers

```bash
# Patient app (port 3020)
pnpm dev:patient

# Practitioner app (port 3010)
pnpm dev:practitioner

# Firebase emulators (Firestore, Auth, Functions)
pnpm dev:emu
```

#### Building the Project

```bash
# Build all packages (uses Turbo cache with parallel execution)
pnpm build

# Build only frontend apps
pnpm build:web

# TypeScript check across all packages
pnpm typecheck

# Lint all packages
pnpm lint

# Build specific package
pnpm --filter @neuronutrition/patient-vite build
```

#### Deploying to Production

```bash
# Deploy patient app
firebase deploy --only hosting:patient

# Deploy practitioner app
firebase deploy --only hosting:practitioner

# Deploy Cloud Functions
firebase deploy --only functions

# Deploy everything
firebase deploy
```

#### Running Tests

```bash
# Unit tests (Jest) - Functions
pnpm -C functions test

# E2E tests (Playwright)
pnpm exec playwright test

# Specific E2E test
pnpm exec playwright test e2e/auth-debug.spec.ts
```

## 🎓 Key Concepts

### 1. Questionnaires System

The app manages several types of questionnaires:

- **Life Journey (SIIN Method):** 35 questions across 7 life spheres

  - Spheres: Sleep, Biological Rhythm, Stress, Physical Activity, Toxic Exposure, Social Relations, Nutrition
  - Weighted scoring: 0-180 points total
  - Results displayed as radar chart

- **Complaints & Pain (Plaintes et Douleurs):** Slider-based assessment (1-10 scale)
- **Nutrition (Alimentaire):** DayFlow food tracking
- **DNSM:** Neurotransmitter assessment

### 2. Authentication Flow

**Patient Signup:**

1. Practitioner creates invitation token
2. Patient receives invitation email
3. Patient signs up with token
4. Cloud Function `activatePatient` creates Firestore document
5. Cloud Function `assignQuestionnaires` assigns default questionnaires

**Practitioner Signin:**

1. Admin manually creates practitioner account
2. Practitioner signs in with email/password
3. Can manage patients and view results

### 3. Data Security

Firestore rules enforce:

- Patients can only read/write their own data
- Practitioners can read their patients' data (verified via `practitionerId`)
- No public read/write access

### 4. Performance Optimizations

Recent optimizations (Nov 10, 2025):

- Code splitting with React.lazy() for routes
- Manual chunks: react-vendor, firebase, charts, questionnaires
- Bundle sizes reduced by 60% (patient: 454KB, practitioner: 452KB)
- Lazy loading for heavy components
- Turbo cache for fast rebuilds

## 📝 Coding Standards

### TypeScript

- Always use strict mode
- Explicit return types for public functions
- Use `type` for simple types, `interface` for objects with methods
- Runtime validation with Zod schemas
- No `any` types unless absolutely necessary

### React

- Functional components only (no class components)
- Use hooks: `useState`, `useEffect`, `useMemo`, `useCallback`
- Custom hooks for reusable logic (prefix with `use`)
- Lazy load heavy components: `const Page = lazy(() => import('./Page'))`
- Always wrap routes in `<ErrorBoundary>`

### File Naming

- Components: `PascalCase.tsx` (e.g., `PatientDashboard.tsx`)
- Hooks: `useCamelCase.ts` (e.g., `useAuth.ts`)
- Utils: `camelCase.ts` (e.g., `calculateScore.ts`)
- Types: `types.ts` or dedicated `@types` folder

### Imports Organization

```typescript
// 1. React imports
import { useState, useEffect } from 'react';

// 2. External libraries
import { collection, query, getDocs } from 'firebase/firestore';

// 3. Internal imports
import { calculateScore } from '@/utils/scoring';
import { PatientCard } from '@/components/PatientCard';

// 4. Types
import type { Patient, Questionnaire } from '@/types';
```

## 🔧 Key Files to Understand

### Configuration Files

1. **firebase.json** - Multi-site hosting configuration

   - Defines patient, practitioner, and API hosting targets
   - Sets up rewrites for SPA routing

2. **firestore.rules** - Database security rules

   - Patient data access rules
   - Practitioner permissions
   - Validation rules

3. **vite.config.ts** (in each app)

   - Code splitting configuration
   - Bundle analyzer plugin
   - Path aliases

4. **tsconfig.base.json** - TypeScript base configuration

   - Shared TypeScript settings for all packages
   - No `baseUrl` (deprecated)
   - Strict mode enabled

5. **.github/workflows/ci.yml** - CI/CD pipeline
   - Builds all packages
   - Runs tests
   - Uses Node 20.18.0 and corepack

### Core Application Files

**Patient App:**

- `apps/patient-vite/src/App.tsx` - Main app with lazy-loaded routes
- `apps/patient-vite/src/pages/` - All page components
- `apps/patient-vite/src/components/` - Reusable components

**Practitioner App:**

- `apps/practitioner-vite/src/App.tsx` - Main app with lazy-loaded routes
- `apps/practitioner-vite/src/pages/` - All page components
- `apps/practitioner-vite/src/components/` - Reusable components

**Shared Packages:**

- `packages/shared-core/src/types.ts` - Shared TypeScript types
- `packages/shared-charts/src/LifeJourneyRadar.tsx` - Radar chart component
- `packages/shared-questionnaires/src/` - Questionnaire definitions

**Cloud Functions:**

- `functions/src/assignQuestionnaires.ts` - Auto-assign questionnaires
- `functions/src/activatePatient.ts` - Patient activation logic
- `functions/src/invitePatient.ts` - Invitation system

## 🚨 Common Issues & Solutions

### Issue: Build Fails with Module Not Found

**Cause:** Missing dependency or incorrect workspace reference  
**Solution:**

```bash
# Install missing dependency in specific package
pnpm add <package> --filter <workspace-name>

# Update workspace references
pnpm install
```

### Issue: Firebase Emulators Not Starting

**Cause:** Port already in use or emulator config issue  
**Solution:**

```bash
# Check if ports are in use (9099, 5003, 8080, 5001)
# Kill processes on those ports
# Restart emulators
pnpm dev:emu
```

### Issue: Large Bundle Size Warnings

**Cause:** Importing entire libraries or not using code splitting  
**Solution:**

- Use lazy loading for routes
- Import specific functions from libraries
- Check bundle stats: `apps/*/dist/stats.html`

### Issue: TypeScript Errors in IDE

**Cause:** Outdated TypeScript server or missing type definitions  
**Solution:**

```bash
# Restart TypeScript server in VS Code
# Install missing type definitions
pnpm add -D @types/<package>
```

### Issue: Firestore Permission Denied

**Cause:** Security rules not allowing operation  
**Solution:**

- Check `firestore.rules`
- Verify user authentication
- Check document path matches rule patterns

## 🎯 Feature Development Guidelines

### Adding a New Questionnaire

1. Define questionnaire structure in `packages/shared-questionnaires/src/`
2. Add JSON data in `packages/data-questionnaires/`
3. Create questionnaire component in patient app
4. Add chart visualization in practitioner app
5. Update Cloud Function to include in default assignments
6. Add Firestore indexes if needed
7. Test with Firebase emulators

### Adding a New Shared Component

1. Create component in `packages/shared-ui/src/`
2. Export from `packages/shared-ui/src/index.ts`
3. Add to package.json dependencies in apps that use it
4. Import and use: `import { Component } from '@neuronutrition/shared-ui'`

### Adding a New Cloud Function

1. Create function file in `functions/src/`
2. Export from `functions/src/index.ts`
3. Add environment variables if needed
4. Test with emulators
5. Deploy: `firebase deploy --only functions:<functionName>`

## 📊 Performance Monitoring

### Bundle Analysis

After building, check `apps/*/dist/stats.html` for:

- Chunk sizes (should be < 500KB)
- Duplicate dependencies
- Large third-party libraries

### Firebase Performance

Monitor in Firebase Console:

- Function execution times
- Firestore read/write counts
- Hosting bandwidth usage

## 🔒 Security Best Practices

1. **Never commit secrets** - Use Firebase environment config
2. **Validate all user input** - Use Zod schemas
3. **Enforce Firestore rules** - Test rules thoroughly
4. **Use Firebase Auth tokens** - Never create custom auth
5. **Sanitize user data** - Before displaying or storing
6. **Use HTTPS only** - Firebase Hosting enforces this

## 📚 Additional Resources

- **Build Instructions:** [BUILD.md](../BUILD.md) - Complete setup and build guide
- **Firebase Status:** [FIREBASE_STATUS.md](../FIREBASE_STATUS.md) - Production status and deployment info
- **Windows Setup:** [DEVCONTAINER_WINDOWS.md](../DEVCONTAINER_WINDOWS.md) - Windows-specific devcontainer setup
- **Firebase Documentation:** https://firebase.google.com/docs
- **React Documentation:** https://react.dev
- **Vite Guide:** https://vitejs.dev/guide
- **Recharts API:** https://recharts.org/en-US/api
- **Tailwind CSS:** https://tailwindcss.com/docs
- **TypeScript Handbook:** https://www.typescriptlang.org/docs

## 🤖 AI Assistant Instructions

When helping with this project:

1. **Understand context first** - Read existing code before suggesting changes
2. **Follow patterns** - Use existing patterns in the codebase
3. **Consider performance** - Check bundle size impact
4. **Write tests** - Suggest tests for new features
5. **Document code** - Add comments for complex logic
6. **Think security** - Consider Firestore rules and auth
7. **Be specific** - Provide complete, working code examples
8. **Explain trade-offs** - Discuss pros/cons of suggested solutions

### Preferred Code Style

```typescript
// ✅ GOOD: Explicit types, error handling, clean logic
export async function getPatientQuestionnaires(patientId: string): Promise<Questionnaire[]> {
  try {
    const q = query(
      collection(db, 'patients', patientId, 'questionnaires'),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Questionnaire)
    );
  } catch (error) {
    console.error('Failed to fetch questionnaires:', error);
    throw new Error('Unable to load questionnaires');
  }
}
```

### When Debugging

1. Check Firebase Console logs
2. Verify Firestore security rules
3. Inspect Network tab for failed requests
4. Check TypeScript errors in IDE
5. Review bundle stats if performance issue
6. Test with Firebase emulators locally

---

**This project is actively maintained and optimized for production use. Always test changes with Firebase emulators before deploying to production.**
