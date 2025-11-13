import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { onRequest } from 'firebase-functions/v2/https';
import { DEFAULT_QUESTIONNAIRES } from './constants/questionnaires';

const db = admin.firestore();

/**
 * Cloud Function temporaire pour assigner manuellement les questionnaires
 * URL: https://europe-west1-neuronutrition-app.cloudfunctions.net/manualAssignQuestionnaires?email=martialcayre@live.fr&secret=YOUR_SECRET
 */
export const manualAssignQuestionnaires = onRequest(
  { region: 'europe-west1', timeoutSeconds: 60, secrets: ['MANUAL_ASSIGN_SECRET'] },
  async (req, res) => {
    // Simple auth
    const secret = req.query.secret as string;
    const expected = process.env.MANUAL_ASSIGN_SECRET;
    if (!expected || secret !== expected) {
      res.status(403).send('Forbidden');
      return;
    }

    const email = req.query.email as string;
    if (!email) {
      res.status(400).send('Missing email parameter');
      return;
    }

    try {
      logger.info(`🔍 Searching for patient: ${email}`);

      // Trouver le patient par email
      const patientsSnap = await db
        .collection('patients')
        .where('email', '==', email)
        .limit(1)
        .get();

      if (patientsSnap.empty) {
        res.status(404).send(`Patient not found: ${email}`);
        return;
      }

      const patientDoc = patientsSnap.docs[0];
      const patientId = patientDoc.id;
      const patientData = patientDoc.data();

      logger.info(`✅ Patient found: ${patientId}`);

      // Vérifier les questionnaires existants
      const existingQuestionnaires = await db
        .collection('questionnaires')
        .where('patientUid', '==', patientId)
        .get();

      logger.info(`📋 Existing questionnaires: ${existingQuestionnaires.size}`);

      const batch = db.batch();
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      let assignedCount = 0;

      for (const template of DEFAULT_QUESTIONNAIRES) {
        // Générer un ID unique pour chaque questionnaire
        const uniqueId = `${template.id}_${patientId}`;

        // Vérifier si déjà assigné
        const existingDoc = await db.collection('questionnaires').doc(uniqueId).get();
        if (existingDoc.exists) {
          logger.info(`⏭️  ${template.title} (already assigned)`);
          continue;
        }

        const questionnaireData = {
          ...template,
          patientUid: patientId,
          practitionerId: patientData.practitionerId || null,
          status: 'pending',
          assignedAt: timestamp,
          completedAt: null,
          responses: {},
        };

        // Root collection only (sub-collection deprecated)
        const rootRef = db.collection('questionnaires').doc(uniqueId);
        batch.set(rootRef, questionnaireData);

        logger.info(`✅ ${template.title}`);
        assignedCount++;
      }

      if (assignedCount > 0) {
        await batch.commit();
        logger.info(`🎉 ${assignedCount} questionnaire(s) assigned successfully`);

        // Mettre à jour le document patient
        await db
          .collection('patients')
          .doc(patientId)
          .update({
            hasQuestionnairesAssigned: true,
            questionnairesAssignedAt: timestamp,
            pendingQuestionnairesCount: admin.firestore.FieldValue.increment(assignedCount),
          });
      }

      res.status(200).json({
        success: true,
        patientId,
        email,
        assignedCount,
        existingCount: existingQuestionnaires.size,
        message: `${assignedCount} questionnaires assigned to ${email}`,
      });
    } catch (error: any) {
      logger.error('Error assigning questionnaires:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);
