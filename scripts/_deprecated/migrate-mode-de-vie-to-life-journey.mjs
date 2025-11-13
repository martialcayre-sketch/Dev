#!/usr/bin/env node
console.error(
  'DEPRECATED: legacy subcollection migration. Update root docs directly or write a dedicated root-only migration if needed.'
);
process.exit(1);

/**
 * Script de migration : Remplacer mode-de-vie par life-journey
 * pour tous les patients existants
 */
import { cert, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialiser Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '../serviceAccountKey.json'), 'utf8')
);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

const NEW_QUESTIONNAIRE_TEMPLATE = {
  id: 'life-journey',
  title: 'Mode de vie – 7 Sphères Vitales',
  category: 'Mode de vie SIIN',
  description:
    'Évaluez votre mode de vie selon 6 dimensions clés : physique, émotionnelle, mentale, sociale, spirituelle et environnementale',
};

async function migratePatient(patientUid) {
  console.log(`\n🔄 Migration du patient: ${patientUid}`);

  const questionnaireRef = db.collection('patients').doc(patientUid).collection('questionnaires');

  // Vérifier si mode-de-vie existe
  const modeDeVieDoc = await questionnaireRef.doc('mode-de-vie').get();

  if (!modeDeVieDoc.exists) {
    console.log(`  ⏭️  Pas de mode-de-vie trouvé, skip`);
    return { skipped: true, reason: 'no-mode-de-vie' };
  }

  // Vérifier si life-journey existe déjà
  const lifeJourneyDoc = await questionnaireRef.doc('life-journey').get();

  if (lifeJourneyDoc.exists) {
    console.log(`  ⚠️  life-journey existe déjà, on supprime mode-de-vie`);
    await questionnaireRef.doc('mode-de-vie').delete();
    return { migrated: true, alreadyExists: true };
  }

  // Récupérer les données de mode-de-vie
  const modeDeVieData = modeDeVieDoc.data();

  // Créer le nouveau document life-journey
  const newData = {
    ...NEW_QUESTIONNAIRE_TEMPLATE,
    patientUid: modeDeVieData.patientUid || patientUid,
    practitionerId: modeDeVieData.practitionerId || null,
    status: modeDeVieData.status || 'pending',
    assignedAt: modeDeVieData.assignedAt || FieldValue.serverTimestamp(),
    completedAt: modeDeVieData.completedAt || null,
    responses: modeDeVieData.responses || {},
    migratedFrom: 'mode-de-vie',
    migratedAt: FieldValue.serverTimestamp(),
  };

  // Transaction pour garantir l'atomicité
  await db.runTransaction(async (transaction) => {
    const lifeJourneyRef = questionnaireRef.doc('life-journey');
    const modeDeVieRef = questionnaireRef.doc('mode-de-vie');
    transaction.set(lifeJourneyRef, newData);
    transaction.delete(modeDeVieRef);
  });

  console.log(`  ✅ Migration réussie : mode-de-vie → life-journey`);

  return { migrated: true, status: newData.status };
}

async function main() {
  try {
    // Récupérer tous les patients
    const patientsSnapshot = await db.collection('patients').get();

    let migrated = 0;
    let skipped = 0;
    let alreadyMigrated = 0;
    let errors = 0;

    for (const patientDoc of patientsSnapshot.docs) {
      const patientUid = patientDoc.id;
      try {
        const result = await migratePatient(patientUid);
        if (result.skipped) skipped++;
        else if (result.alreadyExists) alreadyMigrated++;
        else if (result.migrated) migrated++;
      } catch (error) {
        console.error(`  ❌ Erreur pour le patient ${patientUid}:`, error.message);
        errors++;
      }
    }

    console.log(
      `✅ Migrés=${migrated} ⏭️ Skippés=${skipped} ℹ️ Déjà migrés=${alreadyMigrated} ❌ Erreurs=${errors}`
    );
  } catch (error) {
    console.error('\n❌ ERREUR CRITIQUE:', error);
    process.exit(1);
  }
}

main();
