# 📋 Système de Notification Praticien - Questionnaires

## ✅ Implémentation Complète

Lorsqu'un patient complète un questionnaire, le praticien est automatiquement notifié via plusieurs canaux.

---

## 🔄 Fonctionnement Automatique

### Trigger Cloud Function

- **Type**: Firestore `onDocumentUpdated`
- **Chemin**: `patients/{patientUid}/questionnaires/{questionnaireId}`
- **Condition**: Le statut passe de `pending` à `completed`
- **Région**: europe-west1

### Actions Automatiques

Dès qu'un questionnaire est complété par un patient :

1. **✅ Mise à jour du document patient**
   - Décrémente `pendingQuestionnairesCount`
   - Ajoute `lastQuestionnaireCompletedAt` (timestamp)

2. **📝 Enregistrement de la soumission**
   - Collection: `questionnaireSubmissions`
   - Contient: patientUid, patientName, practitionerId, questionnaireId, responses, submittedAt

3. **🔔 Notification in-app pour le praticien**
   - Collection: `practitioners/{practitionerId}/notifications`
   - Type: `questionnaire_completed`
   - Contient: lien direct vers les réponses du questionnaire

4. **📧 Email au praticien**
   - Via collection `mail` (Firebase Extension)
   - Design HTML responsive
   - Bouton "Consulter les réponses" avec lien direct
   - Indique le nombre de questionnaires restants

5. **🔢 Incrémentation du compteur**
   - `practitioners/{practitionerId}/unreadNotificationsCount`
   - Permet d'afficher un badge dans l'UI

---

## 🎉 Bonus : Tous les Questionnaires Complétés

Lorsque le patient termine **TOUS** les questionnaires assignés :

### Notification Spéciale

- Type: `all_questionnaires_completed`
- Priorité: `high`
- Lien: vers le profil complet du patient

### Email Spécial

```
🎉 [PatientName] a terminé tous ses questionnaires

Bonne nouvelle ! [PatientName] a terminé tous les questionnaires.

Vous disposez maintenant de toutes les informations pour :
- Établir un diagnostic complet
- Élaborer un plan de traitement personnalisé
- Planifier les prochaines consultations
- Suivre l'évolution du patient

[Bouton: Voir le dossier complet]
```

---

## 📧 Contenu des Emails Praticien

### Email Standard (1 questionnaire complété)

- **Sujet**: `📋 [PatientName] a complété un questionnaire - NeuroNutrition`
- **Contenu**:
  - Nom du patient
  - Titre du questionnaire complété
  - Nombre de questionnaires restants
  - Bouton avec lien direct vers les réponses
  - Conseil pour accéder aux autres questionnaires

### Email Spécial (tous complétés)

- **Sujet**: `🎉 [PatientName] a terminé tous ses questionnaires - NeuroNutrition`
- **Contenu**:
  - Message de félicitation
  - Liste des prochaines étapes
  - Bouton vers le dossier complet du patient

---

## 🔗 Structure des Liens

### Un questionnaire complété

```
https://neuronutrition-app-practitioner.web.app/patients/{patientUid}/questionnaires/{questionnaireId}
```

### Tous les questionnaires complétés

```
https://neuronutrition-app-practitioner.web.app/patients/{patientUid}
```

---

## 📊 Structure Firestore

### Document Patient

```typescript
patients/{patientUid}
{
  pendingQuestionnairesCount: number,      // Mis à jour automatiquement
  lastQuestionnaireCompletedAt: Timestamp, // Dernier questionnaire complété
  practitionerId: string,                  // ID du praticien assigné
  // ... autres champs
}
```

### Notifications Praticien

```typescript
practitioners/{practitionerId}/notifications/{notificationId}
{
  type: 'questionnaire_completed' | 'all_questionnaires_completed',
  title: string,
  message: string,
  patientId: string,
  patientName: string,
  questionnaireId?: string,
  questionnaireTitle?: string,
  read: boolean,
  createdAt: Timestamp,
  link: string,
  priority?: 'high'
}
```

### Soumissions Questionnaires

```typescript
questionnaireSubmissions/{submissionId}
{
  patientUid: string,
  patientName: string,
  patientEmail: string,
  practitionerId: string,
  questionnaire: string,      // Titre
  questionnaireId: string,
  submittedAt: Timestamp,
  responses: Record<string, any>
}
```

### Compteur Notifications Praticien

```typescript
practitioners/{practitionerId}
{
  unreadNotificationsCount: number,  // Incrémenté automatiquement
  // ... autres champs
}
```

---

## 🧪 Test du Système

### 1. Test Patient

1. Connectez-vous à l'app patient :

   ```
   https://neuronutrition-app-patient.web.app
   ```

2. Naviguez vers un questionnaire (ex: "Mes plaintes actuelles")

3. Complétez le questionnaire et cliquez sur "Valider et terminer"

4. Vérifiez la console Firebase Functions pour les logs :
   ```
   🔵 Questionnaire completed: [titre] by patient [uid]
   ✅ Updated patient document
   ✅ Questionnaire submission recorded
   🔔 Notifying practitioner [id]
   ✅ In-app notification created
   ✅ Email notification sent
   ```

### 2. Test Praticien - Interface

1. Connectez-vous à l'app praticien :

   ```
   https://neuronutrition-app-practitioner.web.app
   ```

2. Vérifiez le badge de notifications (icône cloche)

3. Cliquez pour voir la nouvelle notification

4. Cliquez sur la notification pour accéder aux réponses

### 3. Test Praticien - Email

1. Vérifiez la boîte mail du praticien (Gmail, etc.)

2. Cherchez l'email avec sujet :

   ```
   📋 [Patient] a complété un questionnaire - NeuroNutrition
   ```

3. Vérifiez le contenu et cliquez sur "Consulter les réponses"

4. Vous devriez être redirigé vers la page du questionnaire

### 4. Test Tous Complétés

1. Complétez les 4 questionnaires du patient :
   - Mes plaintes actuelles et troubles ressentis
   - Questionnaire contextuel mode de vie
   - Questionnaire alimentaire
   - Questionnaire Dopamine-Noradrénaline-Sérotonine-Mélatonine

2. Après le 4ème questionnaire, vérifiez :
   - Notification spéciale "Tous les questionnaires complétés"
   - Email spécial avec félicitations

---

## 🔍 Debugging

### Console Firebase Functions

```bash
firebase functions:log --only onQuestionnaireCompleted
```

### Vérifier les Notifications Firestore

```javascript
// Dans la console Firebase
db.collection('practitioners/{practitionerId}/notifications')
  .orderBy('createdAt', 'desc')
  .limit(10);
```

### Vérifier les Emails en Attente

```javascript
// Dans la console Firebase
db.collection('mail').where('delivery.state', '==', 'PENDING').limit(10);
```

### Vérifier les Soumissions

```javascript
// Dans la console Firebase
db.collection('questionnaireSubmissions')
  .where('practitionerId', '==', '{practitionerId}')
  .orderBy('submittedAt', 'desc');
```

---

## ⚙️ Configuration Requise

### Firebase Extensions

- **Trigger Email**: Extension officielle Firebase pour envoyer des emails
  - Installation : `firebase ext:install firestore-send-email`
  - Configuration : Collection `mail`, champs `to`, `message.subject`, `message.html`

### Firestore Security Rules

```javascript
// Notifications praticien (lecture seule pour le praticien)
match /practitioners/{practitionerId}/notifications/{notificationId} {
  allow read: if request.auth.uid == practitionerId;
  allow write: if false; // Créées uniquement par Cloud Functions
}

// Soumissions questionnaires
match /questionnaireSubmissions/{submissionId} {
  allow read: if request.auth != null &&
                (resource.data.practitionerId == request.auth.uid ||
                 resource.data.patientUid == request.auth.uid);
  allow write: if false; // Créées uniquement par Cloud Functions
}
```

---

## 📝 Notes Techniques

### Performance

- La fonction se déclenche uniquement sur les updates (pas les créations)
- Condition stricte : `status` doit passer de non-`completed` à `completed`
- Évite les double-triggers avec la vérification `beforeData?.status`

### Gestion d'Erreurs

- Tous les try-catch sont non-bloquants
- Si l'email échoue, la notification in-app est quand même créée
- Logs détaillés pour faciliter le debugging

### Scalabilité

- Utilise des batch writes quand possible
- Pas de boucles imbriquées
- Compteurs incrémentés avec `FieldValue.increment()`

---

## 🚀 Améliorations Futures

1. **Préférences de Notification**
   - Permettre au praticien de choisir : email, SMS, ou notifications in-app uniquement

2. **Résumé Hebdomadaire**
   - Email récapitulatif une fois par semaine avec tous les questionnaires complétés

3. **Notifications SMS**
   - Intégrer Twilio pour envoyer des SMS au praticien

4. **Analytics**
   - Tracker le temps de réponse moyen
   - Taux de complétion des questionnaires
   - Engagement des patients

5. **Export PDF**
   - Générer un PDF des réponses du questionnaire
   - Joindre au email praticien

---

## ✅ Checklist de Déploiement

- [x] Cloud Function `onQuestionnaireCompleted` créée
- [x] Cloud Function déployée sur Firebase
- [x] Trigger Firestore configuré correctement
- [x] Templates d'emails HTML créés
- [x] Structure Firestore définie
- [x] Gestion des compteurs implémentée
- [x] Notifications spéciales (tous complétés) implémentées
- [x] Logs de debugging ajoutés
- [ ] Extension Trigger Email installée (si pas déjà fait)
- [ ] Firestore Security Rules mises à jour
- [ ] Tests end-to-end effectués
- [ ] Documentation utilisateur créée

---

## 📞 Support

En cas de problème :

1. Vérifiez les logs Firebase Functions
2. Vérifiez la console Firestore pour les notifications créées
3. Vérifiez la collection `mail` pour les emails en attente
4. Contactez le développeur avec les logs et captures d'écran

---

**Dernière mise à jour** : 4 novembre 2025
**Version** : 1.0.0
**Statut** : ✅ Déployé en production
