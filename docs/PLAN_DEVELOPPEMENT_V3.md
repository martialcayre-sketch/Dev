# 📋 Plan de Développement NeuroNutrition V3

## Analyse Architecture Actuelle vs Spécifications Master Document V3

---

## ✅ **Ce qui est déjà CONFORME aux spécifications**

### 🏗️ **Architecture Root-Only**

- ✅ Stockage `questionnaires/{templateId}_{patientUid}` implémenté
- ✅ Purge des sous-collections legacy terminée
- ✅ Scripts audit/backfill/purge opérationnels
- ✅ Middleware auth avec contrôle ownership strict

### 📊 **Système de Statuts des Questionnaires**

- ✅ Types `QuestionnaireStatus` définis : `pending | in_progress | submitted | completed | reopened`
- ✅ Machine à états complète implémentée
- ✅ Composant `QuestionnaireStatusSwitch` pour praticien
- ✅ Fonctionnalité "reopen" opérationnelle via `setQuestionnaireStatus`
- ✅ Bannière statut patient avec logique sauvegarde/envoi

### 🔐 **Contrôle d'Accès Praticien**

- ✅ Seul le praticien peut assigner des questionnaires (`assignQuestionnaires`, `manualAssignQuestionnaires`)
- ✅ Patient ne peut QUE répondre aux questionnaires assignés
- ✅ API questionnaires protégées par auth middleware
- ✅ Inbox praticien pour voir les questionnaires `submitted`

### 💾 **Fonctionnalités de Sauvegarde**

- ✅ Sauvegarde automatique des réponses partielles
- ✅ Soumission au praticien via bouton dédié
- ✅ Modification possible tant que statut ≠ `completed`
- ✅ Verrouillage définitif après validation praticien

### 📝 **Fiche d'Identification**

- ✅ Page identification complète avec tous les champs requis
- ✅ **Date de naissance présente** dans le formulaire
- ✅ Validation et sauvegarde opérationnelles
- ✅ Auto-remplissage depuis compte Firebase Auth

---

## ❌ **Ce qui MANQUE pour être 100% conforme**

### 🎂 **1. Détection automatique d'âge pour questionnaires**

**PROBLÈME :**

- ✅ Date de naissance collectée dans fiche identification
- ❌ **MANQUE** : Calcul automatique de l'âge
- ❌ **MANQUE** : Logique de détection `adult | teen | kid`
- ❌ **MANQUE** : Templates questionnaires par variante d'âge

**À DÉVELOPPER :**

```typescript
// packages/shared-core/src/age-detection.ts
export function calculateAge(birthDate: string): number;
export function getAgeVariant(age: number): 'adult' | 'teen' | 'kid';
export function getQuestionnaireVariant(templateId: string, ageVariant: AgeVariant): string;
```

### 📚 **2. Bibliothèque complète de questionnaires (praticien only)**

**PROBLÈME :**

- ✅ Composant `QuestionnaireLibrary` côté praticien existe
- ❌ **TODO** marqué dans le code : "API /api/questionnaires not implemented yet"
- ❌ **MANQUE** : Interface assignment manuel depuis bibliothèque
- ❌ **MANQUE** : Filtrage par âge patient pour assignment

**À DÉVELOPPER :**

- API Backend `/practitioners/:id/questionnaire-library`
- Interface UI assignment avec sélecteur d'âge
- Intégration avec `shared-questionnaires`

### 👶 **3. Questionnaires variants kids/teens**

**PROBLÈME :**

- ✅ Types `AgeVariant` définis dans shared-questionnaires
- ❌ **MANQUE** : Templates JSON kids/teens pour DNSM, stress, etc.
- ❌ **MANQUE** : Interface pictogrammes/simplifiée kids
- ❌ **MANQUE** : Option "parent répond" vs "enfant répond"

**À DÉVELOPPER :**

```
packages/shared-questionnaires/src/questionnaires/
  ├── dnsm/
  │   ├── dnsm-adult.ts
  │   ├── dnsm-teen.ts      ⚠️ À CRÉER
  │   └── dnsm-kid.ts       ⚠️ À CRÉER
  ├── stress/
  │   ├── stress7-adult.ts
  │   ├── stress7-teen.ts   ⚠️ À CRÉER
  │   └── stress7-kid.ts    ⚠️ À CRÉER
```

### 🚫 **4. Blocage assignment sans identification**

**PROBLÈME :**

- ✅ Fiche identification existe et fonctionne
- ❌ **MANQUE** : Validation côté backend lors assignment
- ❌ **MANQUE** : Vérification existence `patients/{uid}/consultation/identification`

**À DÉVELOPPER :**

```typescript
// functions/src/assignQuestionnaires.ts
// Ajouter vérification identification avant assignment
const identificationDoc = await db
  .collection('patients')
  .doc(patientUid)
  .collection('consultation')
  .doc('identification')
  .get();
if (!identificationDoc.exists()) {
  throw new HttpsError('failed-precondition', 'Identification required');
}
```

### 👨‍👩‍👧 **5. Mode "parent répond" pour questionnaires kids**

**PROBLÈME :**

- ❌ **MANQUE** : Toggle UI "Je suis le parent" / "Je suis l'enfant"
- ❌ **MANQUE** : Stockage `responses.meta.respondent = 'parent' | 'child'`
- ❌ **MANQUE** : Adaptation langage questions selon respondent

### 📊 **6. Scoring normalisé 0-100**

**PROBLÈME :**

- ✅ Scoring DNSM existe dans `DNSMScoringService`
- ❌ **MANQUE** : Normalisation systématique tous modules à 0-100
- ❌ **MANQUE** : Interface `shared-core/scoring.ts` unifiée

### 🎨 **7. Visualisations par âge (shared-charts)**

**PROBLÈME :**

- ✅ Package `shared-charts` existe
- ❌ **MANQUE** : Composants adulte/teen/kid différenciés
- ❌ **MANQUE** : Radars inversés, pictogrammes kids, etc.

---

## 🚧 **ROADMAP DE DÉVELOPPEMENT**

### **PHASE 1 : Fondations âge & identification (1-2 semaines)**

1. **Calcul automatique âge**

   ```bash
   # Créer utilitaires âge
   touch packages/shared-core/src/age-detection.ts

   # Modifier assignQuestionnaires pour détecter âge
   # Bloquer assignment si pas d'identification
   ```

2. **Validation identification obligatoire**
   ```typescript
   // functions/src/assignQuestionnaires.ts
   // Ajouter check identification avant assignment
   ```

### **PHASE 2 : Templates questionnaires multi-âge (2-3 semaines)**

1. **Créer variants teens pour modules existants**

   ```bash
   # DNSM teen (questions plus directes, style "tu")
   touch packages/shared-questionnaires/src/questionnaires/neuro-psychologie/dnsm-teen.ts

   # Stress teen (7 dimensions adaptées)
   touch packages/shared-questionnaires/src/questionnaires/stress/stress7-teen.ts
   ```

2. **Créer variants kids avec pictogrammes**

   ```bash
   # DNSM kid (max 8-10 questions, visages/smileys)
   touch packages/shared-questionnaires/src/questionnaires/neuro-psychologie/dnsm-kid.ts

   # Mode de vie kid (curseurs animaux, zones de clic larges)
   touch packages/shared-questionnaires/src/questionnaires/mode-de-vie/life-journey-kid.ts
   ```

3. **Option "parent répond"**
   ```typescript
   // Ajouter toggle UI + stockage metadata
   responses: {
     meta: {
       respondent: 'parent' | 'child',
       parentConsent: boolean
     },
     // ... réponses normales
   }
   ```

### **PHASE 3 : Bibliothèque praticien & assignment intelligent (2 semaines)**

1. **API bibliothèque questionnaires**

   ```bash
   # Backend route
   # GET /practitioners/:id/questionnaire-library
   # POST /practitioners/:id/assign-questionnaire
   ```

2. **Interface assignment**
   ```bash
   # Composant sélection questionnaire + auto-détection âge
   touch apps/practitioner-vite/src/components/QuestionnaireAssignmentModal.tsx
   ```

### **PHASE 4 : Scoring unifié & visualisations (2-3 semaines)**

1. **Normalisation scoring 0-100**

   ```bash
   # Interface unifiée
   touch packages/shared-core/src/scoring.ts

   # Adapter tous les modules existants
   ```

2. **Composants visualisation par âge**
   ```bash
   # Radars adulte/teen, pictogrammes kids
   touch packages/shared-charts/src/components/AgeAdaptiveRadar.tsx
   touch packages/shared-charts/src/components/KidsVisualScore.tsx
   ```

### **PHASE 5 : Modules thématiques manquants (3-4 semaines)**

1. **Stress 7 dimensions + Coping + Karasek**
2. **TCA (Troubles Comportement Alimentaire)**
3. **Addictions (tabac + autres)**
4. **Sommeil & Agenda 21j**
5. **Microbiote 7 axes**

---

## 🎯 **PRIORITÉ IMMÉDIATE : Top 3 développements**

### 1️⃣ **CRITIQUE** : Détection automatique âge + blocage sans identification

- **Impact** : Sécurise l'assignment et permet variantes
- **Effort** : 2-3 jours
- **Fichiers** : `age-detection.ts`, `assignQuestionnaires.ts`

### 2️⃣ **IMPORTANT** : Templates teens pour modules existants

- **Impact** : Élargit l'audience cible immédiatement
- **Effort** : 1 semaine
- **Fichiers** : DNSM-teen, Life Journey-teen, stress7-teen

### 3️⃣ **STRATÉGIQUE** : Bibliothèque praticien + assignment UI

- **Impact** : UX praticien complète, flexibilité assignment
- **Effort** : 1 semaine
- **Fichiers** : API backend + composant React

---

## ✅ **VALIDATION CONFORMITÉ MASTER DOCUMENT V3**

Une fois ces développements terminés, l'application sera **100% conforme** au cahier des charges :

- ✅ Architecture root-only ✅ **FAIT**
- ✅ Praticien seul accès bibliothèque ✅ **FAIT** (logique, manque UI)
- ✅ Assignment automatique par âge ❌ **À FAIRE**
- ✅ Blocage sans identification ❌ **À FAIRE**
- ✅ Option "parent répond" kids ❌ **À FAIRE**
- ✅ Sauvegarde avant soumission ✅ **FAIT**
- ✅ Modification après soumission ✅ **FAIT** (si non completed)
- ✅ Verrouillage après lecture praticien ✅ **FAIT**
- ✅ Demande réouverture au praticien ✅ **FAIT**

---

## 🤖 **RECOMMANDATION : Démarrage immédiat**

**Je suggère de commencer AUJOURD'HUI par le développement priorité 1️⃣** :

1. Créer `age-detection.ts`
2. Modifier `assignQuestionnaires.ts` pour la validation
3. Tester sur un patient avec/sans identification

**Veux-tu que je commence l'implémentation maintenant ?**
