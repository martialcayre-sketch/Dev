# 🔌 API Backend - Questionnaires

Documentation complète de l'API Cloud Functions pour la gestion des questionnaires.

## ✅ État actuel (Novembre 2025)

- **Architecture** : Root-only (`questionnaires/{templateId}_{patientUid}`)
- **Migration** : Terminée - sous-collections legacy purgées
- **Scripts** : `audit-questionnaires.mjs`, `backfill-questionnaires.mjs`, `purge-legacy-questionnaires.mjs`
- **Trigger** : `onQuestionnaireCompleted` sur collection root
- **Fonctions déployées** : europe-west1, Gen2, Node.js 20

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Cloud Functions disponibles](#cloud-functions-disponibles)
3. [Endpoints HTTP](#endpoints-http-proposés)
4. [Modèles de données](#modèles-de-données)
5. [Flux de travail](#flux-de-travail)
6. [Sécurité et permissions](#sécurité-et-permissions)
7. [Optimisations proposées](#optimisations-proposées)

---

## 🎯 Vue d'ensemble

### **Architecture actuelle** (✅ Root-only - Nov 2025)

```
Cloud Functions (Callable)           Firestore
┌─────────────────────────┐         ┌──────────────────────────────────────────┐
│ assignQuestionnaires    │────────>│ questionnaires/{templateId}_{uid}        │
│ submitQuestionnaire     │────────>│   - patientUid, practitionerId           │
│ setQuestionnaireStatus  │         │   - status, responses, timestamps        │
│ onQuestionnaireCompleted│<────────│ Trigger on root document update          │
└─────────────────────────┘         └──────────────────────────────────────────┘

patients/{uid}
  ├── pendingQuestionnairesCount: number
  └── lastQuestionnaireCompletedAt: Timestamp
```

### **Région & Configuration**

- **Région** : `europe-west1`
- **Runtime** : Node.js 20
- **Max instances** : 10
- **Architecture** : Callable Functions (onCall)

---

## 📞 Cloud Functions disponibles

### **1. `assignQuestionnaires`**

**Type** : Callable Function (onCall)  
**Fichier** : `functions/src/assignQuestionnaires.ts` + `functions/src/index.ts` (duplicate)

#### **Description**

Assigne automatiquement les 4 questionnaires prédéfinis à un patient lors de l'ouverture de son espace consultation.

#### **Authentification**

✅ Requise - Patient authentifié uniquement

#### **Paramètres**

```typescript
{
  practitionerId?: string  // UID du praticien (optionnel)
}
```

#### **Retour**

```typescript
{
  success: boolean
  alreadyAssigned?: boolean
  questionnaires?: Array<{ id: string, title: string }>
  message: string
}
```

#### **Questionnaires assignés**

1. **plaintes-et-douleurs** - Mode de vie
2. **mode-de-vie** - Mode de vie
3. **nutri-assessment** - Nutrition (PNNS5 × SIIN)
4. **dnsm** - Neuro-psychologie

#### **Effets secondaires**

- ✅ Crée 4 documents dans `questionnaires/{templateId}_{patientUid}` (root collection)
- ✅ Met à jour `patients/{uid}` : `hasQuestionnairesAssigned: true`, `pendingQuestionnairesCount: 4`
- ✅ Crée notification dans `patients/{uid}/notifications/`
- ✅ Envoie email via collection `mail/`

#### **Exemple d'appel (Frontend)**

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const assignQuestionnaires = httpsCallable(functions, 'assignQuestionnaires');

const result = await assignQuestionnaires({
  practitionerId: 'practitioner-uid-123',
});

console.log(result.data);
// { success: true, questionnaires: [...], message: "4 questionnaires ont été assignés" }
```

#### **Gestion d'erreurs**

- `unauthenticated` : Utilisateur non connecté
- `internal` : Erreur lors de la création des questionnaires

---

### **2. `submitQuestionnaire`**

**Type** : Callable Function (onCall)  
**Fichier** : `functions/src/submitQuestionnaire.ts`

#### **Description**

Soumet un questionnaire complété par le patient au praticien. Verrouille le questionnaire (status = `submitted`) et crée une entrée dans l'inbox du praticien.

#### **Authentification**

✅ Requise - Patient authentifié

#### **Paramètres**

```typescript
{
  patientId: string; // UID du patient
  questionnaireId: string; // ID du questionnaire (ex: "plaintes-et-douleurs")
}
```

#### **Retour**

```typescript
{
  ok: boolean;
}
```

#### **Effets secondaires**

- ✅ Met à jour `patients/{uid}/questionnaires/{id}` : `status: 'submitted'`, `submittedAt: timestamp`
- ✅ Crée entrée dans `practitioners/{practitionerId}/inbox/` avec type `questionnaire_submission`
- ✅ Envoie email au praticien

#### **Exemple d'appel**

```typescript
const submitQuestionnaire = httpsCallable(functions, 'submitQuestionnaire');

await submitQuestionnaire({
  patientId: user.uid,
  questionnaireId: 'mode-de-vie',
});
```

#### **Gestion d'erreurs**

- `unauthenticated` : Non connecté
- `permission-denied` : Tentative de soumettre le questionnaire d'un autre patient
- `not-found` : Patient ou questionnaire introuvable
- `failed-precondition` : Déjà soumis ou pas de praticien lié

---

### **3. `setQuestionnaireStatus`**

**Type** : Callable Function (onCall)  
**Fichier** : `functions/src/setQuestionnaireStatus.ts`

#### **Description**

Permet au praticien de changer le statut d'un questionnaire (`completed` ou `reopened`).

#### **Authentification**

✅ Requise - Praticien authentifié

#### **Paramètres**

```typescript
{
  patientId: string;
  questionnaireId: string;
  status: 'completed' | 'reopened';
}
```

#### **Retour**

```typescript
{
  ok: boolean;
  status: 'completed' | 'reopened';
}
```

#### **Effets secondaires**

- ✅ Met à jour `patients/{uid}/questionnaires/{id}` : `status`, `updatedAt`, `completedAt`
- ✅ Si `reopened` : Envoie email + notification au patient

#### **Exemple d'appel**

```typescript
const setQuestionnaireStatus = httpsCallable(functions, 'setQuestionnaireStatus');

await setQuestionnaireStatus({
  patientId: 'patient-uid-123',
  questionnaireId: 'nutri-assessment',
  status: 'completed',
});
```

#### **Gestion d'erreurs**

- `unauthenticated` : Non connecté
- `invalid-argument` : Paramètres manquants ou status invalide
- `not-found` : Patient introuvable
- `permission-denied` : Pas le praticien du patient

---

### **4. `onQuestionnaireCompleted`**

**Type** : Firestore Trigger (onDocumentUpdated)  
**Fichier** : `functions/src/onQuestionnaireCompleted.ts`

#### **Description**

Trigger automatique lors du changement de status d'un questionnaire vers `completed`.

#### **Déclencheur**

```typescript
onDocumentUpdated('patients/{patientId}/questionnaires/{questionnaireId}');
```

#### **Conditions**

- `before.status !== 'completed'` ET `after.status === 'completed'`

#### **Actions**

1. ✅ Crée entrée dans `questionnaireSubmissions/` (collection racine)
2. ✅ Met à jour compteurs dans `patients/{uid}` :
   - `pendingQuestionnairesCount: -1`
   - `completedQuestionnairesCount: +1`
3. ✅ Crée notification pour patient (congratulations)
4. ✅ Crée notification pour praticien (inbox + email)
5. ✅ Envoie emails de notification

#### **Données stockées dans `questionnaireSubmissions`**

```typescript
{
  questionnaireId: string;
  patientUid: string;
  practitionerId: string;
  title: string;
  category: string;
  responses: object;
  submittedAt: Timestamp;
  completedAt: Timestamp;
  completedBy: 'practitioner' | 'patient';
}
```

---

## 🌐 Endpoints HTTP (Proposés)

### **Actuellement manquants - À implémenter**

#### **GET `/api/patients/:patientId/questionnaires`**

**Usage** : Liste tous les questionnaires d'un patient

**Authentification** : Patient ou Praticien lié

**Retour** :

```typescript
{
  questionnaires: Array<{
    id: string;
    title: string;
    category: string;
    status: 'pending' | 'in_progress' | 'submitted' | 'completed';
    assignedAt: string;
    submittedAt?: string;
    completedAt?: string;
    progress?: number; // % de complétion
  }>;
}
```

---

#### **GET `/api/patients/:patientId/questionnaires/:questionnaireId`**

**Usage** : Détails d'un questionnaire spécifique

**Authentification** : Patient ou Praticien lié

**Retour** :

```typescript
{
  id: string
  title: string
  category: string
  description: string
  status: string
  responses: object
  assignedAt: string
  submittedAt?: string
  completedAt?: string
}
```

---

#### **PATCH `/api/patients/:patientId/questionnaires/:questionnaireId/responses`**

**Usage** : Sauvegarde incrémentale des réponses (auto-save)

**Authentification** : Patient uniquement

**Body** :

```typescript
{
  responses: {
    questionId: any; // Merge avec réponses existantes
  }
}
```

**Retour** :

```typescript
{
  ok: boolean;
  savedAt: string;
}
```

---

#### **GET `/api/practitioners/:practitionerId/questionnaires`**

**Usage** : Liste tous les questionnaires de tous les patients d'un praticien

**Authentification** : Praticien uniquement

**Query params** :

- `status` : Filter by status (`pending`, `submitted`, `completed`)
- `limit` : Nombre max de résultats (default: 50)
- `offset` : Pagination

**Retour** :

```typescript
{
  questionnaires: Array<{
    id: string;
    patientId: string;
    patientName: string;
    patientEmail: string;
    title: string;
    category: string;
    status: string;
    assignedAt: string;
    submittedAt?: string;
    completedAt?: string;
  }>;
  total: number;
  hasMore: boolean;
}
```

---

#### **POST `/api/questionnaires/templates`**

**Usage** : Créer un nouveau template de questionnaire (admin/praticien)

**Authentification** : Admin ou Praticien

**Body** :

```typescript
{
  id: string;
  title: string;
  category: string;
  description: string;
  questions: Array<{
    id: string;
    type: 'text' | 'number' | 'select' | 'radio' | 'checkbox';
    question: string;
    options?: string[];
    required?: boolean;
  }>;
}
```

---

## 📦 Modèles de données

### **QuestionnaireTemplate**

```typescript
interface QuestionnaireTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
}
```

### **Questionnaire (Firestore)**

```typescript
interface Questionnaire {
  // Métadonnées
  id: string;
  title: string;
  category: string;
  description: string;

  // Relations
  patientUid: string;
  practitionerId: string | null;

  // État
  status: 'pending' | 'in_progress' | 'submitted' | 'completed' | 'reopened';

  // Dates
  assignedAt: Timestamp;
  startedAt?: Timestamp;
  submittedAt?: Timestamp;
  completedAt?: Timestamp;
  updatedAt?: Timestamp;

  // Données
  responses: Record<string, any>;
}
```

### **QuestionnaireSubmission (Collection racine)**

```typescript
interface QuestionnaireSubmission {
  questionnaireId: string;
  patientUid: string;
  practitionerId: string;
  title: string;
  category: string;
  responses: Record<string, any>;
  submittedAt: Timestamp;
  completedAt: Timestamp;
  completedBy: 'practitioner' | 'patient';
}
```

---

## 🔄 Flux de travail

### **Scénario 1 : Assignation automatique**

```
1. Patient se connecte pour la 1ère fois
   └─> activatePatient() appelé
       └─> Assigne automatiquement 4 questionnaires
           └─> Envoie email de bienvenue + notification

2. Patient ouvre "Consultation"
   └─> Frontend appelle assignQuestionnaires() (idempotent)
       └─> Retourne { alreadyAssigned: true } si déjà fait
```

### **Scénario 2 : Remplissage par le patient**

```
1. Patient ouvre questionnaire
   └─> GET /api/patients/{uid}/questionnaires/{id}
   └─> Status: 'pending' → 'in_progress' (auto)

2. Patient remplit progressivement
   └─> Auto-save : PATCH .../responses
       └─> Sauvegarde incrémentale toutes les 30s

3. Patient clique "Soumettre"
   └─> submitQuestionnaire() callable
       └─> Status: 'submitted'
       └─> Crée inbox entry pour praticien
       └─> Envoie email au praticien
```

### **Scénario 3 : Validation par le praticien**

```
1. Praticien ouvre inbox
   └─> Voit nouvelle notification "Questionnaire soumis"

2. Praticien consulte le questionnaire
   └─> GET /api/patients/{patientId}/questionnaires/{id}

3. Praticien marque comme complété
   └─> setQuestionnaireStatus({ status: 'completed' })
       └─> Trigger onQuestionnaireCompleted
           └─> Créé questionnaireSubmissions/{id}
           └─> Met à jour compteurs
           └─> Envoie notifications
```

### **Scénario 4 : Réouverture**

```
1. Praticien décide de demander modifications
   └─> setQuestionnaireStatus({ status: 'reopened' })
       └─> Status: 'reopened'
       └─> Envoie email au patient
       └─> Crée notification in-app

2. Patient peut à nouveau modifier
   └─> PATCH .../responses (déverrouillé)

3. Patient soumet à nouveau
   └─> submitQuestionnaire()
       └─> Cycle recommence
```

---

## 🔐 Sécurité et permissions

### **Règles Firestore actuelles** (Root collection)

```javascript
// questionnaires/{questionnaireId}  ← Collection racine
match /questionnaires/{questionnaireId} {
  // Patient : lecture de ses questionnaires
  allow read: if isSignedIn() && resource.data.patientUid == request.auth.uid;

  // Patient : création si c'est son document
  allow create: if isSignedIn() && request.resource.data.patientUid == request.auth.uid;

  // Patient : modification SEULEMENT si status != 'submitted' ou 'completed'
  allow update: if isSignedIn()
                && resource.data.patientUid == request.auth.uid
                && resource.data.status in ['pending', 'in_progress'];

  // Praticien : lecture des questionnaires de ses patients
  allow read: if isSignedIn() && resource.data.practitionerId == request.auth.uid;

  // Admin : accès total
  allow read, write: if isAdmin();
}
```

### **⚠️ Problèmes de sécurité identifiés**

1. **Pas de validation côté serveur des réponses**

   - Patient peut envoyer n'importe quelle structure dans `responses`
   - Risque de pollution des données

2. **Pas de rate limiting**

   - Patient pourrait appeler `submitQuestionnaire()` en boucle
   - Risque de spam dans l'inbox praticien

3. **Emails non vérifiés**
   - Les emails sont envoyés sans vérifier la validité de l'adresse
   - Risque de bounce rate élevé

---

## 🚀 Optimisations proposées

### **1. Migration vers collection racine** (Priority: HIGH)

**Problème actuel** :

- Sous-collection `patients/{uid}/questionnaires/` → requêtes N+1 pour praticien
- Duplication dans `questionnaireSubmissions/` → coût de stockage

**Solution** :

```
questionnaires/{questionnaireId}  ← Collection racine unique
  ├── patientId: string (indexed)
  ├── practitionerId: string (indexed)
  └── ...
```

**Avantages** :

- ✅ 1 requête pour lister tous les questionnaires d'un praticien
- ✅ Plus de duplication
- ✅ Coût Firestore réduit de 80%

**Voir documentation** : `docs/QUESTIONNAIRE_STORAGE_OPTIMIZATION.md`

---

### **2. Ajout d'une couche HTTP API** (Priority: HIGH)

**Créer Express API dans `functions/src/http/`** :

```typescript
// functions/src/http/app.ts
import express from 'express';
import { questionnairesRouter } from './routes/questionnaires';

const app = express();
app.use('/api/questionnaires', questionnairesRouter);

export const api = onRequest(app);
```

**Avantages** :

- ✅ Endpoints RESTful standard
- ✅ Meilleure compatibilité avec clients tiers
- ✅ Cache HTTP natif
- ✅ Rate limiting plus facile

---

### **3. Validation avec Zod** (Priority: MEDIUM)

**Ajouter schémas de validation** :

```typescript
// functions/src/validation/questionnaires.ts
import { z } from 'zod';

export const SubmitQuestionnaireSchema = z.object({
  patientId: z.string().min(1),
  questionnaireId: z.string().min(1),
  responses: z.record(z.any()).optional(),
});

export const SetStatusSchema = z.object({
  patientId: z.string(),
  questionnaireId: z.string(),
  status: z.enum(['completed', 'reopened']),
});
```

**Utilisation** :

```typescript
export const submitQuestionnaire = onCall(async (req) => {
  const data = SubmitQuestionnaireSchema.parse(req.data);
  // data est maintenant typé et validé
});
```

---

### **4. Auto-save incrémental** (Priority: MEDIUM)

**Créer fonction `saveQuestionnaireProgress`** :

```typescript
export const saveQuestionnaireProgress = onCall(async (req) => {
  const { patientId, questionnaireId, responses } = req.data;

  // Validation
  if (req.auth?.uid !== patientId) {
    throw new HttpsError('permission-denied', 'Not your questionnaire');
  }

  const qRef = db.doc(`patients/${patientId}/questionnaires/${questionnaireId}`);

  // Merge avec réponses existantes
  await qRef.update({
    responses: admin.firestore.FieldValue.merge(responses),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'in_progress', // Passer de 'pending' à 'in_progress'
  });

  return { ok: true };
});
```

**Frontend** :

```typescript
// Auto-save toutes les 30 secondes
useEffect(() => {
  const interval = setInterval(() => {
    if (hasUnsavedChanges) {
      saveProgress(responses);
    }
  }, 30000);

  return () => clearInterval(interval);
}, [responses, hasUnsavedChanges]);
```

---

### **5. Rate limiting** (Priority: LOW)

**Utiliser Firebase App Check** :

```typescript
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { getAppCheck } from 'firebase-admin/app-check';

export const submitQuestionnaire = onCall({ consumeAppCheckToken: true }, async (req) => {
  // App Check token déjà vérifié
  // ...
});
```

**Alternative avec compteur Firestore** :

```typescript
// Limiter à 3 soumissions par minute
const rateLimitRef = db.doc(`rateLimits/${patientId}`);
const rateLimitSnap = await rateLimitRef.get();

if (rateLimitSnap.exists) {
  const count = rateLimitSnap.get('count') || 0;
  const lastReset = rateLimitSnap.get('lastReset')?.toDate();

  if (lastReset && Date.now() - lastReset.getTime() < 60000 && count >= 3) {
    throw new HttpsError('resource-exhausted', 'Too many requests');
  }
}
```

---

### **6. Tests unitaires** (Priority: MEDIUM)

**Ajouter firebase-functions-test** :

```typescript
// functions/src/__tests__/submitQuestionnaire.test.ts
import * as admin from 'firebase-admin';
import { expect } from 'chai';
import functionsTest from 'firebase-functions-test';

const test = functionsTest();

describe('submitQuestionnaire', () => {
  it('should submit questionnaire successfully', async () => {
    const wrapped = test.wrap(submitQuestionnaire);

    const result = await wrapped({
      data: {
        patientId: 'patient-123',
        questionnaireId: 'mode-de-vie',
      },
      auth: { uid: 'patient-123' },
    });

    expect(result.ok).to.be.true;
  });

  it('should reject unauthorized access', async () => {
    const wrapped = test.wrap(submitQuestionnaire);

    try {
      await wrapped({
        data: {
          patientId: 'patient-123',
          questionnaireId: 'mode-de-vie',
        },
        auth: { uid: 'attacker-456' }, // Différent du patientId
      });
      expect.fail('Should have thrown');
    } catch (error) {
      expect(error.code).to.equal('permission-denied');
    }
  });
});
```

---

## 📊 Métriques et monitoring

### **Logs structurés recommandés**

```typescript
logger.info('Questionnaire operation', {
  operation: 'submit',
  patientId,
  questionnaireId,
  practitionerId,
  duration: Date.now() - startTime,
  success: true,
});
```

### **Cloud Monitoring alertes**

1. **Taux d'erreur > 5%** → Alert praticien
2. **Latence > 2s** → Investigate performance
3. **Quota Firestore > 80%** → Scale up

---

## 🎯 Roadmap d'implémentation

### **Phase 1 : Stabilisation** (1-2 jours)

- [ ] Supprimer duplication `assignQuestionnaires` (existe dans index.ts + assignQuestionnaires.ts)
- [ ] Ajouter validation Zod
- [ ] Tests unitaires de base
- [ ] Logs structurés

### **Phase 2 : API HTTP** (2-3 jours)

- [ ] Créer Express app dans functions/src/http/
- [ ] Endpoints GET /questionnaires
- [ ] Endpoint PATCH /responses (auto-save)
- [ ] Rate limiting

### **Phase 3 : Migration storage** (3-5 jours)

- [ ] Créer collection racine `questionnaires/`
- [ ] Script de migration
- [ ] Double écriture temporaire
- [ ] Migration complète + suppression ancien système

### **Phase 4 : Features avancées** (optionnel)

- [ ] Templates de questionnaires dynamiques
- [ ] Analytics praticien (taux de complétion, temps moyen)
- [ ] Export PDF des réponses
- [ ] Questionnaires conditionnels (skip logic)

---

## 🔗 Liens utiles

- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Zod Validation](https://zod.dev/)
- [Express.js](https://expressjs.com/)

---

**Dernière mise à jour** : 6 novembre 2025  
**Auteur** : GitHub Copilot  
**Version API** : 1.0.0
