# 📊 Analyse Architecture Frontend-Backend NeuroNutrition

_Analyse complète de la séparation des responsabilités et des flux de communication_

---

## 🎯 Vue d'ensemble de l'architecture

### Architecture actuelle : **Backend-First avec API HTTP centralisée**

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTENDS (Vite + React)                     │
│  ┌──────────────────────┐        ┌───────────────────────┐      │
│  │  Patient App         │        │  Practitioner App     │      │
│  │  (patient-vite)      │        │  (practitioner-vite)  │      │
│  └──────────┬───────────┘        └───────────┬───────────┘      │
│             │                                 │                  │
│             │  HTTP + Bearer Token            │                  │
│             └─────────────┬───────────────────┘                  │
└───────────────────────────┼──────────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │   Firebase Hosting      │ (Rewrite /api/* → Cloud Run)
              └─────────────┬───────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │   API Backend           │
              │   (Cloud Run)           │ 🔑 Auth middleware
              │                         │ 📊 Business logic
              │   Routes:               │ ✅ Validation
              │   - questionnaires.js   │ 🗄️ Firestore ops
              │   - consultation.js     │
              │   - analytics.js        │
              │   - admin.js            │
              └─────────────┬───────────┘
                            │
              ┌─────────────┴───────────┐
              │                         │
              ▼                         ▼
    ┌──────────────────┐     ┌──────────────────┐
    │  Firestore DB    │     │ Cloud Functions  │
    │  (Data Layer)    │     │ (Event handlers) │
    │                  │     │                  │
    │  Collections:    │     │ - assignQuestio  │
    │  - questionnaires│     │ - submitQuestio  │
    │  - patients      │     │ - onCompleted    │
    │  - practitioners │     │ - invitePatient  │
    └──────────────────┘     └──────────────────┘
```

---

## 🔄 Flux de communication : Comment les frontends appellent le backend

### 1. **Pattern utilisé : API Client centralisé**

#### Frontend Patient : `/apps/patient-vite/src/services/api.ts`

```typescript
// ✅ Singleton API client avec méthodes typées
export const api = {
  // Questionnaires
  getPatientQuestionnaires(patientId: string),
  getQuestionnaireDetail(patientId, questionnaireId),
  saveQuestionnaireResponses(patientId, questionnaireId, responses),
  submitQuestionnaire(patientId, questionnaireId),

  // Consultation
  getIdentification(patientId),
  saveIdentification(patientId, data),
  getAnamnese(patientId),
  saveAnamnese(patientId, data),

  // Dashboard
  getPatientDashboard(patientId),
  getPatientScores(patientId)
}

// ✅ Helper réutilisable : fetchWithTimeout
// - Gère auth automatique (Bearer token via Firebase Auth)
// - Timeout 30s
// - Gestion d'erreurs structurée (ApiError, AuthError, NetworkError)
```

#### Frontend Practitioner : `/apps/practitioner-vite/src/services/api.ts`

```typescript
// ✅ API client similaire mais avec endpoints praticien
export const api = {
  getPractitionerQuestionnaires(practitionerId, options),
  getPatientQuestionnaires(patientId),
  getQuestionnaireDetail(patientId, questionnaireId),
  completeQuestionnaire(patientId, questionnaireId)
}

// ❗ REDONDANCE DÉTECTÉE :
// - fetchWithTimeout dupliqué (même code dans les 2 apps)
// - Classes d'erreur dupliquées (ApiError, AuthError, NetworkError)
// - Types Questionnaire/QuestionnaireStatus dupliqués
```

---

## 📦 Répartition des responsabilités

### ✅ Ce qui est dans le **BACKEND** (api/src/)

| Composant                 | Responsabilité                                                                                      | Fichier                             |
| ------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------- |
| **Auth Middleware**       | Vérification token Firebase, extraction UID, contrôle d'accès (requirePatient, requirePractitioner) | `middleware/auth.js`                |
| **Routes Questionnaires** | CRUD questionnaires, auto-save, soumission, complétion                                              | `routes/questionnaires.js`          |
| **Routes Consultation**   | Identification, Anamnèse (GET/PUT)                                                                  | `routes/consultation.js`            |
| **Routes Analytics**      | Calcul de scores, agrégation de données                                                             | `routes/analytics.js`               |
| **Routes Admin**          | Gestion praticiens, migration données                                                               | `routes/admin.js`                   |
| **Scoring Service**       | Calcul scores DayFlow (SIIN), interprétations, conseils personnalisés                               | `services/scoring.js`               |
| **Serialization**         | Transformation timestamps Firestore → ISO strings                                                   | `routes/questionnaires.js` (helper) |
| **Validation**            | Validation des données, contrôle de statut (empêcher modification si `submitted`)                   | Routes                              |
| **Double-write logic**    | Écriture simultanée root + subcollection (migration en cours)                                       | Routes                              |

### ✅ Ce qui est dans les **FRONTENDS**

#### Patient App (apps/patient-vite/src/)

| Composant              | Responsabilité                                                             | Fichier                                                        |
| ---------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **UI Rendering**       | Affichage questionnaires, formulaires, dashboards                          | `pages/*.tsx`, `components/*.tsx`                              |
| **State Management**   | React hooks locaux (useState, useEffect)                                   | `hooks/*.ts`                                                   |
| **API Calls**          | Appels HTTP via client centralisé                                          | `services/api.ts`                                              |
| **Auto-save**          | Debounce + PATCH incrémental toutes les 2s                                 | `components/questionnaires/EditableQuestionnaire.tsx`          |
| **Questionnaire Data** | Définition des questions (structure uniquement, pas de scoring)            | `questionnaires/data.ts`                                       |
| **DNSM Scoring**       | **❗ ANOMALIE** : Logique de scoring côté client                           | `hooks/useDNSMScore.ts`                                        |
| **DNSM Visualization** | Radar chart (SVG natif)                                                    | `components/questionnaires/DNSMRadar.tsx`                      |
| **Firestore Direct**   | Accès direct pour certaines features (DayFlow, LifeJourney, Notifications) | `features/*/persistence.ts`, `components/NotificationBell.tsx` |

#### Practitioner App (apps/practitioner-vite/src/)

| Composant            | Responsabilité                                                   | Fichier                                         |
| -------------------- | ---------------------------------------------------------------- | ----------------------------------------------- |
| **UI Rendering**     | Liste patients, consultations, questionnaires                    | `pages/*.tsx`                                   |
| **API Calls**        | Appels backend pour questionnaires                               | `services/api.ts`                               |
| **Firestore Direct** | ⚠️ Accès direct massif (patients, consultations, inbox, metrics) | `pages/*.tsx`, `hooks/*.ts`, `components/*.tsx` |

### ⚡ Cloud Functions (functions/src/)

| Fonction                   | Trigger           | Responsabilité                                                      |
| -------------------------- | ----------------- | ------------------------------------------------------------------- |
| `assignQuestionnaires`     | Callable (onCall) | Assigne 4 questionnaires par défaut lors de création compte patient |
| `submitQuestionnaire`      | Callable (onCall) | Marque questionnaire comme `submitted`, crée entrée inbox praticien |
| `onQuestionnaireCompleted` | Firestore trigger | Envoi notification email/FCM (futur)                                |
| `invitePatient`            | Callable (onCall) | Création token invitation patient                                   |
| `approvePatient`           | Callable (onCall) | Validation compte patient par praticien                             |

---

## 🚨 REDONDANCES ET LOURDEURS DÉTECTÉES

### 1. ❌ **Duplication du code API client**

**Problème** : Les 2 frontends ont un fichier `services/api.ts` avec du code identique :

```typescript
// DUPLIQUÉ dans patient-vite ET practitioner-vite :
- async function getAuthToken()           // 15 lignes identiques
- async function fetchWithTimeout()       // 90 lignes identiques
- class ApiError                          // Identique
- class AuthError                         // Identique
- class NetworkError                      // Identique
- Types QuestionnaireStatus, Questionnaire // Identiques
```

**Impact** :

- 🔴 Maintenance double : tout bug/changement doit être fait 2×
- 🔴 Risque de divergence (versions différentes dans les 2 apps)
- 🔴 ~200 lignes dupliquées

**Solution recommandée** :

```typescript
// Créer packages/shared-api/src/client.ts
export async function createApiClient(baseUrl: string) {
  // Code commun fetchWithTimeout, getAuthToken, etc.
}

// Patient app
import { createApiClient } from '@neuronutrition/shared-api';
const api = createApiClient('/api');

// Practitioner app
import { createApiClient } from '@neuronutrition/shared-api';
const api = createApiClient('/api');
```

---

### 2. ⚠️ **Accès Firestore direct dans les frontends**

**Problème** : Certaines features court-circuitent l'API backend et accèdent directement à Firestore :

#### Patient App :

```typescript
// ❌ Accès direct Firestore
apps/patient-vite/src/features/lifejourney/persistence.ts
apps/patient-vite/src/features/dayflow-alim/persistence.ts
apps/patient-vite/src/components/NotificationBell.tsx
apps/patient-vite/src/pages/DashboardPage.tsx (requêtes inbox)
apps/patient-vite/src/pages/ConsultationPage.tsx
```

#### Practitioner App :

```typescript
// ❌ Accès direct Firestore MASSIF
apps/practitioner-vite/src/pages/PatientsPage.tsx (liste patients)
apps/practitioner-vite/src/pages/ConsultationsListPage.tsx
apps/practitioner-vite/src/pages/ConsultationDetailPage.tsx
apps/practitioner-vite/src/components/InboxList.tsx
apps/practitioner-vite/src/components/LatestDayFlowAlimCard.tsx
apps/practitioner-vite/src/components/LifeJourneyRadarCard.tsx
apps/practitioner-vite/src/hooks/usePractitionerMetrics.ts
```

**Impact** :

- 🔴 **Sécurité** : Les règles Firestore doivent être ultra-strictes (complexe à maintenir)
- 🔴 **Performance** : Pas de cache backend, requêtes multiples côté client
- 🔴 **Business logic** : Répartie entre frontend et backend (confusion)
- 🔴 **Migration difficile** : Si changement de DB, il faut modifier tous les frontends

**Pourquoi c'est fait ainsi** :

- ✅ **Temps réel** : `onSnapshot()` pour inbox, notifications (légitime)
- ❌ **Héritage** : Ancien code avant migration backend-first (à nettoyer)

**Solution recommandée** :

```typescript
// ✅ Garder Firestore direct UNIQUEMENT pour :
- Notifications temps réel (inbox, bell)
- Chat en temps réel (si implémenté)

// ❌ Migrer vers API backend :
- Liste patients → GET /practitioners/:id/patients
- Consultations → GET /patients/:id/consultations
- Metrics → GET /practitioners/:id/metrics
- DayFlow persistence → POST/GET /patients/:id/dayflow
- LifeJourney persistence → POST/GET /patients/:id/lifejourney
```

---

### 3. ⚠️ **Scoring DNSM côté client**

**Problème** : Le scoring DNSM est calculé dans le frontend patient :

```typescript
// apps/patient-vite/src/hooks/useDNSMScore.ts
export function useDNSMScore(responses: Record<string, number>) {
  // ❌ Logique métier côté client
  const dopamineScore = sum(responses, 'da-1' to 'da-10');
  const normalized = (score / 40) * 100;
  const status = score <= 10 ? 'normal' : score >= 20 ? 'marked' : 'probable';
  // ...
}
```

**Impact** :

- 🟡 **Cohérence** : Si on change l'algo, il faut redeployer le frontend
- 🟡 **Validation** : Le praticien ne peut pas valider le score côté serveur
- 🟡 **Historique** : Les scores calculés ne sont pas archivés dans Firestore

**Comparaison avec DayFlow** :

```javascript
// ✅ Backend : api/src/services/scoring.js
export class DayFlowScoringService {
  interpretDayFlow(scores) {
    // Logique métier centralisée
    // Peut être réutilisée par API analytics
  }
}
```

**Solution recommandée** :

```typescript
// Déplacer vers backend
// api/src/services/scoring.js
export class DNSMScoringService {
  calculateScores(responses) {
    // Logique actuelle de useDNSMScore
  }
  getInterpretations(scores) { ... }
}

// Frontend appelle :
const scores = await api.getQuestionnaireScores(patientId, 'dnsm');
```

---

### 4. ✅ **Double-write temporaire (OK pour migration)**

**Contexte** : Migration en cours subcollection → root collection

```javascript
// api/src/routes/questionnaires.js
router.patch('/patients/:patientId/questionnaires/:id/responses', async (req, res) => {
  // ✅ Écriture double pour compatibilité
  const qRefRoot = db.collection('questionnaires').doc(id); // NEW
  const qRefSub = db.collection('patients').doc(pid).collection('questionnaires').doc(id); // OLD

  await qRefRoot.update({ responses });
  await qRefSub.update({ responses });
});
```

**Impact** :

- 🟢 **Migration safe** : Les 2 chemins fonctionnent (anciens clients + nouveaux)
- 🟡 **Performance** : 2× writes Firestore (coût + latence)
- 🟡 **Complexité** : Fallback logic dans GET routes

**Action recommandée** :

- ✅ Garder en l'état pendant 2-3 mois
- ✅ Monitorer usage subcollection (Cloud Functions logs)
- ✅ Supprimer subcollection quand usage = 0

---

## 📊 Résumé des flux actuels

### Flux Questionnaire (Patient → Practitioner)

```
1. Patient ouvre app
   └─> usePatientQuestionnaires()
       └─> api.getPatientQuestionnaires(uid)
           └─> GET /api/patients/:id/questionnaires
               └─> [Backend] Query Firestore root collection
                   └─> Fallback subcollection si vide

2. Patient modifie réponses
   └─> EditableQuestionnaire (debounce 2s)
       └─> api.saveQuestionnaireResponses(pid, qid, responses)
           └─> PATCH /api/patients/:id/questionnaires/:qid/responses
               └─> [Backend] Double-write root + subcollection
                   └─> Validation status != 'submitted'

3. Patient soumet questionnaire
   └─> SubmitToPractitionerButton
       └─> api.submitQuestionnaire(pid, qid)
           └─> POST /api/patients/:id/questionnaires/:qid/submit
               └─> [Backend] Appelle Cloud Function submitQuestionnaire
                   └─> submitQuestionnaire(data)
                       └─> Transaction Firestore :
                           ├─> Update questionnaire status = 'submitted'
                           └─> Create practitioners/:pid/inbox entry

4. Practitioner voit notification
   └─> InboxList (onSnapshot direct Firestore) ❌
       └─> practitioners/:id/inbox (temps réel)

5. Practitioner ouvre questionnaire
   └─> api.getQuestionnaireDetail(patientId, qid)
       └─> GET /api/patients/:id/questionnaires/:qid
           └─> [Backend] Query Firestore

6. Practitioner marque comme vu
   └─> api.completeQuestionnaire(patientId, qid)
       └─> POST /api/patients/:id/questionnaires/:qid/complete
           └─> [Backend] Update status = 'completed'
```

### Flux Consultation (Identification/Anamnèse)

```
1. Patient remplit identification
   └─> IdentificationPage
       └─> api.saveIdentification(uid, formData)
           └─> PUT /api/patients/:id/consultation/identification
               └─> [Backend] Set patients/:id/consultation/identification

2. Practitioner consulte
   └─> ConsultationDetailPage
       └─> ❌ Direct Firestore getDoc()
           └─> patients/:id/consultation/identification
```

---

## 🎯 RECOMMANDATIONS PRIORITAIRES

### 🔴 Priorité HAUTE

#### 1. **Créer package API partagé**

```bash
# Nouvelle structure
packages/shared-api/
  src/
    client.ts         # fetchWithTimeout, getAuthToken
    errors.ts         # ApiError, AuthError, NetworkError
    types.ts          # Questionnaire, Patient, etc.
  package.json
```

**Bénéfices** :

- ✅ -200 lignes de duplication
- ✅ 1 seule source de vérité
- ✅ Types partagés entre apps

---

#### 2. **Migrer accès Firestore direct → API backend**

**Phase 1** : Practitioner app (plus critique)

```typescript
// ❌ AVANT
const patientsSnap = await getDocs(collection(db, 'patients'));

// ✅ APRÈS
const patients = await api.getPractitionerPatients(practitionerId);
```

**Routes à créer** :

```javascript
// api/src/routes/admin.js
GET  /practitioners/:id/patients        // Liste patients
GET  /practitioners/:id/consultations   // Liste consultations
GET  /practitioners/:id/metrics         // Métriques
GET  /practitioners/:id/inbox           // Initial load (temps réel reste onSnapshot)
```

**Bénéfices** :

- ✅ Sécurité centralisée (pas de firestore.rules complexes)
- ✅ Cache possible (Redis futur)
- ✅ Logs/monitoring unifiés

---

#### 3. **Déplacer scoring DNSM vers backend**

```javascript
// api/src/services/scoring.js
export class DNSMScoringService {
  static calculate(responses) {
    const axes = ['da', 'na', 'se', 'me'];
    const scores = {};
    axes.forEach(axis => {
      const sum = Object.entries(responses)
        .filter(([k]) => k.startsWith(axis))
        .reduce((acc, [, v]) => acc + v, 0);
      scores[axis] = { raw: sum, percent: Math.round((sum/40)*100) };
    });
    return scores;
  }

  static interpret(scores) {
    // Logique actuelle de useDNSMScore
  }
}

// Routes
GET /patients/:id/questionnaires/:qid/scores/dnsm
```

**Frontend simplifié** :

```typescript
// apps/patient-vite/src/hooks/useDNSMScore.ts
export function useDNSMScore(questionnaireId: string) {
  const [scores, setScores] = useState(null);

  useEffect(() => {
    api.getDNSMScores(patientId, questionnaireId).then(setScores);
  }, [questionnaireId]);

  return scores;
}
```

---

### 🟡 Priorité MOYENNE

#### 4. **Nettoyer double-write après migration complète**

Timeline suggérée :

- **Maintenant** : Ajouter logging pour tracker usage subcollection
- **Mois 1** : Monitor logs, vérifier 0 accès subcollection
- **Mois 2** : Supprimer code double-write
- **Mois 3** : Cleanup subcollections vides (script Cloud Function)

---

#### 5. **Standardiser gestion d'état**

Options :

```typescript
// Option A : React Query (recommandé)
import { useQuery } from '@tanstack/react-query';

const { data: questionnaires } = useQuery({
  queryKey: ['questionnaires', patientId],
  queryFn: () => api.getPatientQuestionnaires(patientId),
  staleTime: 5000,
  refetchOnWindowFocus: true,
});

// Option B : SWR
import useSWR from 'swr';
const { data } = useSWR(`/api/patients/${id}/questionnaires`, api.apiFetcher);
```

**Bénéfices** :

- ✅ Cache automatique
- ✅ Revalidation intelligente
- ✅ Moins de code custom (remplace polling actuel)

---

### 🟢 Priorité BASSE (Nice to have)

#### 6. **Créer package shared-types complet**

```typescript
// packages/shared-types/src/questionnaire.ts
export type QuestionnaireStatus =
  | 'pending'
  | 'in_progress'
  | 'submitted'
  | 'completed'
  | 'reopened';

export interface Questionnaire {
  id: string;
  title: string;
  // ... types utilisés par frontend ET backend
}

// Backend (Node.js)
import { Questionnaire } from '@neuronutrition/shared-types';

// Frontend (TypeScript)
import type { Questionnaire } from '@neuronutrition/shared-types';
```

---

## 📈 Métriques de complexité actuelles

| Métrique                   | Patient App | Practitioner App | Backend API | Total   |
| -------------------------- | ----------- | ---------------- | ----------- | ------- |
| Fichiers Firestore direct  | 11          | 12               | 0           | **23**  |
| Fichiers API calls         | 11          | 5                | -           | **16**  |
| Lignes dupliquées (api.ts) | ~200        | ~200             | -           | **400** |
| Routes API utilisées       | 8           | 4                | 15+         | -       |
| Cloud Functions callées    | 2           | 1                | -           | **3**   |

---

## ✅ Points forts de l'architecture actuelle

1. ✅ **Backend-first en place** : API Cloud Run avec auth middleware
2. ✅ **Separation of concerns** : Routes bien organisées (questionnaires, consultation, analytics, admin)
3. ✅ **TypeScript strict** : Frontend patient avec types complets
4. ✅ **Package shared-questionnaires** : Données questionnaires centralisées
5. ✅ **Migration safe** : Double-write permet transition en douceur
6. ✅ **Auth centralisée** : Firebase Auth + Bearer tokens
7. ✅ **Cloud Functions pertinentes** : Events handler (assignation, soumission, triggers)

---

## 🎬 Plan d'action recommandé

### Sprint 1 (1-2 jours) : Éliminer duplications critiques

- [ ] Créer `packages/shared-api` avec client HTTP commun
- [ ] Migrer patient-vite vers shared-api
- [ ] Migrer practitioner-vite vers shared-api
- [ ] Créer `packages/shared-types` pour types communs

### Sprint 2 (2-3 jours) : Migrer Practitioner app vers API backend

- [ ] Créer routes `/practitioners/:id/patients`
- [ ] Créer routes `/practitioners/:id/consultations`
- [ ] Créer routes `/practitioners/:id/metrics`
- [ ] Remplacer accès Firestore direct (sauf inbox temps réel)

### Sprint 3 (1-2 jours) : Centraliser scoring

- [ ] Déplacer logique DNSM vers `api/src/services/scoring.js`
- [ ] Créer route `GET /questionnaires/:id/scores`
- [ ] Simplifier `useDNSMScore` hook (juste fetch API)

### Sprint 4 (1 jour) : Monitoring migration

- [ ] Ajouter logs pour tracking subcollection usage
- [ ] Dashboard Cloud Monitoring pour métriques API
- [ ] Alertes si accès subcollection > 0 après migration

### Sprint 5 (2-3 jours) : React Query migration (optionnel)

- [ ] Installer `@tanstack/react-query`
- [ ] Remplacer hooks custom par `useQuery`/`useMutation`
- [ ] Supprimer polling manuel (15s interval)

---

## 📝 Conclusion

**État actuel** : Architecture **backend-first bien engagée** mais avec **héritages de l'ancien système** (accès Firestore direct).

**Problèmes principaux** :

1. 🔴 Code API dupliqué (patient + practitioner)
2. 🔴 Accès Firestore direct massif (practitioner app surtout)
3. 🟡 Scoring DNSM côté client (devrait être backend)

**Recommandations immédiates** :

- ✅ Créer `shared-api` package
- ✅ Migrer practitioner app vers API backend
- ✅ Centraliser scoring dans backend

**Bénéfices attendus** :

- 🎯 -400 lignes de duplication
- 🔒 Sécurité renforcée (rules Firestore simplifiées)
- ⚡ Performance (cache backend possible)
- 🧪 Testabilité (business logic isolée)
- 📊 Monitoring centralisé

L'architecture est **sur la bonne voie** vers un backend-first complet. Il reste principalement du **cleanup et de la migration progressive** des anciens patterns.
