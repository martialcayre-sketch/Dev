Dev local (Option A)

## Structure du projet

Le projet est maintenant directement dans `c:\Dev\` (plus de sous-dossier `neuronutrition-app`).

## 1) Prérequis

- Node 20.17.0 (`.nvmrc`), `corepack enable`
- Firebase CLI (`npm i -g firebase-tools`), `firebase login`, `firebase use neuronutrition-app`
- Dans `apps/*/.env.local`: `NEXT_PUBLIC_USE_EMULATORS=1` (et `NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR=1` côté praticien)

2. Lancer en une commande (Windows)

- `pnpm dev:stack:win`
- Ouvre 3 fenêtres: Emulators (5000 UI), Patient (3020), Practicien (3010)

3. Commandes unitaires

- Emulators: `pnpm dev:emu` (ou `firebase emulators:start --only functions,firestore,auth`)
- Patient: `pnpm dev:patient`
- Practicien: `pnpm dev:practitioner`

4. Vérifications

- UI Emulators: http://localhost:5000
- API: http://localhost:5002/neuronutrition-app/europe-west1/api/health → `{"success":true,"data":{"status":"ok"}}`
- Patient: http://localhost:3020
- Practicien: http://localhost:3010

5. Déploiement Hosting (placeholders + API Functions)

- `firebase deploy --only hosting:patient,hosting:practitioner`
- Patient live: https://neuronutrition-app-patient.web.app
- Practicien live: https://neuronutrition-app-practitioner.web.app
- API live: `/api/health` → `{"success":true,"data":{"status":"ok"}}`

## Tests Functions (Jest + Supertest)

- Installer les dépendances du workspace: `pnpm install`
- Exécuter uniquement les tests Functions:

```sh
pnpm --filter functions test
```

Notes:

- Pas besoin de démarrer les émulateurs pour les tests de base (health/catalog).
- Les endpoints renvoient une enveloppe normalisée: `{ success, data|error, requestId }`.
