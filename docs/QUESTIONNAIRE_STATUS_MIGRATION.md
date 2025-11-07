# Migration des Statuts de Questionnaires

## Système Implémenté

✅ **Cloud Functions déployées** :

- `submitQuestionnaire` : Soumission patient → praticien
- `setQuestionnaireStatus` : Verrouillage/réouverture par praticien

✅ **Composants UI déployés** :

- Patient : `EditableQuestionnaire` + `SubmitToPractitionerButton`
- Praticien : `InboxList` + `QuestionnaireStatusSwitch`

✅ **Règles Firestore mises à jour** :

- Blocage édition si `status === 'submitted' || 'completed'`
- Inbox praticien protégée (écriture par Cloud Function uniquement)

---

## Nouveaux Champs de Statut

Tous les questionnaires auront maintenant :

```typescript
{
  status: 'pending' | 'in_progress' | 'submitted' | 'completed' | 'reopened',
  submittedAt: Timestamp | null,
  completedAt: Timestamp | null,
  updatedAt: Timestamp,
}
```

---

## Flux Utilisateur

### Patient

1. **Ouvre un questionnaire assigné** (`status: 'pending'`)
2. **Commence à remplir** → autosave 500ms → `status: 'in_progress'`
3. **Clique "Soumettre au praticien"** → `status: 'submitted'` (lecture seule)
4. **Reçoit notification** si praticien rouvre → `status: 'reopened'`

### Praticien

1. **Reçoit notification** dans l'inbox (`status: 'new'`)
2. **Ouvre le questionnaire** → peut marquer "lu"
3. **Deux actions possibles** :
   - **Verrouiller** : `status: 'completed'` (validation finale)
   - **Rouvrir** : `status: 'reopened'` (demande modif au patient)

---

## Migration des Questionnaires Existants

### Option 1 : Via Console Firebase (Manuel)

1. Ouvrir [Console Firestore](https://console.firebase.google.com/project/neuronutrition-app/firestore/databases/-default-/data)
2. Pour chaque patient → `questionnaires` → chaque questionnaire :
   - Ajouter champ `status` = `"pending"` (ou `"in_progress"` si responses non vides)
   - Ajouter champ `submittedAt` = `null`
   - Ajouter champ `completedAt` = `null` (si absent)

### Option 2 : Via Cloud Function (Automatique)

Créer une fonction callable temporaire :

```typescript
export const migrateQuestionnaireStatuses = onCall(async (req) => {
  const ctx = req.auth;
  if (!ctx || !ctx.token.admin) throw new HttpsError('permission-denied', 'Admin only');

  const patientsSnap = await admin.firestore().collection('patients').get();
  let count = 0;

  for (const patientDoc of patientsSnap.docs) {
    const qSnap = await admin
      .firestore()
      .collection(`patients/${patientDoc.id}/questionnaires`)
      .get();

    for (const qDoc of qSnap.docs) {
      const data = qDoc.data();
      if (!data.status) {
        await qDoc.ref.update({
          status:
            data.responses && Object.keys(data.responses).length > 0 ? 'in_progress' : 'pending',
          submittedAt: null,
          completedAt: data.completedAt || null,
        });
        count++;
      }
    }
  }

  return { migrated: count };
});
```

Déployer, appeler depuis console navigateur (admin uniquement), puis supprimer.

### Option 3 : Script Local avec Service Account

1. Télécharger service account key depuis Firebase Console
2. Placer dans `c:\Dev\serviceAccountKey.json` (gitignored)
3. Modifier le script :

```javascript
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf-8'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

// ... reste du code migration
```

4. Exécuter : `cd functions && node ../scripts/migrate-questionnaire-status-admin.mjs`

---

## Vérification Post-Migration

1. Aller dans Firestore Console
2. Vérifier qu'un questionnaire patient a les champs `status`, `submittedAt`, `completedAt`
3. Tester le flux complet :
   - Patient remplit → Soumet
   - Praticien reçoit notification
   - Praticien verrouille/rouvre

---

## Rollback

Si besoin de revenir en arrière :

```javascript
// Supprimer les champs de statut
await qRef.update({
  status: admin.firestore.FieldValue.delete(),
  submittedAt: admin.firestore.FieldValue.delete(),
});
```

---

## Notes Importantes

⚠️ **Les questionnaires créés APRÈS le déploiement** recevront automatiquement `status: 'pending'` via `assignQuestionnaires`.

⚠️ **Les questionnaires EXISTANTS** doivent être migrés manuellement (voir options ci-dessus).

✅ **Une fois migrés**, le système fonctionne automatiquement pour tous les questionnaires.
