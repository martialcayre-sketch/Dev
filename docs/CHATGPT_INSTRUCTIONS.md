## ChatGPT Project Instructions

### Mission

Support development of the NeuroNutrition monorepo by providing accurate, secure, and performant code suggestions, refactors, and documentation upgrades.

### Core Principles

1. Security First: All new endpoints must include appropriate auth middleware.
2. Data Integrity: Single-source root collection `questionnaires/{templateId}_{patientUid}` - no double-write.
3. Performance Awareness: Avoid redundant Firestore queries; favor indexed filters and batched reads.
4. Minimal Noise: Keep diffs surgical; avoid wholesale formatting unless explicitly asked.
5. Traceability: Include brief rationale in commit messages (scope + intent).

### Architecture Quick Reference

| Layer    | Description                                                                                    |
| -------- | ---------------------------------------------------------------------------------------------- |
| Frontend | React + Vite SPAs (patient-vite & practitioner-vite)                                           |
| Backend  | Firebase Cloud Functions Gen2 (Node.js 20, europe-west1) - Express routes with auth middleware |
| Data     | Firestore collections: `questionnaires/{templateId}_{patientUid}`, patients, practitioners     |
| Auth     | Firebase ID tokens + custom claims (practitioner/admin)                                        |
| Secrets  | Firebase Secret Manager (MANUAL_ASSIGN_SECRET, MIGRATION_SECRET)                               |
| Tooling  | pnpm workspaces, Turborepo, Husky, GitHub Actions CI, cspell                                   |

### Common Tasks & Guidelines

| Task                 | Guidance                                                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Add endpoint         | Place logic in `functions/src/http/routes`; add auth middleware. Return normalized JSON. Use idempotency docs for mutations.  |
| Modify questionnaire | Update `packages/shared-questionnaires`; ensure ID format `{templateId}_{patientUid}` in root collection.                     |
| Frontend feature     | Wrap risky code paths with ErrorBoundary; leverage React Query or SWR for data fetching.                                      |
| Migration script     | Use `scripts/audit-questionnaires.mjs`, `backfill-questionnaires.mjs`, `purge-legacy-questionnaires.mjs` for data operations. |
| Doc update           | Keep docs synchronized with deployed architecture; mark legacy patterns as deprecated.                                        |

### Authorization Matrix (Simplified – includes DNSM score access)

| Actor        | Patient Data      | Questionnaire Submit | Questionnaire Complete | DNSM Scores       | Practitioner Data |
| ------------ | ----------------- | -------------------- | ---------------------- | ----------------- | ----------------- |
| Patient      | Own only          | Yes (own)            | No                     | Own / Assigned    | Limited (self)    |
| Practitioner | Assigned patients | No                   | Yes (assigned)         | Assigned patients | Own only          |
| Admin        | All               | Yes                  | Yes                    | All               | All               |

### Error Handling Rules

1. Do not leak internal Firestore errors; respond with generic 500 JSON.
2. For auth failures: 401 (missing/invalid token), 403 (insufficient role/ownership).
3. Use consistent shape: `{ error: string }` for failure, domain-specific keys for success.

### Testing Expectations

| Scope                   | Tool              | Minimal Required Cases                     |
| ----------------------- | ----------------- | ------------------------------------------ |
| Cache                   | Vitest            | Set/get, TTL expire, invalidate            |
| Auth middleware         | Jest              | Valid token, expired token, missing claims |
| Questionnaire endpoints | Emulator (future) | List, submit, complete transitions         |

### Performance Tips

1. Derive progress on the fly—use `serializeQuestionnaireDoc` helper (no stored counters).
2. Prefer field merges (`set(..., { merge: true })`) over full document overwrites.
3. Use cursor-based pagination (`nextCursor`) for large practitioner listings; avoid in-memory offsets.
4. Increase polling delays for low-volatility data; trigger manual refresh on focus events.

### Style & Patterns

1. Use functional components; hooks for data retrieval.
2. Keep middleware pure (no side effects beyond logging and auth decisions).
3. Keep shared types in dedicated `types` files; avoid scattering duplication.

### Maintenance Scripts (Migration & Audit)

| Script                            | Purpose                                               | Usage                                                                 |
| --------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------- |
| `audit-questionnaires.mjs`        | Audit root vs subcollections consistency              | `node scripts/audit-questionnaires.mjs --all --csv audit.csv`         |
| `backfill-questionnaires.mjs`     | Copy subcollection docs to root with ID normalization | `node scripts/backfill-questionnaires.mjs --all --limit 500`          |
| `purge-legacy-questionnaires.mjs` | Secure purge of legacy subcollections                 | `node scripts/purge-legacy-questionnaires.mjs --all --confirm delete` |

**Note**: All legacy double-write scripts are in `scripts/_deprecated/` and should NOT be used.

### Forbidden / Caution

| Item                        | Reason                              |
| --------------------------- | ----------------------------------- |
| Hardcoded secrets           | Security risk                       |
| Excessive console logs      | Noise; production rule rejects them |
| Unindexed Firestore queries | Performance degradation             |
| Swallowing errors silently  | Debugging difficulty                |
| Legacy double-write code    | Deprecated; use root-only storage   |

### Recommended Commit Prefixes

`feat:` new feature
`fix:` bug fix
`perf:` performance tweak
`chore:` tooling or housekeeping
`docs:` documentation changes
`test:` adding or updating tests

### Branch Strategy

Feature branches → PR to `main` after passing CI (lint, typecheck, test, build). Small, incremental changes favored.

### How to Ask ChatGPT Effectively

Provide:

1. The target file(s) or entrypoint.
2. Desired behavior or user story.
3. Constraints (perf, security, compatibility).
4. Existing related types or helpers (paste if complex).

### Quick Diagnostics Checklist

1. `pnpm typecheck` passes? (TS integrity)
2. `pnpm lint` passes? (Style & safety)
3. `pnpm test` green? (Functional correctness)
4. `pnpm build` succeeds? (Production readiness)
5. Spellcheck noise acceptable? (Low false positives)

### Recent Enhancements (November 2025)

- ✅ Root-only questionnaire storage (`questionnaires/{templateId}_{patientUid}`)
- ✅ Secure migration scripts with audit, backfill, and purge capabilities
- ✅ Firebase Secret Manager integration for sensitive credentials
- ✅ Legacy subcollection purge completed (8/8 documents deleted)
- ✅ Comprehensive documentation updates for root-only architecture

### Future Enhancements Candidates

- Implement background job for questionnaire analytics aggregation
- Extend E2E test coverage for multi-step patient flows (Playwright)
- Add Cloud Scheduler for automated questionnaire integrity monitoring
- Implement OpenTelemetry lightweight tracing for Cloud Functions

---

This instruction file guides ChatGPT usage for consistent, safe, and efficient collaboration on the NeuroNutrition codebase.
