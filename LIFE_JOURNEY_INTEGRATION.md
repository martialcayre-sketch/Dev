# 🎯 Intégration Life Journey - Questionnaire Mode de Vie

## ✅ Résumé des Changements

Le questionnaire **Life Journey (7 Sphères Vitales)** est maintenant le questionnaire contextuel par défaut assigné automatiquement à chaque nouveau patient, remplaçant l'ancien questionnaire mode-de-vie.

## ⚠️ IMPORTANT : Migration des Patients Existants

**Les modifications n'affectent QUE les nouveaux patients.** Les patients existants ont encore l'ancien questionnaire `mode-de-vie` assigné.

### 🔄 Pour Mettre à Jour les Patients Existants

Un script de migration automatique a été créé pour remplacer `mode-de-vie` par `life-journey` pour tous les patients existants.

📚 **Documentation complète** : [MIGRATION_PATIENTS_LIFE_JOURNEY.md](./MIGRATION_PATIENTS_LIFE_JOURNEY.md)

**Commande rapide :**

```powershell
cd C:\Dev
.\scripts\migrate-mode-de-vie-to-life-journey.ps1
```

**Ce que fait le script :**

- ✅ Trouve tous les patients avec `mode-de-vie` assigné
- ✅ Crée `life-journey` en préservant statut et réponses
- ✅ Supprime l'ancien `mode-de-vie`
- ✅ Idempotent (peut être exécuté plusieurs fois)

**Prérequis :** Fichier `serviceAccountKey.json` à la racine (téléchargez depuis Firebase Console → Paramètres → Comptes de service)

## 📊 Structure du Questionnaire Life Journey

### 6 Sphères Évaluées

1. **Sphère Physique** (`physical`)
   - Niveau d'énergie physique
   - Fréquence d'activité physique
   - Douleurs physiques
   - Qualité du sommeil
   - Vitalité au réveil

2. **Sphère Émotionnelle** (`emotional`)
   - Bien-être émotionnel général
   - Humeur quotidienne
   - Fréquence du stress/anxiété
   - Aisance à exprimer les émotions
   - Résilience émotionnelle

3. **Sphère Mentale** (`mental`)
   - Clarté mentale
   - Capacité de concentration
   - Qualité de la mémoire
   - Facilité d'apprentissage
   - Créativité et résolution de problèmes

4. **Sphère Sociale** (`social`)
   - Qualité des relations sociales
   - Soutien social disponible
   - Fréquence des interactions significatives
   - Sentiment d'appartenance
   - Capacité de communication

5. **Sphère Spirituelle** (`spiritual`)
   - Sens et but de la vie
   - Alignement avec les valeurs personnelles
   - Pratique spirituelle/méditative
   - Sentiment de gratitude
   - Connexion à quelque chose de plus grand

6. **Sphère Environnementale** (`environmental`)
   - Qualité de l'environnement de vie
   - Qualité de l'environnement de travail
   - Temps passé dans la nature
   - Exposition à la pollution
   - Sentiment de sécurité

### Types de Questions

- **Slider** (0-100) : Pour les évaluations subjectives continues
- **Select** : Pour les choix multiples avec attribution de points

Chaque réponse contribue au score de sa sphère (0-100).

## 🔄 Flux de Données

### 1. Assignation Automatique

Lors de la création d'un compte patient, 4 questionnaires sont assignés automatiquement :

```typescript
const DEFAULT_QUESTIONNAIRES = [
  { id: 'plaintes-et-douleurs', title: 'Mes plaintes actuelles...' },
  { id: 'life-journey', title: 'Mode de vie – 7 Sphères Vitales' }, // ⭐ NOUVEAU
  { id: 'alimentaire', title: 'Questionnaire alimentaire' },
  { id: 'dnsm', title: 'Questionnaire Dopamine-Noradrénaline...' },
];
```

**Cloud Function**: `assignQuestionnaires()` (déployée sur europe-west1)

### 2. Remplissage Patient

Le patient accède au questionnaire via :

- URL: `/dashboard/life-journey`
- Composant: `LifeJourneyPage.tsx`
- Formulaire: `LifeJourney7Spheres.tsx`

### 3. Persistance des Données

Les données sont sauvegardées dans **2 emplacements** :

#### A. Collection utilisateur (historique)

```
users/{uid}/surveys/{surveyId}
```

#### B. Collection Life Journey (pour le praticien)

```
patients/{uid}/lifejourney/{id}
{
  answers: { ... },
  scores: {
    physical: { raw: 450, max: 500, percent: 90 },
    emotional: { raw: 380, max: 500, percent: 76 },
    mental: { raw: 420, max: 500, percent: 84 },
    social: { raw: 350, max: 500, percent: 70 },
    spiritual: { raw: 400, max: 500, percent: 80 },
    environmental: { raw: 410, max: 500, percent: 82 }
  },
  global: 80.3,
  submittedAt: Timestamp,
  patientUid: "...",
  practitionerId: "..."
}
```

**Fonction**: `submitLifeJourney()` dans `apps/patient-vite/src/features/lifejourney/submit.ts`

### 4. Visualisation Praticien

Le praticien voit automatiquement le **radar graph** dans la fiche patient :

- **Page**: `PatientDetailPage.tsx` (practitioner-vite)
- **Hook API**: `usePatientLifeJourneyApi(patientId)`
- **Composant**: `<LifeJourneyRadar data={lifejourneyData} />`
- **Endpoint REST**: `GET /api/patients/:patientId/lifejourney`

Le radar affiche les 6 dimensions avec leurs scores en temps réel.

## 🗂️ Fichiers Modifiés

### Packages

1. **`packages/shared-questionnaires/src/questionnaires/mode-de-vie/life-journey.ts`** ⭐ NOUVEAU
   - Définition complète du questionnaire Life Journey
   - 6 sections (spheres) avec 5 questions chacune
   - Questions de type `slider` et `select`

2. **`packages/shared-questionnaires/src/index.ts`**
   - Export du nouveau questionnaire `life_journey`
   - Ajout à `getAllQuestionnaires()`

3. **`packages/shared-questionnaires/src/types.ts`**
   - Ajout du type `'slider'` dans `QuestionType`
   - Ajout de `'mode-de-vie-siin'` dans `MedicalCategory`
   - Ajout des propriétés `min`, `max`, `step`, `defaultValue`, `labels` pour les questions slider

### Cloud Functions

4. **`functions/src/assignQuestionnaires.ts`**
   - Remplacement de l'ancien `mode-de-vie` par `life-journey` dans `DEFAULT_QUESTIONNAIRES`
   - Mise à jour de la description

### Applications (déjà existantes, pas de modification nécessaire)

- ✅ `apps/patient-vite/src/pages/LifeJourneyPage.tsx` - Page de remplissage
- ✅ `apps/patient-vite/src/components/SIIN/LifeJourney7Spheres.tsx` - Formulaire
- ✅ `apps/patient-vite/src/features/lifejourney/submit.ts` - Persistance
- ✅ `apps/practitioner-vite/src/pages/PatientDetailPage.tsx` - Affichage radar
- ✅ Hook `usePatientLifeJourneyApi` - Fetch via REST API

## 🚀 Déploiement

### 1. Packages Built

```bash
pnpm -F @neuronutrition/shared-questionnaires build
# ✓ Built in 1.4s
```

### 2. Cloud Function Déployée

```bash
firebase deploy --only functions:assignQuestionnaires
# ✓ assignQuestionnaires(europe-west1) deployed
```

### 3. Applications Déployées

```bash
pnpm -F @neuronutrition/patient-vite build         # ✓ 11.65s
pnpm -F @neuronutrition/practitioner-vite build   # ✓ 12.76s
firebase deploy --only hosting:patient,hosting:practitioner
# ✓ Both deployed
```

### 4. Git

```bash
git add -A
git commit -m "feat: integrate Life Journey as default mode de vie questionnaire"
git push origin main
# ✓ Pushed to GitHub
```

## 🧪 Test du Système Complet

### Scénario de Test

1. **Créer un nouveau patient** via invitation praticien
2. **Le patient se connecte** → 4 questionnaires assignés automatiquement dont **life-journey**
3. **Le patient remplit Life Journey** → données persistées dans Firestore
4. **Le praticien ouvre la fiche patient** → radar graph s'affiche automatiquement
5. **Le praticien voit les 6 dimensions** avec leurs scores (0-100)

### Vérification Firestore

Après soumission, vérifier dans Firestore :

```
✓ patients/{uid}/questionnaires/life-journey
  - status: 'completed'
  - completedAt: Timestamp

✓ patients/{uid}/lifejourney/{id}
  - scores: { physical, emotional, mental, social, spiritual, environmental }
  - global: number
  - submittedAt: Timestamp
```

### Vérification API

```bash
curl https://neuronutrition-app-practitioner.web.app/api/patients/{patientId}/lifejourney
# Devrait retourner les données Life Journey
```

## 📈 Scores et Interprétation

Chaque sphère est scorée sur 100 :

- **0-25** : Très faible
- **26-50** : Faible
- **51-75** : Moyen
- **76-100** : Bon à Excellent

Le **score global** est la moyenne des 6 sphères.

## 🔧 Maintenance Future

### Ajouter une nouvelle sphère

1. Ajouter une section dans `life-journey.ts`
2. Mettre à jour le calcul des scores dans `LifeJourney7Spheres.tsx`
3. Ajuster le radar graph si nécessaire

### Modifier les questions

1. Éditer `packages/shared-questionnaires/src/questionnaires/mode-de-vie/life-journey.ts`
2. Rebuild le package : `pnpm -F @neuronutrition/shared-questionnaires build`
3. Rebuild et redéployer les apps

### Changer la version

```typescript
metadata: {
  version: '2.0', // Incrémenter
  ...
}
```

## ✨ Avantages de cette Approche

1. **Évaluation holistique** : 6 dimensions clés du mode de vie
2. **Visualisation intuitive** : Radar graph immédiatement compréhensible
3. **Données structurées** : Format JSON standardisé
4. **API REST** : Accès via endpoints HTTP (cache, rate limiting)
5. **Historique** : Chaque soumission conservée dans `lifejourney/{id}`
6. **Extensible** : Facile d'ajouter de nouvelles sphères ou questions

## 🔗 Liens Utiles

- **Patient App**: https://neuronutrition-app-patient.web.app/dashboard/life-journey
- **Practitioner App**: https://neuronutrition-app-practitioner.web.app/patients/{id}
- **API Health**: https://neuronutrition-app-practitioner.web.app/api/health
- **GitHub**: https://github.com/martialcayre-sketch/Dev

---

**Statut** : ✅ Déployé en production  
**Date** : 6 novembre 2025  
**Commit** : `4b4576e`
