## Project Context for AI Assistants (Copilot / Codex)

### High-Level Overview

NeuroNutrition is a monorepo (pnpm workspaces) containing:

- Frontend SPA apps (patient-vite, practitioner-vite) built with Vite + React + TypeScript.
- Firebase Cloud Functions Gen2 (Node.js 20, europe-west1) for secure serverless HTTP endpoints and callables.
- Shared packages: questionnaires, UI components, charts, core utilities, data-questionnaires.
- Tooling: Turborepo task orchestration (`turbo.json`), Husky pre-commit checks, GitHub Actions CI.
- Scripts: Maintenance tools for questionnaire audit, backfill, and legacy purge.

### Primary Domains

1. Questionnaires life cycle (assign to root collection, answer, submit, complete).
2. Patient registration and activation flow.
3. Practitioner dashboard (metrics, analytics, patient management).
4. Authentication / Authorization (Firebase ID tokens, role & ownership checks).
5. Data integrity (audit, backfill, legacy purge scripts).

### Tech Stack Summary

| Layer    | Tech                                                                                |
| -------- | ----------------------------------------------------------------------------------- |
| Frontend | React 18, Vite 7.2.2, TypeScript 5.9.3 (strict), TailwindCSS                        |
| Backend  | Firebase Cloud Functions Gen2 (Node.js 20, europe-west1) - Express HTTP + callables |
| Data     | Firestore: `questionnaires/{templateId}_{patientUid}`, patients, practitioners      |
| Auth     | Firebase Auth + custom claims (practitioner/admin)                                  |
| Secrets  | Firebase Secret Manager (MANUAL_ASSIGN_SECRET, MIGRATION_SECRET)                    |
| Tooling  | pnpm 10.22.0, Turborepo, Jest (functions), Vitest (apps), Husky, cspell             |

### TypeScript & Build Guidelines (v3 Compliance)

**Critical Patterns for AI:**

1. **Cloud Functions**: Use `require()` for shared packages due to ES6 import resolution issues
2. **Frontend Apps**: Use `useFirebaseUser` hook instead of missing `useAuth` context
3. **UI Components**: Create local substitutes when @/components/ui/\* are missing
4. **Type Safety**: Explicit casting for Firebase Query vs CollectionReference conflicts
5. **Build Validation**: Target < 15s build time, < 400KB main chunks

**Import Patterns:**

```typescript
// ✅ Cloud Functions
const { validateUser } = require('@neuronutrition/shared-core');

// ✅ Frontend Apps
import { useFirebaseUser } from '@/hooks/useFirebaseUser';

// ❌ Avoid these patterns
import { useAuth } from '@/contexts/AuthContext'; // Missing
import { toast } from 'sonner'; // Missing package
```

**Validation Commands:**

- `pnpm typecheck` - Workspace TypeScript validation
- `npm run build` in functions/, apps/patient-vite/, apps/practitioner-vite/
- Target: 0 TypeScript errors, stable builds

### Key Conventions

1. Firestore timestamps are serialized to ISO strings in client responses.
2. **Root-only storage**: Questionnaires are stored exclusively in `questionnaires/{templateId}_{patientUid}`. Legacy subcollections have been purged.
3. Authorization rules:
   - Patient endpoints require same UID or practitioner/admin role.
   - Practitioner endpoints validate practitioner custom claims.
4. Idempotency: `submit`/`complete` operations create idempotency documents to prevent duplicate processing.
5. Error resilience: Global React `ErrorBoundary` wraps app roots.
6. Code style enforced via ESLint; structured logging where needed.
7. Secrets managed via Firebase Secret Manager and mirrored in `/.secrets/functions.env` for local development.

### Security Guidelines

1. Never return raw internal error objects—log internally, send generic messages externally.
2. Validate IDs and ownership before mutating questionnaire or consultation data.
3. Ensure middleware order: public health/hello routes precede `authenticateToken` usage.
4. Rate limiting global + per-action (`responses` 30/min, `submit` & `complete` 10/min) & `helmet` applied for abuse mitigation and header hardening.
5. Move secrets (service account keys) outside repository (already done) and never commit ephemeral credentials.

### Performance Guidelines

1. Prefer incremental questionnaire response saves (PATCH) over whole payload rewrites.
2. Use TTL caching for high-frequency GET endpoints; increase polling intervals for low-change data.
3. Tree-shake front-end dependencies (lucide icons—import specific icons only).
4. Avoid N+1 Firestore queries; batch or parallelize when reading patient metadata.

### Testing Strategy

| Area                      | Tool                 | Notes                          |
| ------------------------- | -------------------- | ------------------------------ |
| Functions auth middleware | Jest                 | Unit + token expiry edge cases |
| SPA cache behavior        | Vitest               | TTL expiration + invalidation  |
| Questionnaire endpoints   | Integration (Future) | Emulators recommended          |

### Maintenance Scripts

| Script                            | Purpose                                                             | Key Options                                              |
| --------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------- |
| `audit-questionnaires.mjs`        | Audit root vs subcollections consistency                            | `--all`, `--email`, `--patientUid`, `--csv`, `--verbose` |
| `backfill-questionnaires.mjs`     | Copy subcollection docs to root with ID normalization               | `--all`, `--email`, `--force`, `--dry-run`               |
| `purge-legacy-questionnaires.mjs` | Secure purge of legacy subcollections (requires `--confirm delete`) | `--all`, `--csv`, `--verbose`                            |

**Deprecated scripts** in `scripts/_deprecated/`: All legacy double-write and migration scripts have been archived.

### Common Edge Cases

1. Missing questionnaire document → return 404 (no fallback to subcollection).
2. Expired Firebase ID token → respond 401 (ensure refresh logic client-side).
3. Race conditions in questionnaire status updates → use idempotency documents.
4. Partial response merges (responses object may be sparse) → always merge; never overwrite absent answers.
5. ID format validation: Always use `{templateId}_{patientUid}` for root collection documents.

### Folder Cheatsheet

```
apps/patient-vite/src        Patient SPA (production)
apps/practitioner-vite/src    Practitioner SPA (production)
functions/src/http            Cloud Functions Express HTTP routes
functions/src/                Cloud Functions callables and triggers
packages/shared-questionnaires Questionnaire definitions & shared logic
scripts/                      Maintenance scripts (audit, backfill, purge)
scripts/_deprecated/          Archived legacy scripts
docs/                         Project documentation
```

### Turborepo Tasks (Root Scripts)

`pnpm build` → `turbo run build` across workspaces.
`pnpm typecheck` → TS project builds / diagnostics.
`pnpm lint` → ESLint across packages.
`pnpm test` → Jest (functions) + Vitest (apps).
`pnpm spellcheck` → cspell multi-language check.

### Pull Request Review Checklist

1. Auth: Are new endpoints protected with appropriate middleware? (patient vs practitioner vs admin)
2. Data consistency: Double-write patterns preserved if touching questionnaires.
3. Logs: No stray `console.log` in production code; use structured logging where needed.
4. Error boundaries: UI routes maintain user feedback on crashes.
5. Dependency hygiene: No large unused libraries; ensure version alignment with Node 20.

### Extending the System

When adding a new questionnaire type:

1. Define schema & metadata in `packages/shared-questionnaires`.
2. Update assignment logic in `functions/src/assignQuestionnaires.ts` to include new template.
3. Store in root collection `questionnaires/{templateId}_{patientUid}` only.
4. Provide UI component(s) and integrate into patient/practitioner apps.
5. Test with audit script to ensure proper ID format and storage location.

### Glossary

| Term                 | Meaning                                                             |
| -------------------- | ------------------------------------------------------------------- |
| In-progress          | Questionnaire partially answered                                    |
| Submitted            | Patient finished answering, pending practitioner review             |
| Completed            | Practitioner marked as finalized                                    |
| Root-only            | Single storage location: `questionnaires/{templateId}_{patientUid}` |
| Legacy subcollection | Deprecated storage at `patients/{uid}/questionnaires/{id}`          |
| Idempotency doc      | Firestore document preventing duplicate submit/complete operations  |

### DO / DO NOT (AI Guidance)

DO: Suggest performance optimizations with Firestore query reduction.
DO: Provide strongly typed interfaces when adding new modules.
DO: Use root collection `questionnaires/{templateId}_{patientUid}` for all questionnaire operations.
DO: Reference maintenance scripts in `scripts/` for data operations.
DO NOT: Expose private tokens or internal error stack traces.
DO NOT: Remove auth middleware without replacement.
DO NOT: Use legacy subcollection paths `patients/{uid}/questionnaires/{id}`.
DO NOT: Use deprecated scripts in `scripts/_deprecated/`.

### Completed Improvements (November 2025)

- ✅ Migrated to root-only questionnaire storage with secure purge of legacy subcollections.
- ✅ Implemented comprehensive audit, backfill, and purge scripts.
- ✅ Firebase Secret Manager integration for sensitive credentials.
- ✅ Archived all legacy double-write scripts in `scripts/_deprecated/`.

### Future Improvements (Backlog)

- Add integration test suite using Firestore emulator.
- Add OpenTelemetry lightweight tracing.
- Implement Cloud Scheduler for periodic questionnaire integrity audits.
- Expand E2E test coverage with Playwright.

---

This context file is intentionally concise but comprehensive to guide AI assistance without leaking secrets.
