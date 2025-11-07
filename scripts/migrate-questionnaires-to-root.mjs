#!/usr/bin/env node
/**
 * Migration script: Copy all questionnaires from patients/{id}/questionnaires
 * to root collection questionnaires/
 *
 * This script:
 * 1. Scans all patients
 * 2. For each patient, reads their questionnaires subcollection
 * 3. Copies each questionnaire to the root collection with patientUid field
 * 4. Reports progress and any errors
 *
 * Uses Application Default Credentials (no service account file needed)
 */

import admin from 'firebase-admin';

// Initialize Firebase Admin with Application Default Credentials
admin.initializeApp({
  projectId: 'neuronutrition-app',
});

const db = admin.firestore();
async function migrateQuestionnaires() {
  console.log('\n🚀 Starting questionnaire migration to root collection...\n');

  let totalPatients = 0;
  let totalQuestionnaires = 0;
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  try {
    // Get all patients
    const patientsSnap = await db.collection('patients').get();
    totalPatients = patientsSnap.size;

    console.log(`📊 Found ${totalPatients} patients to process\n`);

    for (const patientDoc of patientsSnap.docs) {
      const patientId = patientDoc.id;
      const patientData = patientDoc.data();

      try {
        // Get all questionnaires for this patient
        const questionnairesSnap = await db
          .collection('patients')
          .doc(patientId)
          .collection('questionnaires')
          .get();

        if (questionnairesSnap.empty) {
          console.log(`⏭️  Patient ${patientId}: No questionnaires`);
          continue;
        }

        console.log(
          `📋 Patient ${patientId} (${patientData.email || 'no email'}): ${questionnairesSnap.size} questionnaires`
        );

        // Copy each questionnaire to root collection
        const batch = db.batch();
        let batchCount = 0;

        for (const qDoc of questionnairesSnap.docs) {
          const questionnaireId = qDoc.id;
          const questionnaireData = qDoc.data();

          // Ensure patientUid is set
          const rootData = {
            ...questionnaireData,
            patientUid: patientId,
            // Add migration metadata
            migratedAt: admin.firestore.FieldValue.serverTimestamp(),
            migratedFrom: `patients/${patientId}/questionnaires/${questionnaireId}`,
          };

          const rootRef = db.collection('questionnaires').doc(questionnaireId);
          batch.set(rootRef, rootData, { merge: true });

          batchCount++;
          totalQuestionnaires++;

          // Commit batch every 500 operations (Firestore limit)
          if (batchCount >= 500) {
            await batch.commit();
            console.log(`  ✅ Committed batch of ${batchCount} questionnaires`);
            batchCount = 0;
          }
        }

        // Commit remaining operations
        if (batchCount > 0) {
          await batch.commit();
          console.log(`  ✅ Committed final batch of ${batchCount} questionnaires`);
        }

        successCount += questionnairesSnap.size;
      } catch (error) {
        errorCount++;
        errors.push({
          patientId,
          error: error.message,
        });
        console.error(`  ❌ Error processing patient ${patientId}:`, error.message);
      }
    }

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('═'.repeat(60));
    console.log(`Total patients processed: ${totalPatients}`);
    console.log(`Total questionnaires found: ${totalQuestionnaires}`);
    console.log(`✅ Successfully migrated: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);

    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.forEach(({ patientId, error }) => {
        console.log(`  - Patient ${patientId}: ${error}`);
      });
    }

    console.log('\n✨ Migration complete!\n');
  } catch (error) {
    console.error('\n❌ Fatal error during migration:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run migration
migrateQuestionnaires();
