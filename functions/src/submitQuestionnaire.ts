import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

/**
 * Cloud Function pour soumettre un questionnaire au praticien
 * - Vérifie que le patient ne peut soumettre que son propre questionnaire
 * - Marque le questionnaire comme 'submitted' (verrouillé côté patient)
 * - Crée une entrée dans l'inbox du praticien
 */
export const submitQuestionnaire = onCall(async (req) => {
  const ctx = req.auth;
  if (!ctx) throw new HttpsError('unauthenticated', 'Auth required');

  const { patientId, questionnaireId } = req.data as {
    patientId: string;
    questionnaireId: string;
  };

  // 1) Le patient ne peut soumettre que son propre questionnaire
  if (ctx.uid !== patientId) {
    throw new HttpsError('permission-denied', 'Not your questionnaire');
  }

  const db = admin.firestore();
  const patientRef = db.doc(`patients/${patientId}`);
  const qRefSub = db.doc(`patients/${patientId}/questionnaires/${questionnaireId}`);
  const qRefRoot = db.doc(`questionnaires/${questionnaireId}`);

  const [patientSnap, qSnap] = await Promise.all([patientRef.get(), qRefSub.get()]);
  if (!patientSnap.exists) throw new HttpsError('not-found', 'Patient not found');
  if (!qSnap.exists) throw new HttpsError('not-found', 'Questionnaire not found');

  const practitionerId = patientSnap.get('practitionerId') as string | undefined;
  if (!practitionerId) throw new HttpsError('failed-precondition', 'No practitioner linked');

  const qData = qSnap.data()!;
  const title = (qData.title as string) ?? 'Questionnaire';

  // 2) Écritures atomiques
  const inboxRef = db.collection(`practitioners/${practitionerId}/inbox`).doc();
  const now = admin.firestore.FieldValue.serverTimestamp();

  await db.runTransaction(async (trx) => {
    const freshQ = await trx.get(qRefSub);
    if (!freshQ.exists) throw new HttpsError('not-found', 'Questionnaire not found (tx)');

    const status = freshQ.get('status');
    if (status === 'completed' || status === 'submitted') {
      throw new HttpsError('failed-precondition', 'Already submitted or completed');
    }

    const updateData = {
      status: 'submitted',
      submittedAt: now,
      updatedAt: now,
    };

    // 2a) Marquer comme soumis côté patient (subcollection)
    trx.update(qRefSub, updateData);

    // 2a-bis) Marquer comme soumis dans root collection
    trx.update(qRefRoot, updateData);

    // 2b) Créer l'entrée d'inbox côté praticien
    trx.set(inboxRef, {
      type: 'questionnaire_submission',
      patientId,
      questionnaireId,
      questionnaireTitle: title,
      status: 'new',
      submittedAt: now,
    });
  });

  logger.info(
    `✅ Questionnaire ${questionnaireId} submitted by patient ${patientId} to practitioner ${practitionerId}`
  );

  // (Option) : envoi FCM / email ici si configuré
  try {
    const practitionerDoc = await db.doc(`practitioners/${practitionerId}`).get();
    const practitionerEmail = practitionerDoc.get('email');
    const patientEmail = patientSnap.get('email') || ctx.token.email;

    if (practitionerEmail) {
      await db.collection('mail').add({
        to: practitionerEmail,
        message: {
          subject: '📋 Nouveau questionnaire soumis - NeuroNutrition',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4F46E5;">Nouveau questionnaire soumis</h2>
              <p>Votre patient <strong>${patientEmail}</strong> a soumis le questionnaire :</p>
              <p style="margin: 20px 0; padding: 15px; background-color: #F3F4F6; border-radius: 8px;">
                <strong>${title}</strong>
              </p>
              <p style="margin: 30px 0;">
                <a href="https://neuronutrition-app-practitioner.web.app/patients/${patientId}/questionnaires/${questionnaireId}" 
                   style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                  Consulter le questionnaire
                </a>
              </p>
            </div>
          `,
        },
      });
      logger.info(`📧 Email notification sent to practitioner ${practitionerId}`);
    }
  } catch (emailError: any) {
    logger.error('❌ Failed to send email notification:', emailError);
    // Ne pas bloquer si l'email échoue
  }

  return { ok: true };
});
