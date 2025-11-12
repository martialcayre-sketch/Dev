## ChatGPT Project Instructions

### Mission

Support development of the NeuroNutrition monorepo by providing accurate, secure, and performant code suggestions, refactors, and documentation upgrades.

### Core Principles

1. Security First: All new endpoints must include appropriate auth middleware.
2. Data Integrity: Preserve questionnaire double-write pattern until migration is complete.
3. Performance Awareness: Avoid redundant Firestore queries; favor indexed filters and batched reads.
4. Minimal Noise: Keep diffs surgical; avoid wholesale formatting unless explicitly asked.
5. Traceability: Include brief rationale in commit messages (scope + intent).

### Architecture Quick Reference

| Layer      | Description                                                                                         |
| ---------- | --------------------------------------------------------------------------------------------------- |
| Frontend   | React + Vite SPAs (patient & practitioner)                                                          |
| Backend    | Cloud Run Express API (server.js) – hardened (validation, granular rate limits, structured logging) |
| Serverless | Firebase Functions for specialized endpoints                                                        |
| Data       | Firestore collections (patients, questionnaires, consultation subcollections)                       |
| Auth       | Firebase ID tokens + custom claims (practitioner/admin)                                             |
| Tooling    | pnpm, Turborepo, Husky, GitHub Actions CI, cspell                                                   |

### Common Tasks & Guidelines

| Task                 | Guidance                                                                                                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add endpoint         | Place logic in API route; add `authenticateToken` and role-based guard. Return sanitized JSON. Support `Idempotency-Key` for write actions when relevant. |
| Modify questionnaire | Update shared questionnaire package; ensure serialization helper handles new fields.                                                                      |
| Frontend feature     | Wrap risky code paths with ErrorBoundary; leverage requestCache when polling or frequent GETs.                                                            |
| Refactor             | Split large modules; preserve public interfaces; add unit tests (Vitest / Jest).                                                                          |
| Doc update           | Enhance Markdown with context; avoid exposing private IDs or tokens.                                                                                      |

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

### Forbidden / Caution

| Item                        | Reason                              |
| --------------------------- | ----------------------------------- |
| Hardcoded secrets           | Security risk                       |
| Excessive console logs      | Noise; production rule rejects them |
| Unindexed Firestore queries | Performance degradation             |
| Swallowing errors silently  | Debugging difficulty                |

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

### Future Enhancements Candidates

- Structured logging (pino) + correlation IDs active; use `withRequest(req)` child logger in new endpoints.
- Implement background job for questionnaire analytics aggregation.
- Introduce E2E tests for multi-step patient flows (Playwright). Already partial; extend coverage.
- Migrate authentication to short-lived sessions with refresh rotation.

---

This instruction file guides ChatGPT usage for consistent, safe, and efficient collaboration on the NeuroNutrition codebase.
