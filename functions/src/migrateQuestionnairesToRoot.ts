import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { onRequest } from 'firebase-functions/v2/https';

/**
 * HTTPS Cloud Function to migrate all questionnaires from subcollections to root collection
 * Call this once: https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/migrateQuestionnairesToRoot?secret=YOUR_SECRET
 *
 * Security: Requires MIGRATION_SECRET environment variable
 */
export const migrateQuestionnairesToRoot = onRequest(
  { region: 'europe-west1', timeoutSeconds: 540, memory: '1GiB', secrets: ['MIGRATION_SECRET'] },
  async (req, res) => {
    // Authentication check: require secret token
    const secret = req.query.secret as string;
    const expectedSecret = process.env.MIGRATION_SECRET;

    if (!expectedSecret) {
      logger.error('❌ MIGRATION_SECRET environment variable not configured');
      res.status(500).send('Server configuration error - MIGRATION_SECRET not set');
      return;
    }

    if (!secret || secret !== expectedSecret) {
      logger.warn('⚠️  Unauthorized migration attempt', { ip: req.ip });
      res.status(403).send('Unauthorized - missing or invalid secret');
      return;
    }

    logger.info('🔐 Authentication successful, starting migration');

    logger.info('🚀 Starting questionnaire migration to root collection');

    const db = admin.firestore();
    let totalPatients = 0;
    let totalQuestionnaires = 0;
    let successCount = 0;
    let errorCount = 0;
    const errors: any[] = [];

    try {
      // Get all patients
      const patientsSnap = await db.collection('patients').get();
      totalPatients = patientsSnap.size;

      logger.info(`📊 Found ${totalPatients} patients to process`);

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
            logger.info(`⏭️  Patient ${patientId}: No questionnaires`);
            continue;
          }

          logger.info(
            `📋 Patient ${patientId} (${patientData.email || 'no email'}): ${
              questionnairesSnap.size
            } questionnaires`
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
              logger.info(`  ✅ Committed batch of ${batchCount} questionnaires`);
              batchCount = 0;
            }
          }

          // Commit remaining operations
          if (batchCount > 0) {
            await batch.commit();
            logger.info(`  ✅ Committed final batch of ${batchCount} questionnaires`);
          }

          successCount += questionnairesSnap.size;
        } catch (error: any) {
          errorCount++;
          errors.push({
            patientId,
            error: error.message,
          });
          logger.error(`  ❌ Error processing patient ${patientId}:`, error);
        }
      }

      // Summary
      const summary = {
        success: true,
        totalPatients,
        totalQuestionnaires,
        successCount,
        errorCount,
        errors: errors.length > 0 ? errors : undefined,
      };

      logger.info('✨ Migration complete!', summary);

      res.status(200).json(summary);
    } catch (error: any) {
      logger.error('❌ Fatal error during migration:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);
