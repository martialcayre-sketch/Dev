import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';

// Ensure Admin SDK is initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Cloud Function qui se déclenche automatiquement lorsqu'un questionnaire est complété
 * - Met à jour le compteur de questionnaires en attente du patient
 * - Crée une notification pour le praticien
 * - Envoie un email au praticien
 * - Enregistre la soumission dans questionnaireSubmissions
 */
export const onQuestionnaireCompleted = onDocumentUpdated(
  {
    document: 'questionnaires/{rawId}',
    region: 'europe-west1',
  },
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    // Vérifier si le statut est passé à 'completed'
    if (!afterData || afterData.status !== 'completed' || beforeData?.status === 'completed') {
      // Pas de changement vers 'completed', on ignore
      return null;
    }

    // rawId format: templateId_patientUid
    const rawId = event.params.rawId as string;
    const [templateId, patientUid] = rawId.includes('_')
      ? rawId.split('_')
      : [rawId, afterData.patientUid];
    const questionnaireId = templateId;
    const questionnaireTitle = afterData.title || templateId;
    const practitionerId = afterData.practitionerId;

    logger.info(`🔵 Questionnaire completed: ${questionnaireTitle} by patient ${patientUid}`);

    try {
      // 1. Récupérer les informations du patient
      const patientRef = db.collection('patients').doc(patientUid);
      const patientSnap = await patientRef.get();

      if (!patientSnap.exists) {
        logger.warn(`⚠️ Patient document not found: ${patientUid}`);
        return null;
      }

      const patientData = patientSnap.data() as any;
      const patientName =
        patientData.displayName ||
        `${patientData.firstname || ''} ${patientData.lastname || ''}`.trim() ||
        patientData.email?.split('@')[0] ||
        'Patient';
      const patientEmail = patientData.email;

      // 2. Compter les questionnaires en attente (pending)
      const pendingQuery = await db
        .collection('questionnaires')
        .where('patientUid', '==', patientUid)
        .where('status', '==', 'pending')
        .get();
      const pendingCount = pendingQuery.size;

      // 3. Mettre à jour le document patient avec le compteur
      await patientRef.update({
        pendingQuestionnairesCount: pendingCount,
        lastQuestionnaireCompletedAt: FieldValue.serverTimestamp(),
      });

      logger.info(`✅ Updated patient document: ${pendingCount} pending questionnaires remaining`);

      // 4. Enregistrer la soumission dans questionnaireSubmissions (pour historique praticien)
      try {
        await db.collection('questionnaireSubmissions').add({
          patientUid,
          patientName,
          patientEmail,
          practitionerId: practitionerId || patientData.practitionerId,
          questionnaire: questionnaireTitle,
          questionnaireId,
          submittedAt: FieldValue.serverTimestamp(),
          responses: afterData.responses || {},
        });
        logger.info(`✅ Questionnaire submission recorded`);
      } catch (submissionError: any) {
        logger.error('❌ Failed to record submission:', submissionError);
      }

      // 5. Si un praticien est assigné, le notifier
      const targetPractitionerId = practitionerId || patientData.practitionerId;

      if (!targetPractitionerId) {
        logger.warn(`⚠️ No practitioner assigned to patient ${patientUid}`);
        return null;
      }

      logger.info(`🔔 Notifying practitioner ${targetPractitionerId}`);

      // 6. Récupérer les informations du praticien
      const practitionerRef = db.collection('practitioners').doc(targetPractitionerId);
      const practitionerSnap = await practitionerRef.get();

      if (!practitionerSnap.exists) {
        logger.warn(`⚠️ Practitioner not found: ${targetPractitionerId}`);
        return null;
      }

      const practitionerData = practitionerSnap.data() as any;
      const practitionerEmail = practitionerData.email;
      const practitionerName =
        practitionerData.displayName || practitionerData.firstname || 'Praticien';

      // 7. Créer une notification dans l'interface praticien
      await db
        .collection('practitioners')
        .doc(targetPractitionerId)
        .collection('notifications')
        .add({
          type: 'questionnaire_completed',
          title: 'Nouveau questionnaire complété',
          message: `${patientName} a complété le questionnaire "${questionnaireTitle}"`,
          patientId: patientUid,
          patientName,
          questionnaireId,
          questionnaireTitle,
          read: false,
          createdAt: FieldValue.serverTimestamp(),
          link: `/patients/${patientUid}/questionnaires/${questionnaireId}`,
        });

      logger.info(`✅ In-app notification created for practitioner`);

      // 8. Incrémenter le compteur de notifications non lues du praticien
      try {
        await practitionerRef.update({
          unreadNotificationsCount: FieldValue.increment(1),
        });
      } catch (counterError: any) {
        // Si le champ n'existe pas encore, le créer
        await practitionerRef.set(
          {
            unreadNotificationsCount: 1,
          },
          { merge: true }
        );
      }

      // 9. Envoyer un email au praticien
      if (practitionerEmail) {
        try {
          await db.collection('mail').add({
            to: practitionerEmail,
            message: {
              subject: `📋 ${patientName} a complété un questionnaire - NeuroNutrition`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #10B981;">Nouveau questionnaire complété</h2>
                  <p>Bonjour ${practitionerName},</p>
                  <p>Votre patient <strong>${patientName}</strong> vient de compléter le questionnaire :</p>
                  <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin: 0 0 10px 0; color: #4F46E5;">📋 ${questionnaireTitle}</h3>
                    <p style="margin: 0; color: #666;">
                      ${
                        pendingCount === 0
                          ? '✅ Tous les questionnaires ont été complétés !'
                          : `⏳ ${pendingCount} questionnaire${
                              pendingCount > 1 ? 's' : ''
                            } en attente`
                      }
                    </p>
                  </div>
                  <p>Vous pouvez maintenant consulter les réponses et adapter votre suivi en conséquence.</p>
                  <p style="margin: 30px 0;">
                    <a href="https://neuronutrition-app-practitioner.web.app/patients/${patientUid}/questionnaires/${questionnaireId}" 
                       style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                      Consulter les réponses
                    </a>
                  </p>
                  <p style="color: #666; font-size: 14px; margin-top: 30px;">
                    💡 <strong>Astuce :</strong> Vous pouvez accéder à tous les questionnaires du patient depuis sa fiche.
                  </p>
                  <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
                  <p style="color: #999; font-size: 12px;">
                    Cet email a été envoyé automatiquement par NeuroNutrition.<br>
                    Pour modifier vos préférences de notification, rendez-vous dans vos paramètres.
                  </p>
                </div>
              `,
            },
          });
          logger.info(`✅ Email notification sent to practitioner ${practitionerEmail}`);
        } catch (emailError: any) {
          logger.error('❌ Failed to send email notification:', emailError);
          // Non-bloquant
        }
      }

      // 10. Si tous les questionnaires sont complétés, envoyer une notification spéciale
      if (pendingCount === 0) {
        logger.info(`🎉 All questionnaires completed for patient ${patientUid}`);

        // Notification supplémentaire pour le praticien
        await db
          .collection('practitioners')
          .doc(targetPractitionerId)
          .collection('notifications')
          .add({
            type: 'all_questionnaires_completed',
            title: 'Tous les questionnaires complétés',
            message: `${patientName} a terminé tous ses questionnaires`,
            patientId: patientUid,
            patientName,
            read: false,
            createdAt: FieldValue.serverTimestamp(),
            link: `/patients/${patientUid}`,
            priority: 'high',
          });

        // Email spécial
        if (practitionerEmail) {
          await db.collection('mail').add({
            to: practitionerEmail,
            message: {
              subject: `🎉 ${patientName} a terminé tous ses questionnaires - NeuroNutrition`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #10B981;">✅ Tous les questionnaires complétés !</h2>
                  <p>Bonjour ${practitionerName},</p>
                  <p>Bonne nouvelle ! <strong>${patientName}</strong> a terminé tous les questionnaires qui lui ont été assignés.</p>
                  <p>Vous disposez maintenant de toutes les informations nécessaires pour :</p>
                  <ul>
                    <li>Établir un diagnostic complet</li>
                    <li>Élaborer un plan de traitement personnalisé</li>
                    <li>Planifier les prochaines consultations</li>
                    <li>Suivre l'évolution du patient</li>
                  </ul>
                  <p style="margin: 30px 0;">
                    <a href="https://neuronutrition-app-practitioner.web.app/patients/${patientUid}" 
                       style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                      Voir le dossier complet
                    </a>
                  </p>
                  <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
                  <p style="color: #999; font-size: 12px;">
                    NeuroNutrition - Plateforme de suivi patient
                  </p>
                </div>
              `,
            },
          });
        }
      }

      logger.info(`🎉 SUCCESS: Notification flow completed for questionnaire ${questionnaireId}`);

      return null;
    } catch (error: any) {
      logger.error('❌ ERROR in onQuestionnaireCompleted:', error);
      // Ne pas throw pour éviter de bloquer le système
      return null;
    }
  }
);
