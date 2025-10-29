# Ultimate Docker + Firebase (Dual Frontends)

This repo includes two existing Next.js apps (patient, practitioner). This document adds optional SPA (Vite) frontends, a Docker-only Dev-Container, multi-site Firebase Hosting with switchable /api rewrites to Functions Gen2 by default, and a prepared Cloud Run option.

## Dev-Container
- Open in VS Code and Reopen in Container. Node 20 + Java 21.
- Auto-approve is selective (no destructive commands).

## Workspaces
Added packages:
- `@neuronutrition/shared-core`, `@neuronutrition/shared-ui`
- `@neuronutrition/data-questionnaires` (helper to locate monorepo data)
- `@neuronutrition/corpus-ia` (placeholder)

## SPA Apps (optional)
- `apps/patient-spa`, `apps/practitioner-spa` (Vite React) – Next apps remain unchanged.

## Firebase Hosting (multi-site)
- Sites: `web` (existing), `patient`, `practitioner`.
- Rewrites for new sites:
  - `/api/**` → Functions Gen2 `api` (default)
  - `**` → `index.html` (SPA fallback)

## API switch
- Default (Functions Gen2): rewrite `/api/**` to `{ function: 'api' }`.
- Cloud Run (optional): change rewrite to `{ run: { serviceId: 'api', region: 'europe-west1' } }`.

## Commands
- Patient SPA: `pnpm -C apps/patient-spa dev`
- Practitioner SPA: `pnpm -C apps/practitioner-spa dev`
- Functions emulator: `pnpm -C functions serve`

## Notes
- No `.env*` files were changed. Existing Next apps continue to work.

