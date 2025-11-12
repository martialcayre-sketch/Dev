## Project Context for AI Assistants (Copilot / Codex)

### High-Level Overview

NeuroNutrition is a monorepo (pnpm workspaces) containing:

- Frontend SPA apps (patient, practitioner) built with Vite + React + TypeScript.
- Firebase Cloud Functions (Node 20) for secure serverless HTTP endpoints.
- A Cloud Run API (Express) providing backend-first questionnaire, consultation, analytics routes.
- Shared packages: questionnaires, UI components, charts, core utilities, data-questionnaires.
- Tooling: Turborepo task orchestration (`turbo.json`), Husky pre-commit checks, GitHub Actions CI.

### Primary Domains

1. Questionnaires life cycle (assign, answer, submit, complete).
2. Patient Consultation (identification + anamnèse forms).
3. Practitioner dashboard (metrics, analytics, patient management).
4. Authentication / Authorization (Firebase ID tokens, role & ownership checks).

### Tech Stack Summary

| Layer       | Tech                                                                                  |
| ----------- | ------------------------------------------------------------------------------------- |
| Frontend    | React 18, Vite, TypeScript, TailwindCSS                                               |
| Serverless  | Firebase Functions v2 (Express middleware pattern)                                    |
| Backend API | Express on Cloud Run (hardened: validation, granular rate limits, structured logging) |
| Data        | Firestore (patients, questionnaires, consultation subcollections)                     |
| Auth        | Firebase Auth + custom claims (practitioner/admin)                                    |
| Tooling     | pnpm, Turborepo, Jest (functions), Vitest (front), Husky, cspell                      |

### Key Conventions

1. Firestore documents store timestamps; central serializer (`api/src/lib/serialization.js`) normalizes them to ISO strings & computes progress.
2. Double-write pattern for questionnaires: root collection + patient subcollection for backward compatibility.
3. Authorization rules:
   - Patient endpoints require same UID or practitioner/admin role.
   - Practitioner endpoints must validate practitioner role (custom claims).
4. Caching on client: `requestCache` (in-memory TTL) reduces redundant fetches.
5. Error resilience: Global React `ErrorBoundary` wraps app roots.
6. Code style enforced via ESLint; structured logging via pino (`api/src/lib/logger.js`) replaces `console.log` (correlation id middleware `request-id`).
7. Idempotency keys: Endpoints `submit`/`complete` accept header `Idempotency-Key` to ensure safe retries.
8. Pagination par curseur: Listing praticien retourne `nextCursor` (base64 `assignedAt|docId`) pour requêtes suivantes.

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

### Common Edge Cases

1. Missing questionnaire document → fallback to subcollection.
2. Expired Firebase ID token → respond 401 (ensure refresh logic client-side).
3. Race conditions in questionnaire status updates (in_progress vs submitted) → guard checks before state transitions.
4. Partial response merges (responses object may be sparse) → always merge; never overwrite absent answers with null.
5. Timestamp serialization from Firestore (handling `_seconds` vs `toDate()`).

### Folder Cheatsheet

```
apps/patient-vite/src        Patient SPA
apps/practitioner-vite/src    Practitioner SPA
functions/src/http            Cloud Functions Express handlers
api/src                       Cloud Run Express server & routes
packages/shared-questionnaires Questionnaire definitions & shared logic
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

1. Define schema & metadata in shared questionnaire package.
2. Ensure Firestore storage structure (root + optional patient subcollection).
3. Update serialization helpers if new fields require transformation.
4. Provide UI component(s) and integrate into practitioner tools library.

### Glossary

| Term         | Meaning                                                 |
| ------------ | ------------------------------------------------------- |
| In-progress  | Questionnaire partially answered                        |
| Submitted    | Patient finished answering, pending practitioner review |
| Completed    | Practitioner marked as finalized                        |
| Double-write | Persist to both root and patient subcollection          |

### DO / DO NOT (AI Guidance)

DO: Suggest performance optimizations with Firestore query reduction.
DO: Provide strongly typed interfaces when adding new modules.
DO NOT: Expose private tokens or internal error stack traces.
DO NOT: Remove auth middleware without replacement.

### Future Improvements (Backlog)

- Replace double-write with single canonical storage + Cloud Function backfill.
- Add integration test suite using Firestore emulator.
- Structured logging (pino) + correlation IDs implemented.
- Add OpenTelemetry lightweight tracing.
- Expand lightweight validation to schema-based (zod) if complexity increases.

---

This context file is intentionally concise but comprehensive to guide AI assistance without leaking secrets.
