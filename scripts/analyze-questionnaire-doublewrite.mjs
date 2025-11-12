#!/usr/bin/env node
/*
 * Analyse de la cohérence double-write questionnaires (root vs sous-collection patient).
 * - Compte documents root
 * - Échantillonne patients et compare nombre questionnaires subcollection
 * - Signale IDs manquants ou divergents
 */
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({ projectId: process.env.GOOGLE_CLOUD_PROJECT || 'neuronutrition-app' });
}

const db = admin.firestore();

async function main() {
  console.log('🔍 Analyse double-write questionnaires');
  const rootSnap = await db.collection('questionnaires').limit(2000).get();
  const rootIds = new Set(rootSnap.docs.map((d) => d.id));
  console.log(`Root questionnaires: ${rootIds.size}`);

  // Échantillon patients (limite 50)
  const patientsSnap = await db.collection('patients').limit(50).get();
  const discrepancies = [];
  for (const p of patientsSnap.docs) {
    const pid = p.id;
    const subSnap = await db.collection('patients').doc(pid).collection('questionnaires').get();
    for (const q of subSnap.docs) {
      if (!rootIds.has(q.id)) {
        discrepancies.push({ patientId: pid, missingInRoot: q.id });
      }
    }
  }

  if (discrepancies.length === 0) {
    console.log('✅ Aucune divergence détectée sur l’échantillon.');
  } else {
    console.log(
      `⚠️ ${discrepancies.length} questionnaires présents en sous-collection mais absents du root:`
    );
    for (const d of discrepancies.slice(0, 20)) {
      console.log(` - patient=${d.patientId} questionnaire=${d.missingInRoot}`);
    }
    if (discrepancies.length > 20) console.log('   ...');
  }

  console.log(
    '➡️ Recommandation: exécuter migration ou supprimer double-write une fois divergence nulle.'
  );
}

main().catch((err) => {
  console.error('Erreur analyse:', err);
  process.exit(1);
});
