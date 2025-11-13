# 🏗️ Optimisation du stockage des questionnaires

## 📊 Architecture actuelle vs proposée

### **Ancienne (sous-collections)** ❌ DÉPRÉCIÉE

```
patients/{patientId}/questionnaires/{questionnaireId}  ← LEGACY, purgé
questionnaireSubmissions/{submissionId}  ← duplication après soumission
```

**Problèmes résolus :**

- ❌ Duplication des données (2 copies du même questionnaire)
- ❌ Impossible de requêter tous les questionnaires d'un praticien en 1 requête
- ❌ Requêtes N+1 pour le dashboard praticien
- ❌ Index collection group nécessaires pour certaines requêtes

---

## ✅ **OPTION A : Collection racine normalisée** (✅ DÉPLOYÉE EN PRODUCTION)

### **Nouvelle structure**

```
questionnaires/{questionnaireId}
  ├── id: string
  ├── patientId: string  ← index
  ├── practitionerId: string  ← index
  ├── templateId: string  ("plaintes-et-douleurs", "mode-de-vie"...)
  ├── status: string  ("pending" | "in_progress" | "submitted" | "completed")
  ├── title: string
  ├── category: string
  ├── assignedAt: Timestamp
  ├── startedAt?: Timestamp
  ├── submittedAt?: Timestamp
  ├── completedAt?: Timestamp
  └── responses: object

patients/{patientId}
  ├── pendingQuestionnairesCount: number  ← dénormalisé pour UI
  └── completedQuestionnairesCount: number
```

### **Avantages**

✅ **Performance**

- 1 seule requête pour tous les questionnaires d'un praticien
- 1 seule requête pour tous les questionnaires d'un patient
- Plus besoin de collection group queries

✅ **Simplicité**

- 1 seule source de vérité (plus de duplication)
- Moins de synchronisation à gérer
- Règles Firestore plus simples

✅ **Flexibilité**

- Facile d'ajouter des filtres (par status, par date, par catégorie)
- Support natif des requêtes composées
- Meilleure scalabilité

### **Index Firestore requis**

```json
{
  "indexes": [
    {
      "collectionGroup": "questionnaires",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "practitionerId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "assignedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "questionnaires",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "patientId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    }
  ]
}
```

### **Règles Firestore**

```javascript
match /questionnaires/{questionnaireId} {
  // Patient peut lire ses propres questionnaires
  allow read: if isSignedIn() && resource.data.patientId == request.auth.uid;

  // Patient peut créer/modifier SEULEMENT si status n'est PAS submitted/completed
  allow create: if isSignedIn() && request.resource.data.patientId == request.auth.uid;
  allow update: if isSignedIn()
                && resource.data.patientId == request.auth.uid
                && resource.data.status in ['pending', 'in_progress'];

  // Praticien peut lire les questionnaires de ses patients
  allow read: if isSignedIn() && resource.data.practitionerId == request.auth.uid;

  // Praticien peut modifier le status (completed, reopened)
  allow update: if isSignedIn() && resource.data.practitionerId == request.auth.uid;

  // Admin peut tout faire
  allow read, write: if isAdmin();
}
```

### **Requêtes optimisées**

```typescript
// Dashboard patient : tous mes questionnaires
const q = query(
  collection(firestore, 'questionnaires'),
  where('patientId', '==', user.uid),
  orderBy('assignedAt', 'desc')
);

// Dashboard praticien : questionnaires en attente de tous mes patients
const q = query(
  collection(firestore, 'questionnaires'),
  where('practitionerId', '==', practitionerId),
  where('status', '==', 'pending'),
  orderBy('assignedAt', 'desc')
);

// Statistiques praticien : nombre de questionnaires par status
const q = query(
  collection(firestore, 'questionnaires'),
  where('practitionerId', '==', practitionerId),
  where('status', 'in', ['pending', 'submitted', 'completed'])
);
```

---

## 🔄 **OPTION B : Hybrid (sous-collection + dénormalisation)**

### **Structure**

```
patients/{patientId}/questionnaires/{questionnaireId}  ← conservé
questionnaires-flat/{questionnaireId}  ← vue dénormalisée
```

**Quand l'utiliser :**

- Si vous voulez garder la logique actuelle
- Si migration complète trop risquée
- Si besoin de compatibilité arrière

**Inconvénients :**

- Complexité de synchronisation
- Duplication des données
- Risque d'incohérence

---

## 📋 **Plan de migration vers Option A** ✅ TERMINÉ

### **Phase 1 : Préparation** ✅

1. ✅ Créer la nouvelle collection `questionnaires` (racine)
2. ✅ Ajouter les index Firestore
3. ✅ Déployer les nouvelles règles de sécurité
4. ✅ Créer fonction de migration de données

### **Phase 2 : Migration des données** ✅

```typescript
// Script de migration
async function migrateQuestionnaires() {
  const patientsSnapshot = await db.collection('patients').get();
  const batch = db.batch();
  let count = 0;

  for (const patientDoc of patientsSnapshot.docs) {
    const patientId = patientDoc.id;
    const questionnairesSnapshot = await db
      .collection('patients')
      .doc(patientId)
      .collection('questionnaires')
      .get();

    for (const questionnaireDoc of questionnairesSnapshot.docs) {
      const data = questionnaireDoc.data();

      // Créer dans la nouvelle collection
      const newRef = db.collection('questionnaires').doc();
      batch.set(newRef, {
        ...data,
        patientId,
        practitionerId: data.practitionerId || null,
        templateId: data.id,
        migratedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      count++;

      // Firestore batch limité à 500 opérations
      if (count % 500 === 0) {
        await batch.commit();
        batch = db.batch();
      }
    }
  }

  if (count % 500 !== 0) {
    await batch.commit();
  }

  console.log(`✅ Migrated ${count} questionnaires`);
}
```

### **Phase 3 : Mise à jour du code**

**Avant (sous-collection) :**

```typescript
const questionnairesRef = collection(firestore, 'patients', user.uid, 'questionnaires');
const snapshot = await getDocs(questionnairesRef);
```

**Après (collection racine) :**

```typescript
const questionnairesRef = query(
  collection(firestore, 'questionnaires'),
  where('patientId', '==', user.uid)
);
const snapshot = await getDocs(questionnairesRef);
```

### **Phase 4 : Double écriture temporaire**

```typescript
// Écrire dans les 2 emplacements pendant la transition
async function createQuestionnaire(data) {
  const batch = db.batch();

  // Ancienne structure (compatibilité)
  const oldRef = db
    .collection('patients')
    .doc(data.patientId)
    .collection('questionnaires')
    .doc(data.id);
  batch.set(oldRef, data);

  // Nouvelle structure
  const newRef = db.collection('questionnaires').doc();
  batch.set(newRef, { ...data, patientId: data.patientId });

  await batch.commit();
}
```

### **Phase 5 : Suppression ancien système**

1. Vérifier que toutes les apps utilisent la nouvelle structure
2. Supprimer les lectures de l'ancienne sous-collection
3. Supprimer les anciennes données (après backup)
4. Supprimer `questionnaireSubmissions` (devenu inutile)

---

## 💡 **Autres optimisations**

### **1. Dénormalisation stratégique**

Stocker des compteurs dans le document patient :

```typescript
patients/{patientId}
  ├── pendingQuestionnairesCount: 3
  ├── completedQuestionnairesCount: 12
  └── lastQuestionnaireCompletedAt: Timestamp
```

**Avantages :**

- Affichage instantané des badges/compteurs
- Pas de requête pour compter les questionnaires
- Meilleure UX

**Mise à jour via Cloud Function :**

```typescript
export const onQuestionnaireStatusChange = onDocumentUpdated(
  'questionnaires/{questionnaireId}',
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    if (before?.status !== after?.status) {
      const patientRef = db.collection('patients').doc(after.patientId);

      if (after.status === 'completed') {
        await patientRef.update({
          pendingQuestionnairesCount: admin.firestore.FieldValue.increment(-1),
          completedQuestionnairesCount: admin.firestore.FieldValue.increment(1),
          lastQuestionnaireCompletedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }
  }
);
```

### **2. Pagination efficace**

```typescript
const PAGE_SIZE = 20;

// Première page
const firstQuery = query(
  collection(firestore, 'questionnaires'),
  where('practitionerId', '==', practitionerId),
  orderBy('assignedAt', 'desc'),
  limit(PAGE_SIZE)
);

// Pages suivantes
const nextQuery = query(
  collection(firestore, 'questionnaires'),
  where('practitionerId', '==', practitionerId),
  orderBy('assignedAt', 'desc'),
  startAfter(lastDoc),
  limit(PAGE_SIZE)
);
```

### **3. Cache côté client**

```typescript
import { useFirestoreQuery } from '@react-query-firebase/firestore';

const { data, isLoading } = useFirestoreQuery(
  ['questionnaires', user.uid],
  query(collection(firestore, 'questionnaires'), where('patientId', '==', user.uid)),
  {
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
    cacheTime: 10 * 60 * 1000,
  }
);
```

---

## 📈 **Impact estimé**

### **Avant (architecture actuelle)**

- Dashboard praticien : **N requêtes** (1 par patient)
- Temps de chargement : **2-5 secondes** (50+ patients)
- Coût Firestore : **élevé** (lectures multiples)

### **Après (Option A)**

- Dashboard praticien : **1 requête**
- Temps de chargement : **< 500ms**
- Coût Firestore : **réduit de 80%**

---

## 🎯 **Recommandation finale**

**Adoptez Option A (collection racine)** pour :

- ✅ Performance maximale
- ✅ Simplicité du code
- ✅ Réduction des coûts
- ✅ Meilleure scalabilité

**Gardez Option B** uniquement si :

- Contrainte de compatibilité forte
- Migration impossible à court terme
- Règles métier complexes nécessitant isolation

---

## ✅ **État actuel (Novembre 2025)**

### Migration terminée

- ✅ Collection racine `questionnaires/{templateId}_{patientUid}` déployée
- ✅ Toutes les fonctions Cloud Functions migrées (root-only)
- ✅ Scripts de backfill et audit créés
- ✅ Purge sécurisée des sous-collections legacy effectuée
- ✅ Audit global: `rootCount=4, subCount=0` pour tous les patients

### Scripts disponibles

```bash
# Audit global (compare root vs subcollections)
node scripts/audit-questionnaires.mjs --all --limit 500 --csv audit.csv

# Backfill depuis subcollections vers root
node scripts/backfill-questionnaires.mjs --email patient@example.com

# Purge sécurisée des subcollections legacy
node scripts/purge-legacy-questionnaires.mjs --all --csv purge.csv --confirm delete
```

### Scripts legacy archivés

Tous les anciens scripts de double-write sont dans `scripts/_deprecated/` avec un README explicatif.

---

## 📞 **Prochaines étapes recommandées**

1. **Monitoring** continu via audit périodique
2. **Créer** un job planifié (Cloud Scheduler) pour alertes automatiques
3. **Supprimer** définitivement les sous-collections après période de grâce (optionnel)
