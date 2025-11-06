# Architecture Backend Partagé - Recommandation

## 🎯 Problème Identifié

### Situation Actuelle

- **App Patient** (Vite/React) : `neuronutrition-app-patient.web.app`
- **App Praticien** (Vite/React) : `neuronutrition-app-practitioner.web.app`
- **Problème** : Code dupliqué (recharts, composants, hooks) causant :
  - Builds qui échouent si une dépendance manque dans l'une des apps
  - Taille des bundles dupliquée
  - Maintenance difficile (changements à répliquer)

### Site Firebase Inutilisé

- `neuronutrition-app.web.app` (target: "web")
- Actuellement configuré mais non déployé

## 🏗️ Solution Proposée : Backend Partagé (Shared API)

### Architecture Recommandée

```
┌─────────────────────────────────────────────────────────────────┐
│                    Firebase Hosting                             │
├─────────────────────┬──────────────────┬────────────────────────┤
│                     │                  │                        │
│  neuronutrition-    │  neuronutrition- │  neuronutrition-      │
│  app-patient        │  app-practitioner│  app                  │
│  (Frontend Client)  │  (Frontend Client)│  (Shared Backend)    │
│                     │                  │                        │
│  - UI Patient       │  - UI Praticien  │  - API REST           │
│  - Auth Flow        │  - Dashboard     │  - Endpoints partagés │
│  - Formulaires      │  - Gestion       │  - Logique métier     │
│                     │                  │  - Composants SSR     │
└──────┬──────────────┴────────┬─────────┴───────────┬───────────┘
       │                       │                     │
       │    ┌──────────────────┴─────────────────────┘
       │    │  Appels API
       │    ▼
       │  ┌────────────────────────────────────────────┐
       │  │  Cloud Functions (europe-west1)            │
       │  ├────────────────────────────────────────────┤
       │  │  - assignQuestionnaires                    │
       │  │  - activatePatient                         │
       │  │  - submitLifeJourney (nouveau)             │
       │  │  - getPatientLifeJourney (nouveau)         │
       │  │  - generateRadarChart (nouveau)            │
       │  └────────────────────────────────────────────┘
       │                       │
       └───────────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │   Firestore DB      │
                    ├─────────────────────┤
                    │  - patients/        │
                    │  - users/           │
                    │  - invitationTokens/│
                    │  - lifejourney/     │
                    └─────────────────────┘
```

### Option 1 : API Backend (Recommandé) ✅

**Utiliser Cloud Functions (Express) et les rewrites `/api/**` déjà en place\*\*

#### Implémentation actuelle

- Fichier: `functions/index.js`
- Fonction HTTPS: `exports.api = onRequest(app)`
- Routes disponibles:
  - `GET /api/health`
  - `GET /api/hello`
  - `GET /api/patients/:patientId/lifejourney` (dernier enregistrement)
  - `GET /api/patients/:patientId/lifejourney/all?limit=20`

#### firebase.json (existant)

```json
{
  "hosting": [
    {
      "target": "patient",
      "rewrites": [{ "source": "/api/**", "function": "api", "region": "europe-west1" }]
    },
    {
      "target": "practitioner",
      "rewrites": [{ "source": "/api/**", "function": "api", "region": "europe-west1" }]
    }
  ]
}
```

#### Avantages

- ✅ **Code unique** : Un seul composant RadarChart
- ✅ **API RESTful** : `/api/patients/:id/lifejourney`
- ✅ **Calculs centralisés** : Logique SIIN au même endroit
- ✅ **Versionning** : `/api/v1/...`
- ✅ **CORS géré** : Firebase Hosting + Functions
- ✅ **Cache intelligent** : Responses HTTP avec ETags

#### Endpoints (v1)

```typescript
// Récupérer les données Life Journey
GET /api/patients/:patientId/lifejourney
Response: {
  answers: {...},
  scores: {...},
  global: { score, max, percent },
  submittedAt: "2025-11-05T12:00:00Z"
}

// Récupérer les données du radar (format Recharts)
GET /api/patients/:patientId/lifejourney/all?limit=20
Response: { count: number, items: LifeJourneyData[] }

// Récupérer un composant SVG du radar (pour export PDF)
GET /api/patients/:patientId/radar.svg
Response: <svg>...</svg>
```

### Option 2 : Package NPM Partagé (Alternative)

**Créer un package workspace partagé**

#### Structure

```
packages/
  shared-questionnaires/     # Existe déjà
  shared-ui/                 # Existe déjà
  shared-charts/             # NOUVEAU
    src/
      components/
        LifeJourneyRadar.tsx
        ComplaintsBar.tsx
      hooks/
        usePatientLifeJourney.ts
        usePatientComplaints.ts
      utils/
        siinCalculations.ts
    package.json
```

#### package.json

```json
{
  "name": "@neuronutrition/shared-charts",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "peerDependencies": {
    "react": "^18.0.0",
    "recharts": "^2.12.7"
  }
}
```

#### Utilisation

```typescript
// Dans patient-vite et practitioner-vite
import { LifeJourneyRadar, usePatientLifeJourney } from '@neuronutrition/shared-charts';

const { data } = usePatientLifeJourney(patientId);
return <LifeJourneyRadar data={data} />;
```

#### Avantages

- ✅ **TypeScript** : Types partagés
- ✅ **Build optimisé** : Tree-shaking
- ✅ **Moins de duplication** : Une seule source
- ⚠️ **Mais** : Chaque app doit quand même bundler recharts

### Option 3 : Micro-Frontend (Avancé)

**Le 3ème site héberge des Web Components**

```typescript
// apps/shared-components/src/radar-chart.ts
class RadarChartElement extends HTMLElement {
  connectedCallback() {
    const data = JSON.parse(this.getAttribute('data'));
    this.innerHTML = renderRadarChart(data);
  }
}
customElements.define('nn-radar-chart', RadarChartElement);
```

```html
<!-- Dans patient-vite ou practitioner-vite -->
<script src="https://neuronutrition-app.web.app/components.js"></script>
<nn-radar-chart data='{"scores":[...]}'></nn-radar-chart>
```

## 📊 Comparaison des Options

| Critère            | Option 1: API Backend    | Option 2: Package NPM     | Option 3: Web Components     |
| ------------------ | ------------------------ | ------------------------- | ---------------------------- |
| **Facilité setup** | ⭐⭐⭐                   | ⭐⭐⭐⭐                  | ⭐⭐                         |
| **Performance**    | ⭐⭐⭐⭐ (cache HTTP)    | ⭐⭐⭐⭐⭐ (bundle local) | ⭐⭐⭐ (load externe)        |
| **Maintenance**    | ⭐⭐⭐⭐⭐ (1 seul code) | ⭐⭐⭐⭐ (workspace)      | ⭐⭐⭐⭐ (1 seul code)       |
| **Bundle size**    | ⭐⭐⭐⭐⭐ (pas de dup)  | ⭐⭐⭐ (dupliqué)         | ⭐⭐⭐⭐ (load à la demande) |
| **TypeScript**     | ⭐⭐⭐ (API contracts)   | ⭐⭐⭐⭐⭐ (types natifs) | ⭐⭐ (custom props)          |
| **Déploiement**    | ⭐⭐⭐⭐ (indépendant)   | ⭐⭐⭐⭐⭐ (automatique)  | ⭐⭐⭐⭐ (indépendant)       |

## 🎯 Recommandation Finale

### Phase 1 : Quick Win (Immédiat) ⚡

**Option 2 : Package `@neuronutrition/shared-charts`**

**Pourquoi ?**

- ✅ Utilise le système pnpm workspace existant
- ✅ Résout le problème recharts immédiatement
- ✅ Setup rapide (1-2h)
- ✅ TypeScript natif

**Action immédiate :**

```bash
# Créer le package
mkdir -p packages/shared-charts/src/components
mkdir -p packages/shared-charts/src/hooks

# Déplacer le code
# mv apps/practitioner-vite/src/components/LifeJourneyRadar.tsx packages/shared-charts/src/components/
# mv apps/practitioner-vite/src/hooks/usePatientLifeJourney.ts packages/shared-charts/src/hooks/

# Installer dans les deux apps
cd apps/patient-vite && pnpm add @neuronutrition/shared-charts@workspace:*
cd apps/practitioner-vite && pnpm add @neuronutrition/shared-charts@workspace:*
```

### Phase 2 : Architecture Long Terme (1-2 semaines) 🏗️

**Option 1 : API Backend sur `neuronutrition-app.web.app`**

**Pourquoi ?**

- ✅ Prépare la scalabilité (mobile apps, exports PDF, webhooks)
- ✅ Cache intelligent (CloudFlare/Firebase CDN)
- ✅ Sécurité centralisée (1 seul point d'authentification)
- ✅ Endpoints pour exports (PDF, CSV, Excel)

**Fonctionnalités futures :**

```typescript
// Export PDF du questionnaire
POST /api/export/pdf
Body: { patientId, questionnaireIds: ['life-journey', 'dnsm'] }
Response: { pdfUrl: "https://..." }

// Webhook pour systèmes externes
POST /api/webhooks/questionnaire-completed
Body: { patientId, questionnaireId, scores }

// API pour future app mobile
GET /api/mobile/patients/:id/dashboard
```

## 🚀 Plan d'Action Recommandé

### Semaine 1 : Migration vers Package Partagé

1. ✅ Créer `packages/shared-charts`
2. ✅ Migrer `LifeJourneyRadar` + `usePatientLifeJourney`
3. ✅ Installer recharts dans shared-charts uniquement
4. ✅ Mettre à jour patient-vite et practitioner-vite
5. ✅ Build et déployer

### Semaine 2-3 : Setup API Backend

1. ✅ Implémenter routes dans `functions/index.js` (Express)
2. ✅ Exposer `/api/patients/:id/lifejourney` et `/api/patients/:id/lifejourney/all`
3. ✅ Conserver rewrites Hosting → `api` (déjà en place)
4. ✅ Déployer Functions
5. ✅ Documenter (ce fichier)

### Semaine 4 : Migration Progressive

1. ✅ Patient app : utilise API pour lecture seule
2. ✅ Practitioner app : utilise API pour dashboards
3. ✅ Monitoring et logs
4. ✅ Optimisation cache

## 💡 Bonus : Utilité du 3ème Site

**Au-delà de l'API, le site `neuronutrition-app.web.app` peut servir de :**

1. **Documentation publique** : `/docs` → Storybook des composants
2. **Landing page** : Site marketing principal
3. **Admin panel** : Outils d'administration Firebase
4. **Status page** : Monitoring temps réel des services
5. **Export service** : Génération PDF/Excel à la demande
6. **Analytics dashboard** : Statistiques globales (anonymisées)

## 📝 Conclusion

Votre intuition est **100% correcte** ! Le 3ème site Firebase Hosting est actuellement sous-exploité et peut résoudre vos problèmes :

- ✅ **Court terme** : Package NPM partagé (résout le problème recharts)
- ✅ **Long terme** : API Backend (architecture scalable)
- ✅ **Bonus** : Landing page, docs, admin tools

**Voulez-vous que je commence par créer le package `@neuronutrition/shared-charts` ?**
C'est la solution la plus rapide pour débloquer le build praticien.
