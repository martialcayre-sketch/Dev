# 🚀 Prompt V3.1 Corrigé - Conformité Architecture NeuroNutrition

## 🎯 OBJECTIF : Compléter le flux praticien→patient V3 avec détection d'âge

Tu travailles sur le monorepo "NeuroNutrition App" (pnpm workspaces), avec :

- **Frontends** : apps/patient-vite + apps/practitioner-vite (Firebase Hosting)
- **Backend API** : Firebase Cloud Functions Gen2 (Express HTTP + callables)
- **Data** : Firestore (architecture root-only `questionnaires/{templateId}_{patientUid}`)
- **Auth** : Firebase Auth (Email, Google, Facebook, LinkedIn)
- **Partagé** : packages/shared-core, shared-ui, shared-questionnaires, etc.

---

## 🏗️ ARCHITECTURE ACTUELLE (à respecter)

### **Relation praticien-patient EXISTANTE**

1. **Invitation** : Praticien utilise `createPatientInvitation(email, firstname, lastname, phone)`

   - ✅ Crée DIRECTEMENT compte Firebase Auth + document `patients/{uid}`
   - ✅ Génère token temporaire + lien `/signup?token=XYZ`
   - ✅ Envoie email avec mot de passe temporaire

2. **Activation** : Patient clique lien, utilise mot de passe temporaire

   - ✅ `activatePatient()` confirme l'activation
   - ✅ Assigne IMMÉDIATEMENT les 4 questionnaires par défaut (ADULTE uniquement)
   - ✅ Notifie praticien + patient

3. **Questionnaires** : Architecture root-only fonctionnelle
   - ✅ `questionnaires/{templateId}_{patientUid}`
   - ✅ Système de statuts : `pending | in_progress | submitted | completed | reopened`
   - ✅ API sécurisées (Cloud Functions uniquement)

---

## ❌ CE QUI MANQUE (ton objectif)

### **1. 🎂 Détection automatique d'âge**

**PROBLÈME** : Actuellement, TOUS les patients reçoivent les 4 questionnaires ADULTES.

**SOLUTION V3** :

- Ajouter calcul d'âge depuis date de naissance (fiche identification)
- Implémenter sélection questionnaires par tranche : `ADULT | TEEN | KIDS`
- Modifier `assignQuestionnaires.ts` pour supporter les variants

### **2. 📝 Fiche d'identification obligatoire AVANT assignation**

**PROBLÈME** : `activatePatient` assigne immédiatement, sans fiche identification.

**SOLUTION V3** :

- Modifier `activatePatient` : ne PAS assigner de questionnaires
- Créer endpoint `/api/patient/complete-identification`
- APRÈS soumission fiche → calculer âge → assigner questionnaires appropriés

### **3. 👶 Templates questionnaires kids/teens**

**PROBLÈME** : Seuls les templates ADULTS existent.

**SOLUTION V3** :

- Créer variants dans `packages/shared-questionnaires/`
- `dnsm-teen.ts`, `dnsm-kid.ts`, `stress7-teen.ts`, etc.

---

## 🎯 FLUX CIBLE V3 (modifié pour respecter l'existant)

### **Étapes 1-2 : Invitation + Activation (✅ DÉJÀ OK)**

```typescript
// 1. Praticien invite → createPatientInvitation
// 2. Patient clique lien → utilise mot de passe temporaire
// 3. activatePatient() confirme → MAIS ne pas assigner questionnaires encore
```

### **Étape 3 : Fiche identification OBLIGATOIRE (🚧 À CRÉER)**

```typescript
// 4. Patient redirigé vers /identification (obligatoire)
// 5. Soumission fiche → POST /api/patient/complete-identification
//    - Sauvegarde données patient (nom, prénom, sexe, dateNaissance, etc.)
//    - Calcule âge : detectPatientAge(dateNaissance)
//    - Détermine tranche : getAgeGroup(age) → 'adult' | 'teen' | 'kid'
//    - SI hasQuestionnairesAssigned === false :
//      → assignAgeAppropriateQuestionnaires(patientUid, ageGroup)
```

### **Étape 4 : Dashboard questionnaires (✅ EXISTANT, à adapter)**

```typescript
// 6. Patient voit ses questionnaires adaptés à son âge
// 7. Praticien voit le statut dans sa fiche patient
```

---

## 📝 TÂCHES DE DÉVELOPPEMENT

### **TÂCHE 1 : Modifier `activatePatient.ts`**

**AVANT** (actuel) :

```typescript
// Assigne immédiatement DEFAULT_QUESTIONNAIRES (adulte)
for (const template of DEFAULT_QUESTIONNAIRES) { ... }
```

**APRÈS** (V3) :

```typescript
// NE PAS assigner de questionnaires dans activatePatient
// Mettre hasQuestionnairesAssigned: false
// Rediriger patient vers /identification
await patientRef.update({
  status: 'approved',
  hasQuestionnairesAssigned: false, // ⚠️ Changement clé
  identificationRequired: true,
});
```

### **TÂCHE 2 : Créer endpoint identification**

**Nouveau fichier** : `functions/src/http/routes/identification.ts`

```typescript
app.post('/api/patient/complete-identification', authenticatePatient, async (req, res) => {
  const patientUid = req.user.uid;
  const { firstname, lastname, sexe, dateNaissance, taille, poids } = req.body;

  // 1. Calculer âge et tranche
  const age = calculateAge(dateNaissance);
  const ageGroup = getAgeGroup(age); // 'adult' | 'teen' | 'kid'

  // 2. Sauvegarder identification
  await db.collection('patients').doc(patientUid).update({
    firstname,
    lastname,
    sexe,
    dateNaissance,
    taille,
    poids,
    age,
    ageGroup,
    identificationCompleted: true,
    identificationCompletedAt: FieldValue.serverTimestamp(),
  });

  // 3. Assigner questionnaires SI pas encore fait
  const patientDoc = await db.collection('patients').doc(patientUid).get();
  const patientData = patientDoc.data();

  if (!patientData.hasQuestionnairesAssigned) {
    await assignAgeAppropriateQuestionnaires(patientUid, ageGroup);
  }

  res.json({ success: true, ageGroup, questionnairesAssigned: true });
});
```

### **TÂCHE 3 : Créer fonction `assignAgeAppropriateQuestionnaires`**

**Nouveau fichier** : `functions/src/utils/ageAwareAssignment.ts`

```typescript
import { QUESTIONNAIRE_TEMPLATES_BY_AGE } from '../constants/questionnairesByAge';

export async function assignAgeAppropriateQuestionnaires(
  patientUid: string,
  ageGroup: 'adult' | 'teen' | 'kid'
) {
  const templates = QUESTIONNAIRE_TEMPLATES_BY_AGE[ageGroup];
  const batch = db.batch();

  for (const template of templates) {
    const questionnaireId = `${template.id}_${patientUid}`;
    const ref = db.collection('questionnaires').doc(questionnaireId);

    batch.set(ref, {
      ...template,
      patientUid,
      status: 'pending',
      assignedAt: FieldValue.serverTimestamp(),
      responses: {},
    });
  }

  await batch.commit();

  // Mettre à jour compteurs patient
  await db.collection('patients').doc(patientUid).update({
    hasQuestionnairesAssigned: true,
    pendingQuestionnairesCount: templates.length,
    questionnairesAssignedAt: FieldValue.serverTimestamp(),
  });
}
```

### **TÂCHE 4 : Créer templates par âge**

**Nouveau fichier** : `functions/src/constants/questionnairesByAge.ts`

```typescript
export const QUESTIONNAIRE_TEMPLATES_BY_AGE = {
  adult: [
    { id: 'plaintes-et-douleurs', title: 'Plaintes & Douleurs' },
    { id: 'life-journey', title: 'Parcours de Vie' },
    { id: 'dnsm', title: 'Neurotransmetteurs' },
    { id: 'alimentaire-siin', title: 'Alimentation' },
  ],
  teen: [
    { id: 'plaintes-douleurs-teen', title: 'Douleurs & Stress (Ado)' },
    { id: 'life-journey-teen', title: 'Mon Parcours (Ado)' },
    { id: 'dnsm-teen', title: 'Mes Émotions (Ado)' },
    { id: 'alimentaire-teen', title: 'Mon Alimentation (Ado)' },
  ],
  kid: [
    { id: 'plaintes-douleurs-kid', title: 'Mes Bobos (Enfant)' },
    { id: 'mode-de-vie-kid', title: 'Ma Journée (Enfant)' },
    { id: 'dnsm-kid', title: 'Mes Humeurs (Enfant)' },
    { id: 'alimentaire-kid', title: 'Ce que je Mange (Enfant)' },
  ],
};
```

### **TÂCHE 5 : Créer utilitaires âge**

**Nouveau fichier** : `packages/shared-core/src/age-detection.ts`

```typescript
export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function getAgeGroup(age: number): 'adult' | 'teen' | 'kid' {
  if (age <= 12) return 'kid';
  if (age <= 18) return 'teen';
  return 'adult';
}
```

### **TÂCHE 6 : Frontend - Page identification obligatoire**

**Modifier** : `apps/patient-vite/src/pages/IdentificationPage.tsx`

```typescript
// Rendre cette page OBLIGATOIRE après signup
// Si patient.identificationCompleted === false → rediriger vers /identification
// Après soumission → appeler POST /api/patient/complete-identification
// Afficher message : "Tes questionnaires ont été générés pour ton âge !"
```

---

## 🔍 RÈGLES DE VALIDATION

### **Critères d'acceptation V3**

- ✅ Un praticien invite un patient → `createPatientInvitation` (existant, ne pas changer)
- ✅ Patient active son compte → `activatePatient` mais SANS questionnaires
- ✅ Patient DOIT remplir fiche identification avant d'accéder aux questionnaires
- ✅ Selon l'âge, 4 questionnaires appropriés sont assignés (adult/teen/kid variants)
- ✅ Architecture root-only respectée : `questionnaires/{templateId}_{patientUid}`
- ✅ Aucune sous-collection, sécurité Cloud Functions maintenue
- ✅ Frontend patient redirige automatiquement vers identification si incomplète

### **Ne pas casser l'existant**

- ✅ Garder `createPatientInvitation` tel quel (fonctionne en prod)
- ✅ Respecter système de statuts questionnaires existant
- ✅ Maintenir API praticien pour voir les questionnaires patients
- ✅ Conserver toute la logique de sauvegarde/soumission

---

## 🚀 PLAN D'IMPLÉMENTATION

### **PHASE 1 : Backend (2-3 jours)**

1. Créer `age-detection.ts` dans shared-core
2. Modifier `activatePatient.ts` → retirer assignation questionnaires
3. Créer endpoint `/api/patient/complete-identification`
4. Créer fonction `assignAgeAppropriateQuestionnaires`
5. Tester avec un patient de test

### **PHASE 2 : Templates teen/kid (1 semaine)**

1. Créer les 8 templates manquants dans `shared-questionnaires`
2. Adapter pour langage "tu" (teen) et pictogrammes (kid)
3. Tester assignation par âge

### **PHASE 3 : Frontend (2-3 jours)**

1. Rendre `/identification` obligatoire après activation
2. Ajouter calcul âge côté frontend (preview)
3. Afficher message confirmation avec âge détecté

**Veux-tu que je commence l'implémentation maintenant ?**
