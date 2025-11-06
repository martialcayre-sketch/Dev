# DayFlow 360 – Alimentation SIIN (integration helpers)

## TL;DR

```tsx
import DayFlowAlimentaireSIIN from '@/components/DayFlowAlimentaireSIIN';
import { submitDayFlow } from '@/features/dayflow-alim/submit';
import type { DayFlowPayload } from '@/features/dayflow-alim/types';

export default function Page() {
  return (
    <DayFlowAlimentaireSIIN
      onSubmit={async (payload: DayFlowPayload) => {
        const { id, payload: saved } = await submitDayFlow(payload);
        console.log('Saved DayFlow:', id, saved);
      }}
    />
  );
}
```

## UI tableau de bord (radar déficits)

```tsx
import LatestDayFlowAlimCard from '@/components/LatestDayFlowAlimCard';

// Place this tile in your dashboard grid
<LatestDayFlowAlimCard />;
```

Notes:

- Radar affiche les déficits (100 - score). Zone plus grande = axe à renforcer.
- Dépendance: `recharts`

## API

- `submitDayFlow(basePayload, { id?, version? })` – enrichit avec interprétation + persiste
- `saveDayFlowSurvey(uid, payload, id?)` – bas niveau (persistence)
- `interpretDayFlow(scores)` – renvoie `summary`, `priorities` (3 tips/axe), `plan7d`

## Types

- Axes: `AIA`, `SER`, `DOP`, `NEU`, `CON` (0..100)
- Scènes: `matin`, `midi`, `apresmidi`, `soir`, `global`
- `DayFlowPayload` – answers, scores, radarInverted, meta

## Permissions & sécurité

- Requiert utilisateur authentifié (Firebase Auth) pour `submitDayFlow`
- Collection: `users/{uid}/surveys/dayflow-alim`

## Bonus

- Vous pouvez passer `defaultExportAction` à votre composant si vous ajoutez ce prop côté UI
  (`'copy' | 'download'`, par défaut: `'copy'`) – la logique de fallback est compatible.
