/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { auth as authV1 } from 'firebase-functions/v1';
import { setGlobalOptions } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

// Export Cloud Functions from separate modules
export { onQuestionnaireCompleted } from './onQuestionnaireCompleted';

setGlobalOptions({ region: 'europe-west1', maxInstances: 10 });

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export const onAuthCreate = authV1.user().onCreate(async (user) => {
  const ref = db.collection('users').doc(user.uid);
  const snap = await ref.get();
  if (snap.exists) return;
  await ref.set({
    uid: user.uid,
    email: user.email || '',
    role: 'patient',
    displayName: user.displayName || '',
    createdAt: FieldValue.serverTimestamp(),
    emailVerified: !!user.emailVerified,
    approvalStatus: 'pending',
  });
});

export const approvePatient = onCall(async (request) => {
  const ctx = request.auth;
  if (!ctx) throw new HttpsError('unauthenticated', 'Authentication required');

  const practitionerUid = ctx.uid;
  // Load practitioner profile to validate role
  const practitionerSnap = await db.collection('users').doc(practitionerUid).get();
  if (!practitionerSnap.exists) throw new HttpsError('permission-denied', 'No profile');
  const practitioner = practitionerSnap.data() as any;
  if (practitioner.role !== 'practitioner')
    throw new HttpsError('permission-denied', 'Not a practitioner');

  const { patientUid, decision } = request.data as {
    patientUid?: string;
    decision?: 'approved' | 'rejected';
  };
  if (!patientUid || !decision) throw new HttpsError('invalid-argument', 'Missing parameters');

  const patientRef = db.collection('users').doc(patientUid);
  const patientSnap = await patientRef.get();
  if (!patientSnap.exists) throw new HttpsError('not-found', 'Patient not found');
  const patient = patientSnap.data() as any;
  if (patient.chosenPractitionerId !== practitionerUid)
    throw new HttpsError('permission-denied', 'Not assigned practitioner');

  const updates: any = {
    approvalStatus: decision,
    approvedAt: FieldValue.serverTimestamp(),
    approvedByPractitioner: decision === 'approved',
  };
  await patientRef.update(updates);

  // Also mirror status into patients collection if it exists
  try {
    const patientDoc = await db.collection('patients').doc(patientUid).get();
    if (patientDoc.exists) {
      await db
        .collection('patients')
        .doc(patientUid)
        .update({
          status: decision === 'approved' ? 'approved' : 'rejected',
          approvedAt: FieldValue.serverTimestamp(),
        });
    }
  } catch (e) {
    logger.warn('Unable to sync patients collection status', e as any);
  }

  logger.info(`Patient ${patientUid} ${decision} by ${practitionerUid}`);
  return { ok: true };
});

/**
 * Questionnaire templates to assign to patients
 */
interface QuestionnaireTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
}

const DEFAULT_QUESTIONNAIRES: QuestionnaireTemplate[] = [
  {
    id: 'plaintes-et-douleurs',
    title: 'Mes plaintes actuelles et troubles ressentis',
    category: 'Mode de vie',
    description: "Évaluez l'intensité de vos troubles actuels (fatigue, douleurs, digestion, etc.)",
  },
  {
    id: 'life-journey',
    title: 'Mode de vie – 7 Sphères Vitales',
    category: 'Mode de vie SIIN',
    description:
      'Évaluez votre mode de vie selon 7 dimensions clés : sommeil, rythme, stress, activité physique, toxiques, relations sociales et alimentation',
  },
  {
    id: 'alimentaire',
    title: 'Questionnaire alimentaire',
    category: 'Alimentaire',
    description: 'Décrivez vos habitudes alimentaires et votre régime',
  },
  {
    id: 'dnsm',
    title: 'Questionnaire Dopamine-Noradrénaline-Sérotonine-Mélatonine',
    category: 'Neuro-psychologie',
    description: 'Évaluez vos neurotransmetteurs et votre équilibre hormonal',
  },
];

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
    logger.info(`🔵 START: Assigning questionnaires to patient ${patientUid}`);

    // Vérifier si les questionnaires ont déjà été assignés (via un doc connu)
    const firstQuestionnaireRef = db
      .collection('patients')
      .doc(patientUid)
      .collection('questionnaires')
      .doc(DEFAULT_QUESTIONNAIRES[0].id);
    const firstQuestionnaireSnap = await firstQuestionnaireRef.get();

    if (firstQuestionnaireSnap.exists) {
      logger.info(`✅ Questionnaires already assigned to patient ${patientUid}`);
      return {
        success: true,
        alreadyAssigned: true,
        message: 'Les questionnaires ont déjà été assignés',
      };
    }

    logger.info(`📝 Creating ${DEFAULT_QUESTIONNAIRES.length} questionnaires...`);

    // Créer les questionnaires dans Firestore
    const batch = db.batch();
    const now = FieldValue.serverTimestamp();

    DEFAULT_QUESTIONNAIRES.forEach((template) => {
      const questionnaireRef = db
        .collection('patients')
        .doc(patientUid)
        .collection('questionnaires')
        .doc(template.id);

      batch.set(questionnaireRef, {
        ...template,
        patientUid,
        practitionerId: practitionerId || null,
        status: 'pending',
        assignedAt: now,
        completedAt: null,
        responses: {},
      });
    });

    await batch.commit();
    logger.info(`✅ Batch committed: ${DEFAULT_QUESTIONNAIRES.length} questionnaires created`);

    // Mettre à jour (ou créer) le document patient pour notifier le praticien
    logger.info(`📄 Updating patient document...`);
    await db.collection('patients').doc(patientUid).set(
      {
        hasQuestionnairesAssigned: true,
        questionnairesAssignedAt: now,
        pendingQuestionnairesCount: DEFAULT_QUESTIONNAIRES.length,
      },
      { merge: true }
    );

    // Créer une notification pour le patient
    logger.info(`🔔 Creating notification...`);
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
      `🎉 SUCCESS: Assigned ${DEFAULT_QUESTIONNAIRES.length} questionnaires to patient ${patientUid}`
    );

    // Envoyer un email au patient
    try {
      const patientDoc = await db.collection('patients').doc(patientUid).get();
      const patientData = patientDoc.data();
      const patientEmail = patientData?.email || ctx.token.email;

      if (patientEmail) {
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
        logger.info(`📧 Email notification queued for patient ${patientUid}`);
      }
    } catch (emailError: any) {
      logger.error('❌ Failed to send email notification:', emailError);
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
    logger.error('❌ ERROR: Failed to assign questionnaires:', error);
    throw new HttpsError('internal', `Failed to assign questionnaires: ${error.message}`);
  }
});

/**
 * Cloud Function pour activer un compte patient après création via invitation
 * - Marque le token d'invitation comme utilisé
 * - Définit le statut du patient à "approved" directement
 * - Envoie un email de bienvenue au patient
 * - Notifie le praticien de la création du compte
 */
export const activatePatient = onCall(async (request) => {
  const ctx = request.auth;
  if (!ctx) throw new HttpsError('unauthenticated', 'Authentication required');

  const patientUid = ctx.uid;

  try {
    logger.info(`🔵 START: Activating patient account ${patientUid}`);

    // Récupérer les infos du patient
    const patientRef = db.collection('patients').doc(patientUid);
    const patientSnap = await patientRef.get();

    if (!patientSnap.exists) {
      throw new HttpsError('not-found', 'Patient document not found');
    }

    const patientData = patientSnap.data() as any;
    const practitionerId = patientData.practitionerId;
    const patientEmail = patientData.email || ctx.token.email;
    const patientName =
      patientData.displayName || patientData.firstname || patientEmail?.split('@')[0] || 'Patient';
    let invitationToken = patientData.invitationToken; // Token stored when patient doc created

    // Si le token n'est pas stocké dans le document patient (ancien compte),
    // chercher un token non utilisé correspondant à cet email
    if (!invitationToken && patientEmail) {
      try {
        logger.info(`🔍 Searching for unused token for email: ${patientEmail}`);
        const tokensQuery = await db
          .collection('invitationTokens')
          .where('email', '==', patientEmail)
          .where('used', '==', false)
          .limit(1)
          .get();

        if (!tokensQuery.empty) {
          invitationToken = tokensQuery.docs[0].id;
          logger.info(`✅ Found unused token: ${invitationToken}`);

          // Stocker le token dans le document patient pour référence future
          await patientRef.update({
            invitationToken,
          });
        }
      } catch (searchError: any) {
        logger.warn(`⚠️ Failed to search for token:`, searchError);
      }
    }

    // 1. Mettre à jour le statut du patient à "approved" directement
    logger.info(`✅ Setting patient status to 'approved'`);
    await patientRef.update({
      status: 'approved',
      approvalStatus: 'approved',
      approvedAt: FieldValue.serverTimestamp(),
      activatedAt: FieldValue.serverTimestamp(),
    });

    // 1.5. Marquer le token d'invitation comme utilisé si présent
    if (invitationToken) {
      try {
        logger.info(`🔒 Marking invitation token as used: ${invitationToken}`);
        const tokenRef = db.collection('invitationTokens').doc(invitationToken);
        const tokenSnap = await tokenRef.get();
        if (tokenSnap.exists) {
          await tokenRef.update({
            used: true,
            usedAt: FieldValue.serverTimestamp(),
          });
          logger.info(`✅ Token marked as used`);
        }
      } catch (tokenError: any) {
        logger.warn(`⚠️ Failed to mark token as used:`, tokenError);
        // Non-critical, continue
      }
    }

    // Également mettre à jour la collection users si elle existe
    const userRef = db.collection('users').doc(patientUid);
    const userSnap = await userRef.get();
    if (userSnap.exists) {
      await userRef.update({
        approvalStatus: 'approved',
        approvedAt: FieldValue.serverTimestamp(),
      });
    }

    // 2. Envoyer un email de bienvenue au patient avec lien d'accès
    if (patientEmail) {
      logger.info(`📧 Sending welcome email to patient ${patientEmail}`);
      await db.collection('mail').add({
        to: patientEmail,
        message: {
          subject: '🎉 Bienvenue sur NeuroNutrition !',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4F46E5;">Bienvenue ${patientName} !</h2>
              <p>Votre compte patient a été créé avec succès.</p>
              <p>Vous pouvez désormais accéder à votre espace personnel pour :</p>
              <ul>
                <li>Consulter vos rendez-vous</li>
                <li>Remplir vos questionnaires</li>
                <li>Suivre vos recommandations</li>
                <li>Communiquer avec votre praticien</li>
              </ul>
              <p style="margin: 30px 0;">
                <a href="https://neuronutrition-app-patient.web.app" 
                   style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                  Accéder à mon espace patient
                </a>
              </p>
              <p style="color: #666; font-size: 14px;">
                📌 <strong>Conservez ce lien pour accéder à votre espace patient :</strong><br>
                <a href="https://neuronutrition-app-patient.web.app" style="color: #4F46E5;">
                  https://neuronutrition-app-patient.web.app
                </a>
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">
                Si vous avez des questions, n'hésitez pas à contacter votre praticien.
              </p>
            </div>
          `,
        },
      });
      logger.info(`✅ Welcome email sent to patient`);
    }

    // 3. Notifier le praticien de la création du compte
    if (practitionerId) {
      logger.info(`🔔 Notifying practitioner ${practitionerId}`);

      // Récupérer l'email du praticien
      const practitionerRef = db.collection('practitioners').doc(practitionerId);
      const practitionerSnap = await practitionerRef.get();

      if (practitionerSnap.exists) {
        const practitionerData = practitionerSnap.data() as any;
        const practitionerEmail = practitionerData.email;

        if (practitionerEmail) {
          // Envoyer un email au praticien
          await db.collection('mail').add({
            to: practitionerEmail,
            message: {
              subject: '✅ Nouveau patient activé - NeuroNutrition',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #10B981;">Nouveau patient activé</h2>
                  <p>Bonjour,</p>
                  <p>Votre patient <strong>${patientName}</strong> (${patientEmail}) a créé son compte et est maintenant actif.</p>
                  <p>Vous pouvez dès maintenant :</p>
                  <ul>
                    <li>Consulter son profil</li>
                    <li>Planifier des consultations</li>
                    <li>Lui assigner des questionnaires</li>
                    <li>Suivre son évolution</li>
                  </ul>
                  <p style="margin: 30px 0;">
                    <a href="https://neuronutrition-app-practitioner.web.app/patients/${patientUid}" 
                       style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                      Voir le profil patient
                    </a>
                  </p>
                </div>
              `,
            },
          });
          logger.info(`✅ Notification email sent to practitioner`);
        }

        // Créer une notification dans l'interface praticien
        await db
          .collection('practitioners')
          .doc(practitionerId)
          .collection('notifications')
          .add({
            type: 'patient_activated',
            title: 'Nouveau patient activé',
            message: `${patientName} a créé son compte`,
            patientId: patientUid,
            patientEmail,
            patientName,
            read: false,
            createdAt: FieldValue.serverTimestamp(),
            link: `/patients/${patientUid}`,
          });
        logger.info(`✅ In-app notification created for practitioner`);
      }
    }

    logger.info(`🎉 SUCCESS: Patient ${patientUid} activated successfully`);

    // 4. Assigner automatiquement les 4 questionnaires principaux
    try {
      logger.info(`📋 Auto-assigning questionnaires to patient ${patientUid}`);

      const batch = db.batch();
      const timestamp = FieldValue.serverTimestamp();

      DEFAULT_QUESTIONNAIRES.forEach((template) => {
        const questionnaireRef = db
          .collection('patients')
          .doc(patientUid)
          .collection('questionnaires')
          .doc(template.id);

        batch.set(questionnaireRef, {
          ...template,
          patientUid,
          practitionerId: practitionerId || null,
          status: 'pending',
          assignedAt: timestamp,
          completedAt: null,
          responses: {},
        });
      });

      await batch.commit();
      logger.info(`✅ Questionnaires assigned automatically`);

      // Mettre à jour le document patient
      await patientRef.update({
        hasQuestionnairesAssigned: true,
        questionnairesAssignedAt: timestamp,
        pendingQuestionnairesCount: DEFAULT_QUESTIONNAIRES.length,
      });

      // Créer une notification pour les questionnaires
      await db
        .collection('patients')
        .doc(patientUid)
        .collection('notifications')
        .add({
          type: 'questionnaires_assigned',
          title: 'Questionnaires disponibles',
          message: `${DEFAULT_QUESTIONNAIRES.length} questionnaires vous ont été assignés. Commencez par les compléter pour démarrer votre suivi.`,
          read: false,
          createdAt: timestamp,
          link: '/dashboard/questionnaires',
        });

      // Envoyer un email de notification des questionnaires
      if (patientEmail) {
        await db.collection('mail').add({
          to: patientEmail,
          message: {
            subject: '📋 Questionnaires à compléter - NeuroNutrition',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4F46E5;">Questionnaires à compléter</h2>
                <p>Bonjour ${patientName},</p>
                <p>Pour démarrer votre suivi personnalisé, veuillez compléter les <strong>${DEFAULT_QUESTIONNAIRES.length} questionnaires</strong> suivants :</p>
                <ul>
                  ${DEFAULT_QUESTIONNAIRES.map((q) => `<li><strong>${q.title}</strong><br><span style="color: #666; font-size: 14px;">${q.description}</span></li>`).join('\n')}
                </ul>
                <p>Ces informations permettront à votre praticien de mieux comprendre votre situation.</p>
                <p style="margin: 30px 0;">
                  <a href="https://neuronutrition-app-patient.web.app/dashboard/questionnaires" 
                     style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                    Compléter les questionnaires
                  </a>
                </p>
              </div>
            `,
          },
        });
        logger.info(`✅ Questionnaires notification email sent`);
      }
    } catch (questError: any) {
      logger.error('❌ Failed to auto-assign questionnaires:', questError);
      // Non-bloquant, le patient pourra les avoir assignés manuellement plus tard
    }

    return {
      success: true,
      message: 'Compte activé avec succès',
      status: 'approved',
    };
  } catch (error: any) {
    logger.error('❌ ERROR: Failed to activate patient:', error);
    throw new HttpsError('internal', `Failed to activate patient: ${error.message}`);
  }
});

/**
 * Cloud Function pour récupérer les détails d'un token d'invitation
 */
export const getInvitationToken = onCall(async (request) => {
  const { token } = request.data as { token?: string };

  if (!token) {
    throw new HttpsError('invalid-argument', 'Token is required');
  }

  try {
    logger.info(`🔍 Looking up invitation token: ${token}`);

    const tokenRef = db.collection('invitationTokens').doc(token);
    const tokenSnap = await tokenRef.get();

    if (!tokenSnap.exists) {
      logger.warn(`❌ Token not found: ${token}`);
      return { valid: false, error: "Lien d'invitation invalide" };
    }

    const tokenData = tokenSnap.data() as any;

    // Vérifier si le token a déjà été utilisé
    if (tokenData.used) {
      logger.warn(`❌ Token already used: ${token}`);
      return { valid: false, error: 'Ce lien a déjà été utilisé' };
    }

    // Vérifier l'expiration
    const expiresAt = tokenData.expiresAt?.toDate();
    if (expiresAt && expiresAt < new Date()) {
      logger.warn(`❌ Token expired: ${token}`);
      return { valid: false, error: 'Ce lien a expiré' };
    }

    logger.info(`✅ Token valid: ${token}`);

    return {
      valid: true,
      email: tokenData.email,
      tempPassword: tokenData.tempPassword,
      practitionerId: tokenData.practitionerId,
      patientData: tokenData.patientData || {},
    };
  } catch (error: any) {
    logger.error('❌ ERROR: Failed to get invitation token:', error);
    throw new HttpsError('internal', `Failed to get invitation token: ${error.message}`);
  }
});

/**
 * Cloud Function pour marquer un token d'invitation comme utilisé
 */
export const markInvitationTokenUsed = onCall(async (request) => {
  const { token } = request.data as { token?: string };

  if (!token) {
    throw new HttpsError('invalid-argument', 'Token is required');
  }

  try {
    logger.info(`🔒 Marking token as used: ${token}`);

    const tokenRef = db.collection('invitationTokens').doc(token);
    await tokenRef.update({
      used: true,
      usedAt: FieldValue.serverTimestamp(),
    });

    logger.info(`✅ Token marked as used: ${token}`);

    return { success: true };
  } catch (error: any) {
    logger.error('❌ ERROR: Failed to mark token as used:', error);
    throw new HttpsError('internal', `Failed to mark token as used: ${error.message}`);
  }
});
