import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { DEFAULT_QUESTIONNAIRES } from './constants/questionnaires';

// Ensure Admin SDK is initialized even if this module is imported before index initializes it
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Using shared DEFAULT_QUESTIONNAIRES

/**
 * Cloud Function pour assigner automatiquement les questionnaires à un patient
 * lors de l'ouverture de son espace consultation
 */
export const assignQuestionnaires = onCall(async (request) => {
  const ctx = request.auth;
  if (!ctx) throw new HttpsError('unauthenticated', 'Authentication required');

  const patientUid = ctx.uid;
  const { practitionerId } = request.data as { practitionerId?: string };

  try {
    logger.info(`Assigning questionnaires to patient ${patientUid}`);

    // Vérifier si les questionnaires ont déjà été assignés (via un doc connu)
    const firstQuestionnaireRef = db
      .collection('patients')
      .doc(patientUid)
      .collection('questionnaires')
      .doc(DEFAULT_QUESTIONNAIRES[0].id);
    const firstQuestionnaireSnap = await firstQuestionnaireRef.get();

    if (firstQuestionnaireSnap.exists) {
      logger.info(`Questionnaires already assigned to patient ${patientUid}`);
      return {
        success: true,
        alreadyAssigned: true,
        message: 'Les questionnaires ont déjà été assignés',
      };
    }

    // Créer les questionnaires dans Firestore (DOUBLE WRITE: subcollection + root collection)
    const batch = db.batch();
    const now = admin.firestore.FieldValue.serverTimestamp();

    DEFAULT_QUESTIONNAIRES.forEach((template) => {
      const questionnaireData = {
        ...template,
        patientUid,
        practitionerId: practitionerId || null,
        status: 'pending', // pending, completed
        assignedAt: now,
        completedAt: null,
        responses: {},
      };

      // Write to subcollection (legacy path)
      const subCollectionRef = db
        .collection('patients')
        .doc(patientUid)
        .collection('questionnaires')
        .doc(template.id);
      batch.set(subCollectionRef, questionnaireData);

      // Write to root collection (new path)
      const rootRef = db.collection('questionnaires').doc(template.id);
      batch.set(rootRef, questionnaireData);
    });

    await batch.commit();

    // Mettre à jour (ou créer) le document patient pour notifier le praticien
    await db.collection('patients').doc(patientUid).set(
      {
        hasQuestionnairesAssigned: true,
        questionnairesAssignedAt: now,
        pendingQuestionnairesCount: DEFAULT_QUESTIONNAIRES.length,
      },
      { merge: true }
    );

    // Créer une notification pour le patient
    await db
      .collection('patients')
      .doc(patientUid)
      .collection('notifications')
      .add({
        type: 'questionnaires_assigned',
        title: 'Nouveaux questionnaires disponibles',
        message: `${DEFAULT_QUESTIONNAIRES.length} questionnaires vous ont été assignés. Veuillez les compléter dès que possible.`,
        read: false,
        createdAt: now,
        link: '/dashboard/questionnaires',
      });

    logger.info(
      `Successfully assigned ${DEFAULT_QUESTIONNAIRES.length} questionnaires to patient ${patientUid}`
    );

    // Envoyer un email au patient
    try {
      const patientDoc = await db.collection('patients').doc(patientUid).get();
      const patientData = patientDoc.data();
      const patientEmail = patientData?.email || ctx.token.email;

      if (patientEmail) {
        // Créer un document dans une collection mail pour Trigger Email Extension
        await db.collection('mail').add({
          to: patientEmail,
          message: {
            subject: '📋 Nouveaux questionnaires à remplir - NeuroNutrition',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4F46E5;">Nouveaux questionnaires disponibles</h2>
                <p>Bonjour,</p>
                <p>Votre praticien vous a assigné <strong>${DEFAULT_QUESTIONNAIRES.length} questionnaires</strong> à compléter :</p>
                <ul>
                  ${DEFAULT_QUESTIONNAIRES.map((q) => `<li><strong>${q.title}</strong> - ${q.description}</li>`).join('\n')}
                </ul>
                <p>Ces questionnaires nous aideront à mieux comprendre votre situation et à personnaliser votre suivi.</p>
                <p style="margin: 30px 0;">
                  <a href="${process.env.PATIENT_APP_URL || 'https://neuronutrition-app.web.app'}/dashboard/questionnaires" 
                     style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                    Remplir les questionnaires
                  </a>
                </p>
                <p style="color: #666; font-size: 12px;">
                  Si vous n'avez pas demandé ces questionnaires, veuillez contacter votre praticien.
                </p>
              </div>
            `,
          },
        });
        logger.info(`Email notification queued for patient ${patientUid}`);
      }
    } catch (emailError: any) {
      logger.error('Failed to send email notification:', emailError);
      // Ne pas bloquer si l'email échoue
    }

    return {
      success: true,
      questionnaires: DEFAULT_QUESTIONNAIRES.map((q) => ({
        id: q.id,
        title: q.title,
      })),
      message: `${DEFAULT_QUESTIONNAIRES.length} questionnaires ont été assignés`,
    };
  } catch (error: any) {
    logger.error('Error assigning questionnaires:', error);
    throw new HttpsError('internal', `Failed to assign questionnaires: ${error.message}`);
  }
});
