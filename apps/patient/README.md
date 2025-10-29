# NeuroNutrition – Espace patient

Front-end Next.js 16 (App Router) ciblant les patient·e·s.

## Structure

```text
patient/
├── app/                  # Routes App Router
│   ├── layout.tsx        # Layout racine + Tailwind
│   ├── page.tsx          # Redirection login → dashboard
│   └── patient/page.tsx  # PatientHome monté sur /patient
├── lib/                  # Firebase client
├── src/
│   ├── components/       # UI (dont PatientHome)
│   ├── services/         # Stubs API patient
│   └── types/            # Types partagés patient
├── __tests__/            # Tests RTL + Jest
├── jest.config.js        # Config Jest via next/jest
├── tailwind.config.ts    # Config Tailwind CSS
├── postcss.config.js
└── app/globals.css       # Tailwind base
```

## Scripts utiles

- `pnpm dev` – lance le serveur dev (`http://localhost:3020`).
- `pnpm build` – build production.
- `pnpm start` – lance le serveur prod local.
- `pnpm lint` – lint TypeScript / ESLint.
- `pnpm test` – exécute les tests Jest + Testing Library.

## Montage de `PatientHome`

### App Router (recommandé)

```tsx
// app/patient/page.tsx
'use client'

import PatientHome from '@/src/components/PatientHome'

export default function PatientPage() {
   return <PatientHome />
}
```

### Pages Router (legacy)

```tsx
// pages/patient.tsx
import dynamic from 'next/dynamic'

const PatientHome = dynamic(() => import('@/src/components/PatientHome'), { ssr: false })

export default function PatientPage() {
   return <PatientHome />
}
```

## Notes produit

- `PatientHome` expose des handlers mockés dans `src/services/patient.ts` (promesses + navigation locale).
- Les types partagés (todos, plan du jour, recettes, etc.) sont regroupés dans `src/types/patient.ts`.
- Des tests RTL couvrent les CTA principales, le toggle repas, le marquage « Lu » et la navigation.
- Tailwind + classes shadcn-like assurent la cohérence visuelle et l’accessibilité (aria-pressed, aria-live, etc.).
