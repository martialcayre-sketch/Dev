#!/usr/bin/env node
/**
 * Sync Questionnaires Script
 *
 * Objectif: migrer /patients/{uid}/questionnaires/{qid} vers /questionnaires/{qid}
 * si le document root n'existe pas encore ou le compléter (merge) pour cohérence.
 *
 * Usage:
 *   node scripts/syncQuestionnaires.js [--dry] [--limit=50]
 *
 * Sécurité:
 *   A exécuter dans un environnement admin (Cloud Run local ou codespace) avec GOOGLE_APPLICATION_CREDENTIALS
 */
import { admin, db } from '../src/lib/firebase-admin.js';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry');
const limitArg = args.find((a) => a.startsWith('--limit='));
const hardLimit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined;

async function run() {
  console.log(`=== Questionnaire Sync Start (dry=${dryRun}) ===`);

  const patientsSnap = await db.collection('patients').get();
  console.log(`Patients trouvés: ${patientsSnap.size}`);

  let processed = 0;
  let created = 0;
  let merged = 0;
  let skipped = 0;

  for (const pDoc of patientsSnap.docs) {
    const patientId = pDoc.id;
    const practitionerId = pDoc.get('practitionerId') || null;

    const subSnap = await db
      .collection('patients')
      .doc(patientId)
      .collection('questionnaires')
      .get();

    if (subSnap.empty) {
      continue;
    }

    console.log(`Patient ${patientId} sous-questionnaires: ${subSnap.size}`);

    for (const qDoc of subSnap.docs) {
      if (hardLimit && processed >= hardLimit) {
        console.warn('Hard limit reached, stopping iteration');
        break;
      }

      processed++;
      const qid = qDoc.id;
      const data = qDoc.data();

      const rootRef = db.collection('questionnaires').doc(qid);
      const rootSnap = await rootRef.get();

      const basePayload = {
        patientUid: patientId,
        practitionerId: practitionerId || data.practitionerId || null,
        title: data.title || 'Questionnaire',
        category: data.category || null,
        status: data.status || 'pending',
        assignedAt: data.assignedAt || admin.firestore.FieldValue.serverTimestamp(),
        submittedAt: data.submittedAt || null,
        completedAt: data.completedAt || null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        responses: data.responses || {},
        questions: data.questions || [],
      };

      if (!rootSnap.exists) {
        console.log(` + CREATE root questionnaire ${qid}`);
        if (!dryRun) {
          await rootRef.set(basePayload, { merge: true });
        }
        created++;
      } else {
        // Merge (ne pas écraser assignedAt existant si présent)
        const mergePayload = {
          ...basePayload,
          assignedAt: rootSnap.get('assignedAt') || basePayload.assignedAt,
        };
        console.log(` ~ MERGE root questionnaire ${qid}`);
        if (!dryRun) {
          await rootRef.set(mergePayload, { merge: true });
        }
        merged++;
      }
    }
  }

  console.log('=== Résumé Sync ===');
  console.log(`Documents traités: ${processed}`);
  console.log(`Créés: ${created}`);
  console.log(`Mergés: ${merged}`);
  console.log(`Ignorés: ${skipped}`);
  console.log('=== Fin ===');
}

run().catch((e) => {
  console.error('Sync FAILED:', e);
  process.exit(1);
});
