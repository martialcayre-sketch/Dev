# 📊 Fiche Patient - Espace Praticien

## ✅ Implémentation Complète

La fiche patient complète a été créée dans l'espace praticien avec :

- Dossier médical du patient
- Questionnaires en attente et complétés
- Graphique en barres verticales (Plaintes et Douleurs)
- Mise à jour en temps réel

---

## 🎨 Fonctionnalités Principales

### 1. 📋 Informations Patient

**Affichage des données personnelles** :

- Nom complet (displayName, firstname + lastname, ou email)
- Email
- Téléphone (si disponible)
- Statut du compte (approved, pending, etc.)

**Design** :

- Cards avec icônes (Mail, Phone, Calendar)
- Style dark theme avec bordures white/10
- Hover effects pour une meilleure UX

### 2. 📊 Statistiques Questionnaires

**Deux cartes de résumé** :

- 🟡 **En attente** : Nombre de questionnaires à compléter
  - Couleur amber (jaune)
  - Icône Clock
  - Compte en temps réel

- 🟢 **Complétés** : Nombre de questionnaires remplis
  - Couleur green (vert)
  - Icône CheckCircle2
  - Compte en temps réel

### 3. 📈 Graphique Vertical - Plaintes et Douleurs

**Bar Chart Interactif** :

- 7 barres verticales colorées (une par symptôme)
- Hauteur proportionnelle à l'intensité (1-10)
- Animation smooth (duration-700)
- Valeur affichée au-dessus de chaque barre

**Symptômes visualisés** :

1. 🟠 **Fatigue** - Gradient amber → orange → red
2. 🌸 **Douleurs** - Gradient rose → pink → fuchsia
3. 🟢 **Digestion** - Gradient emerald → teal → cyan
4. 🟣 **Surpoids** - Gradient violet → purple → indigo
5. 🔵 **Insomnie** - Gradient blue → indigo → violet
6. 🔷 **Moral** - Gradient cyan → sky → blue
7. 🟩 **Mobilité** - Gradient lime → green → emerald

**Mise à jour en temps réel** :

- Listener Firestore sur `patients/{uid}/questionnaires/plaintes-et-douleurs`
- Rafraîchissement automatique quand le patient modifie ses réponses
- Animation smooth lors des changements

### 4. 📝 Liste des Questionnaires

**Affichage détaillé** :

- Titre et description du questionnaire
- Catégorie (Mode de vie, Alimentaire, etc.)
- Statut (En attente / Complété)
- Date d'assignation
- Date de complétion (si applicable)
- Nombre de réponses enregistrées

**Actions disponibles** :

- Lien vers la page détaillée des questionnaires
- Badge de statut (Clock pour en attente, CheckCircle2 pour complété)
- Hover effects pour meilleure navigation

---

## 🔄 Temps Réel (Real-time Updates)

### Firestore Listeners

```typescript
// Listener sur la collection questionnaires
const questionnairesRef = collection(firestore, 'patients', id, 'questionnaires');
const q = query(questionnairesRef, orderBy('assignedAt', 'desc'));

const unsubscribe = onSnapshot(q, (snapshot) => {
  const questionnairesData = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Questionnaire[];
  setQuestionnaires(questionnairesData);
});
```

**Ce qui est mis à jour automatiquement** :

- ✅ Compteurs (en attente / complétés)
- ✅ Graphique des plaintes et douleurs
- ✅ Liste des questionnaires
- ✅ Statuts et dates

**Avantages** :

- Pas besoin de rafraîchir la page
- Voir les changements instantanément
- Meilleure expérience utilisateur

---

## 🎨 Code du Graphique Vertical

### Structure

```tsx
<div className="flex items-end justify-between gap-3" style={{ height: '300px' }}>
  {PLAINTES_ITEMS.map((item) => {
    const value = responses?.[item.id] || 0;
    const percentage = (value / 10) * 100;
    const colorScheme = COLOR_SCHEMES[item.colorScheme];

    return (
      <div className="flex flex-1 flex-col items-center gap-3">
        {/* Bar container */}
        <div
          className="relative flex w-full flex-col items-center justify-end"
          style={{ height: '240px' }}
        >
          {/* Value label on top */}
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${colorScheme.bar}`}
          >
            {value}
          </div>

          {/* Animated bar */}
          <div
            className={`w-full rounded-t-lg ${colorScheme.bar} transition-all duration-700`}
            style={{ height: `${percentage}%`, minHeight: value > 0 ? '8px' : '0px' }}
          />
        </div>

        {/* Label */}
        <p className={`text-xs font-semibold ${colorScheme.text}`}>{item.label}</p>
      </div>
    );
  })}
</div>
```

### Palettes de Couleurs

```typescript
const COLOR_SCHEMES = {
  fatigue: {
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    bar: 'bg-gradient-to-t from-amber-500 via-orange-500 to-red-500',
    text: 'text-amber-400',
  },
  douleurs: {
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
    bar: 'bg-gradient-to-t from-rose-500 via-pink-500 to-fuchsia-500',
    text: 'text-rose-400',
  },
  // ... 5 autres couleurs
};
```

---

## 📱 Pages Implémentées

### 1. PatientDetailPage (`/patients/:id`)

**URL** : `https://neuronutrition-app-practitioner.web.app/patients/{patientId}`

**Contenu** :

- Header avec nom du patient
- Informations de contact (email, téléphone)
- Statistiques questionnaires (en attente / complétés)
- Graphique vertical Plaintes et Douleurs
- Liste résumée des questionnaires
- Lien vers page détaillée des questionnaires

### 2. PatientQuestionnairesPage (`/patients/:id/questionnaires`)

**URL** : `https://neuronutrition-app-practitioner.web.app/patients/{patientId}/questionnaires`

**Contenu** :

- Header avec nom du patient
- Statistiques en attente / complétés
- Section "En attente" avec cards détaillées
- Section "Complétés" avec cards détaillées
- Cards interactives avec :
  - Titre, description, catégorie
  - Dates d'assignation et complétion
  - Nombre de réponses
  - Boutons d'action (Voir / Télécharger)

---

## 🚀 Comment Tester

### 1. Créer un Patient

```bash
# Depuis l'app praticien
1. Aller sur https://neuronutrition-app-practitioner.web.app/patients/invitations
2. Créer une invitation patient
3. Le patient crée son compte avec le lien
```

### 2. Assigner des Questionnaires

```bash
# Automatique lors de la création du compte patient
# Les 4 questionnaires par défaut sont assignés :
- Mes plaintes actuelles et troubles ressentis
- Questionnaire contextuel mode de vie
- Questionnaire alimentaire
- Questionnaire Dopamine-Noradrénaline-Sérotonine-Mélatonine
```

### 3. Patient Complète un Questionnaire

```bash
# Depuis l'app patient
1. Aller sur https://neuronutrition-app-patient.web.app/dashboard/questionnaires
2. Cliquer sur "Mes plaintes actuelles"
3. Utiliser les sliders pour noter chaque symptôme (1-10)
4. Cliquer sur "Valider et terminer"
```

### 4. Voir le Graphique en Temps Réel

```bash
# Depuis l'app praticien (ouverte en même temps)
1. Aller sur https://neuronutrition-app-practitioner.web.app/patients/{patientId}
2. Observer le graphique se mettre à jour automatiquement
3. Les barres s'animent et affichent les nouvelles valeurs
```

---

## 🎯 Cas d'Usage

### Scénario 1 : Premier Rendez-vous

1. **Praticien** : Invite le patient via email
2. **Patient** : Crée son compte, reçoit 4 questionnaires
3. **Patient** : Complète "Plaintes et Douleurs" avant le RDV
4. **Praticien** : Consulte la fiche patient
5. **Praticien** : Voit le graphique avec les symptômes du patient
6. **Praticien** : Adapte la consultation en fonction des résultats

### Scénario 2 : Suivi Régulier

1. **Praticien** : Consulte la fiche patient chaque mois
2. **Graphique** : Montre l'évolution des symptômes
3. **Praticien** : Compare avec les consultations précédentes
4. **Praticien** : Ajuste le traitement selon l'évolution

### Scénario 3 : Consultation Urgente

1. **Patient** : Met à jour ses plaintes (symptômes aggravés)
2. **Praticien** : Reçoit une notification (si implémentée)
3. **Praticien** : Ouvre la fiche patient
4. **Graphique** : Affiche les changements en temps réel
5. **Praticien** : Contacte le patient rapidement

---

## 📊 Structure Firestore

### Document Patient

```typescript
patients/{patientUid}
{
  uid: string,
  email: string,
  firstname?: string,
  lastname?: string,
  phone?: string,
  displayName?: string,
  status: 'approved' | 'pending' | 'rejected',
  createdAt: Timestamp,
  practitionerId: string,
  pendingQuestionnairesCount: number,  // Mis à jour par Cloud Function
  lastQuestionnaireCompletedAt: Timestamp,
}
```

### Questionnaires du Patient

```typescript
patients/{patientUid}/questionnaires/{questionnaireId}
{
  id: string,
  title: string,
  category: string,
  description: string,
  status: 'pending' | 'completed',
  assignedAt: Timestamp,
  completedAt?: Timestamp,
  responses: {
    fatigue: number,      // 1-10
    douleurs: number,     // 1-10
    digestion: number,    // 1-10
    surpoids: number,     // 1-10
    insomnie: number,     // 1-10
    moral: number,        // 1-10
    mobilite: number,     // 1-10
  },
}
```

---

## 🎨 Design System

### Couleurs

**Statut** :

- 🟡 Pending : amber-500 (#F59E0B)
- 🟢 Completed : green-500 (#10B981)
- 🔴 Alert : red-500 (#EF4444)

**Gradients** :

- Primary : nn-primary-500 → nn-accent-500
- Cards : white/5 avec border white/10

**Text** :

- Titres : text-white
- Sous-titres : text-white/60
- Labels : text-white/40

### Spacing

- Cards padding : `p-6`
- Grid gap : `gap-4` ou `gap-6`
- Element spacing : `space-y-3` à `space-y-6`

### Animations

```css
/* Bars du graphique */
transition-all duration-700 ease-out

/* Hover effects */
hover:border-white/30 hover:bg-white/10
```

---

## 🔧 Configuration Requise

### Firestore Security Rules

```javascript
// Lectures praticien
match /patients/{patientId} {
  allow read: if request.auth != null &&
                (get(/databases/$(database)/documents/patients/$(patientId)).data.practitionerId == request.auth.uid);

  match /questionnaires/{questionnaireId} {
    allow read: if request.auth != null &&
                  (get(/databases/$(database)/documents/patients/$(patientId)).data.practitionerId == request.auth.uid);
  }
}
```

### Dépendances

```json
{
  "dependencies": {
    "firebase": "^10.13.2",
    "react": "^18.3.1",
    "react-router-dom": "^6.28.0",
    "lucide-react": "^0.468.0"
  }
}
```

---

## 📝 To-Do / Améliorations Futures

### Fonctionnalités

- [ ] Exporter les réponses en PDF
- [ ] Comparer plusieurs questionnaires (évolution dans le temps)
- [ ] Graphiques supplémentaires pour autres questionnaires
- [ ] Filtrer questionnaires par date ou catégorie
- [ ] Recherche dans les réponses

### UX/UI

- [ ] Tooltips explicatifs sur le graphique
- [ ] Animation d'entrée du graphique (fade-in)
- [ ] Mode plein écran pour le graphique
- [ ] Export graphique en image (PNG/SVG)
- [ ] Thème clair (light mode)

### Performance

- [ ] Pagination des questionnaires (si > 20)
- [ ] Cache des données patient
- [ ] Lazy loading des graphiques
- [ ] Service Worker pour offline

### Analytics

- [ ] Tracker les consultations de fiches patient
- [ ] Temps moyen passé sur la fiche
- [ ] Graphiques les plus consultés
- [ ] Export des statistiques

---

## 🐛 Debugging

### Graphique ne s'affiche pas

**Causes possibles** :

1. Questionnaire "plaintes-et-douleurs" non complété
2. Responses vides ou malformées
3. Listener Firestore non actif

**Solutions** :

```typescript
// Vérifier les données dans la console
console.log('Questionnaires:', questionnaires);
console.log('Plaintes:', plaintesDouleurs);
console.log('Responses:', plaintesDouleurs?.responses);
```

### Temps réel ne fonctionne pas

**Causes possibles** :

1. Firestore rules bloquent la lecture
2. Listener non nettoyé (memory leak)
3. ID patient incorrect

**Solutions** :

```typescript
// Vérifier le cleanup
useEffect(() => {
  const unsubscribe = onSnapshot(q, (snapshot) => { ... });
  return () => unsubscribe(); // Important !
}, [id]);
```

### Barres du graphique mal alignées

**Causes possibles** :

1. Conteneur sans hauteur fixe
2. flex items-end non appliqué
3. CSS conflictuels

**Solutions** :

```tsx
// Container principal
<div className="flex items-end justify-between gap-3" style={{ height: '300px' }}>

// Bar container
<div style={{ height: '240px' }}>
```

---

## ✅ Checklist de Déploiement

- [x] PatientDetailPage créée avec graphique
- [x] PatientQuestionnairesPage créée avec détails
- [x] Listeners Firestore temps réel configurés
- [x] Graphique vertical avec 7 couleurs implémenté
- [x] Animations et transitions ajoutées
- [x] Build réussi (749.73 kB)
- [x] Déployé sur Firebase Hosting
- [ ] Tests end-to-end effectués
- [ ] Firestore Security Rules vérifiées
- [ ] Documentation utilisateur créée

---

## 🔗 Liens Utiles

**Production** :

- Praticien : https://neuronutrition-app-practitioner.web.app
- Patient : https://neuronutrition-app-patient.web.app

**Firebase Console** :

- Firestore : https://console.firebase.google.com/project/neuronutrition-app/firestore
- Hosting : https://console.firebase.google.com/project/neuronutrition-app/hosting

**Documentation** :

- Notifications : `QUESTIONNAIRE_NOTIFICATIONS.md`
- Questionnaires : `apps/patient-vite/src/questionnaires/data.ts`

---

**Dernière mise à jour** : 4 novembre 2025
**Version** : 1.0.0
**Statut** : ✅ Déployé en production
