#!/usr/bin/env node

/**
 * Script de migration : Remplacer mode-de-vie par life-journey
 * pour tous les patients existants
 *
 * Ce script :
 * 1. Trouve tous les patients ayant le questionnaire mode-de-vie assigné
 * 2. Le remplace par life-journey avec les mêmes métadonnées
 * 3. Conserve le statut (pending/completed) et les réponses si existantes
 * 4. Est idempotent (peut être exécuté plusieurs fois sans danger)
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

  console.log(`  📋 Status actuel: ${modeDeVieData.status}`);
  console.log(
    `  📅 Assigné le: ${modeDeVieData.assignedAt?.toDate().toLocaleDateString() || 'N/A'}`
  );

  // Créer le nouveau document life-journey
  const newData = {
    ...NEW_QUESTIONNAIRE_TEMPLATE,
    patientUid: modeDeVieData.patientUid || patientUid,
    practitionerId: modeDeVieData.practitionerId || null,
    status: modeDeVieData.status || 'pending',
    assignedAt: modeDeVieData.assignedAt || FieldValue.serverTimestamp(),
    completedAt: modeDeVieData.completedAt || null,
    responses: modeDeVieData.responses || {},
    // Préserver les métadonnées de migration
    migratedFrom: 'mode-de-vie',
    migratedAt: FieldValue.serverTimestamp(),
  };

  // Si le questionnaire était complété, on preserve la date
  if (modeDeVieData.status === 'completed') {
    console.log(
      `  ✅ Questionnaire complété le: ${modeDeVieData.completedAt?.toDate().toLocaleDateString() || 'N/A'}`
    );
  }

  // Transaction pour garantir l'atomicité
  await db.runTransaction(async (transaction) => {
    const lifeJourneyRef = questionnaireRef.doc('life-journey');
    const modeDeVieRef = questionnaireRef.doc('mode-de-vie');

    // Créer life-journey
    transaction.set(lifeJourneyRef, newData);

    // Supprimer mode-de-vie
    transaction.delete(modeDeVieRef);
  });

  console.log(`  ✅ Migration réussie : mode-de-vie → life-journey`);

  return { migrated: true, status: newData.status };
}

async function main() {
  console.log('════════════════════════════════════════════════════════════');
  console.log('  🔄 MIGRATION MODE-DE-VIE → LIFE-JOURNEY');
  console.log('════════════════════════════════════════════════════════════\n');

  try {
    // Récupérer tous les patients
    const patientsSnapshot = await db.collection('patients').get();

    console.log(`📊 Total de patients trouvés: ${patientsSnapshot.size}\n`);

    let migrated = 0;
    let skipped = 0;
    let alreadyMigrated = 0;
    let errors = 0;

    // Traiter chaque patient
    for (const patientDoc of patientsSnapshot.docs) {
      const patientUid = patientDoc.id;

      try {
        const result = await migratePatient(patientUid);

        if (result.skipped) {
          skipped++;
        } else if (result.alreadyExists) {
          alreadyMigrated++;
        } else if (result.migrated) {
          migrated++;
        }
      } catch (error) {
        console.error(`  ❌ Erreur pour le patient ${patientUid}:`, error.message);
        errors++;
      }
    }

    // Résumé final
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('  📊 RÉSUMÉ DE LA MIGRATION');
    console.log('════════════════════════════════════════════════════════════\n');
    console.log(`✅ Patients migrés:           ${migrated}`);
    console.log(`⏭️  Patients skippés:          ${skipped}`);
    console.log(`ℹ️  Déjà migrés:               ${alreadyMigrated}`);
    console.log(`❌ Erreurs:                   ${errors}`);
    console.log(`📊 Total:                     ${patientsSnapshot.size}\n`);

    if (migrated > 0) {
      console.log('🎉 Migration terminée avec succès!\n');
      console.log('📝 Actions recommandées:');
      console.log('   1. Vérifiez dans Firebase Console que life-journey existe');
      console.log('   2. Vérifiez que mode-de-vie a été supprimé');
      console.log('   3. Testez la page questionnaires côté patient');
      console.log('   4. Vérifiez le radar graph côté praticien\n');
    } else {
      console.log('ℹ️  Aucune migration nécessaire.\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERREUR CRITIQUE:', error);
    process.exit(1);
  }
}

main();
