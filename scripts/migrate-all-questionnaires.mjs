#!/usr/bin/env node
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccountKey.json';
let serviceAccount;

try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
} catch (error) {
  console.error('❌ Service account key not found.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function migrateAllQuestionnaires() {
  console.log('🔄 MIGRATION GLOBALE DES QUESTIONNAIRES VERS ROOT COLLECTION\n');
  console.log('━'.repeat(60));

  const stats = {
    totalPatients: 0,
    totalMigrated: 0,
    totalSkipped: 0,
    errors: [],
  };

  // Get all patients
  const patientsSnap = await db.collection('patients').get();
  stats.totalPatients = patientsSnap.docs.length;

  console.log(`\n📊 Patients trouvés: ${stats.totalPatients}\n`);

  for (const patientDoc of patientsSnap.docs) {
    const patientId = patientDoc.id;
    const patientData = patientDoc.data();
    const patientEmail = patientData.email || patientId;

    console.log(`\n👤 ${patientEmail} (${patientId})`);

    // Get questionnaires from subcollection
    const subQuestionnairesSnap = await db
      .collection('patients')
      .doc(patientId)
      .collection('questionnaires')
      .get();

    if (subQuestionnairesSnap.empty) {
      console.log('   ℹ️  Aucun questionnaire dans subcollection');
      continue;
    }

    console.log(`   📋 ${subQuestionnairesSnap.docs.length} questionnaires trouvés`);

    for (const qDoc of subQuestionnairesSnap.docs) {
      const qId = qDoc.id;
      const qData = qDoc.data();

      try {
        // Check if already exists in root
        const rootDoc = await db.collection('questionnaires').doc(qId).get();

        if (rootDoc.exists) {
          console.log(`      ⏭️  ${qData.title || qId} - déjà en root`);
          stats.totalSkipped++;
          continue;
        }

        // Migrate to root collection
        const dataToMigrate = {
          ...qData,
          patientUid: patientId, // Critical field for querying
        };

        await db.collection('questionnaires').doc(qId).set(dataToMigrate);

        console.log(`      ✅ ${qData.title || qId} [${qData.status}] - migré vers root`);
        stats.totalMigrated++;
      } catch (error) {
        console.error(`      ❌ Erreur migration ${qId}:`, error.message);
        stats.errors.push({ patientEmail, questionnaireId: qId, error: error.message });
      }
    }
  }

  console.log('\n\n' + '━'.repeat(60));
  console.log('📊 RÉSUMÉ DE LA MIGRATION\n');
  console.log(`Patients traités: ${stats.totalPatients}`);
  console.log(`Questionnaires migrés: ${stats.totalMigrated}`);
  console.log(`Questionnaires déjà présents: ${stats.totalSkipped}`);

  if (stats.errors.length > 0) {
    console.log(`\n❌ Erreurs: ${stats.errors.length}`);
    for (const err of stats.errors) {
      console.log(`   - ${err.patientEmail}: ${err.questionnaireId} - ${err.error}`);
    }
  }

  console.log('\n' + '━'.repeat(60));
  console.log('\n✅ MIGRATION TERMINÉE !');

  if (stats.totalMigrated > 0) {
    console.log('\n💡 Prochaines étapes:');
    console.log("   1. Vérifier que l'API retourne bien les questionnaires");
    console.log("   2. Modifier le frontend pour utiliser l'API");
    console.log('   3. Déployer les changements\n');
  }
}

migrateAllQuestionnaires()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
