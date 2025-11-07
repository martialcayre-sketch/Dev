import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

/**
 * Cloud Function sécurisée pour changer le statut d'un questionnaire
 * Seul le praticien lié au patient peut changer le statut
 */
export const setQuestionnaireStatus = onCall(async (req) => {
  const ctx = req.auth;
  if (!ctx) throw new HttpsError('unauthenticated', 'Auth required');

  const { patientId, questionnaireId, status } = req.data as {
    patientId: string;
    questionnaireId: string;
    status: 'reopened' | 'completed';
  };

  if (!patientId || !questionnaireId || !status) {
    throw new HttpsError('invalid-argument', 'Missing required parameters');
  }

  if (status !== 'reopened' && status !== 'completed') {
    throw new HttpsError('invalid-argument', 'Invalid status value');
  }

  const db = admin.firestore();

  // Vérifie que l'appelant est bien le praticien lié au patient
  const patientSnap = await db.doc(`patients/${patientId}`).get();
  if (!patientSnap.exists) throw new HttpsError('not-found', 'Patient not found');

  const practitionerId = patientSnap.get('practitionerId');
  if (practitionerId !== ctx.uid) throw new HttpsError('permission-denied', 'Not allowed');

  const qRefSub = db.doc(`patients/${patientId}/questionnaires/${questionnaireId}`);
  const qRefRoot = db.doc(`questionnaires/${questionnaireId}`);

  const updates: any = {
    status,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (status === 'completed') {
    updates.completedAt = admin.firestore.FieldValue.serverTimestamp();
  } else {
    updates.completedAt = null;
  }

  // Double write: subcollection + root collection
  await Promise.all([qRefSub.update(updates), qRefRoot.update(updates)]);

  logger.info(
    `✅ Questionnaire ${questionnaireId} status changed to ${status} by practitioner ${ctx.uid}`
  );

  // Notifier le patient si rouvert
  if (status === 'reopened') {
    try {
      const qSnap = await qRefSub.get();
      const title = qSnap.get('title') || 'Questionnaire';
      const patientEmail = patientSnap.get('email');

      if (patientEmail) {
        await db.collection('mail').add({
          to: patientEmail,
          message: {
            subject: '🔓 Questionnaire rouvert - NeuroNutrition',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4F46E5;">Questionnaire rouvert</h2>
                <p>Votre praticien a rouvert le questionnaire suivant pour modification :</p>
                <p style="margin: 20px 0; padding: 15px; background-color: #F3F4F6; border-radius: 8px;">
                  <strong>${title}</strong>
                </p>
                <p>Vous pouvez maintenant le modifier et le soumettre à nouveau.</p>
                <p style="margin: 30px 0;">
                  <a href="https://neuronutrition-app-patient.web.app/dashboard/questionnaires/${questionnaireId}" 
                     style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                    Modifier le questionnaire
                  </a>
                </p>
              </div>
            `,
          },
        });
        logger.info(`📧 Email notification sent to patient ${patientId}`);
      }

      // Créer notification in-app
      await db.collection(`patients/${patientId}/notifications`).add({
        type: 'questionnaire_reopened',
        title: 'Questionnaire rouvert',
        message: `Votre praticien a rouvert "${title}" pour modification`,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        link: `/dashboard/questionnaires/${questionnaireId}`,
      });
    } catch (notifError: any) {
      logger.error('❌ Failed to send notification:', notifError);
    }
  }

  return { ok: true, status };
});
