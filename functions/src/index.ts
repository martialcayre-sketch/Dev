/**
 * Firebase Cloud Functions index (réparé)
 * Fournit les callables et endpoints (invitations, activation, questionnaires, diagnostic).
 */
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { auth as authV1 } from 'firebase-functions/v1';
import { setGlobalOptions } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
export { assignQuestionnaires } from './assignQuestionnaires';
export { api } from './http/app';
export { manualAssignQuestionnaires } from './manualAssignQuestionnaires';
export { migrateQuestionnairesToRoot } from './migrateQuestionnairesToRoot';
export { onQuestionnaireCompleted } from './onQuestionnaireCompleted';
export { setQuestionnaireStatus } from './setQuestionnaireStatus';
export { submitQuestionnaire } from './submitQuestionnaire';
// 📚 Bibliothèque questionnaires pour praticiens
export { assignSelectedQuestionnaires, getQuestionnaireLibrary } from './questionnaireLibrary';
// 🧠 APIs scoring et graphiques centralisés
export {
  calculateQuestionnaireScores,
  generateQuestionnaireChart,
  getPractitionerScoresDashboard,
} from './scoringApis';
// 🎯 Nouvelles fonctions pour détection d'âge et assignation intelligente
export { assignAgeAppropriateQuestionnaires } from './utils/ageAwareAssignment';
setGlobalOptions({
  region: 'europe-west1',
  maxInstances: 10,
});
// secrets removed to avoid conflicts
if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

// -------------------------------- Invitation --------------------------------
export const createPatientInvitation = onCall(async (request) => {
  const ctx = request.auth;
  if (!ctx) throw new HttpsError('unauthenticated', 'Authentication required');
  const { email, firstname, lastname, phone } = request.data as {
    email?: string;
    firstname?: string;
    lastname?: string;
    phone?: string;
  };
  if (!email || !email.includes('@'))
    throw new HttpsError('invalid-argument', 'Valid email is required');
  const practitionerId = ctx.uid;
  const practitionerRef = db.collection('practitioners').doc(practitionerId);
  const practitionerSnap = await practitionerRef.get();
  if (!practitionerSnap.exists) throw new HttpsError('not-found', 'Practitioner not found');
  const practitionerData = practitionerSnap.data() as any;
  if (practitionerData.approvalStatus !== 'approved')
    throw new HttpsError('permission-denied', 'Practitioner not approved');
  const existingPatients = await db.collection('patients').where('email', '==', email).get();
  if (!existingPatients.empty) throw new HttpsError('already-exists', 'Patient email exists');
  const token = db.collection('invitationTokens').doc().id;
  const tempPassword =
    Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
  let authUser;
  try {
    authUser = await admin.auth().createUser({
      email,
      password: tempPassword,
      displayName: firstname && lastname ? `${firstname} ${lastname}` : firstname || undefined,
    });
  } catch (e: any) {
    if (e.code === 'auth/email-already-exists')
      throw new HttpsError('already-exists', 'Auth user exists');
    throw e;
  }
  await db
    .collection('patients')
    .doc(authUser.uid)
    .set({
      email,
      firstname: firstname || null,
      lastname: lastname || null,
      phone: phone || null,
      displayName: firstname && lastname ? `${firstname} ${lastname}` : firstname || null,
      practitionerId,
      status: 'pending',
      approvalStatus: 'pending',
      invitationToken: token,
      createdAt: FieldValue.serverTimestamp(),
      provider: 'password',
    });
  await db
    .collection('invitationTokens')
    .doc(token)
    .set({
      email,
      tempPassword,
      practitionerId,
      patientId: authUser.uid,
      patientData: {
        firstname: firstname || null,
        lastname: lastname || null,
        phone: phone || null,
      },
      used: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: FieldValue.serverTimestamp(),
    });
  const link = `${
    process.env.PATIENT_APP_URL || 'https://neuronutrition-app-patient.web.app'
  }/signup?token=${token}`;
  await db.collection('mail').add({
    to: email,
    message: {
      subject: 'Invitation NeuroNutrition',
      html: `Lien: <a href='${link}'>Créer mon compte</a>`,
    },
  });
  return { success: true, token, invitationLink: link };
});

// -------------------------------- Auth profile mirroring --------------------------------
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

// -------------------------------- Approve patient --------------------------------
export const approvePatient = onCall(async (request) => {
  const ctx = request.auth;
  if (!ctx) throw new HttpsError('unauthenticated', 'Authentication required');
  const practitionerUid = ctx.uid;
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
  await patientRef.update({
    approvalStatus: decision,
    approvedAt: FieldValue.serverTimestamp(),
    approvedByPractitioner: decision === 'approved',
  });
  try {
    const pDoc = await db.collection('patients').doc(patientUid).get();
    if (pDoc.exists)
      await pDoc.ref.update({
        status: decision === 'approved' ? 'approved' : 'rejected',
        approvedAt: FieldValue.serverTimestamp(),
      });
  } catch (e) {
    logger.warn('Unable to sync patients collection status', e as any);
  }
  return { ok: true };
});

// -------------------------------- Activate patient --------------------------------
export const activatePatient = onCall(async (request) => {
  const ctx = request.auth;
  if (!ctx) throw new HttpsError('unauthenticated', 'Authentication required');

  const patientUid = ctx.uid;

  try {
    logger.info(`🔵 START: Activating patient account ${patientUid}`);

    const patientRef = db.collection('patients').doc(patientUid);
    const patientSnap = await patientRef.get();
    if (!patientSnap.exists) throw new HttpsError('not-found', 'Patient document not found');

    const patientData = patientSnap.data() as any;
    const practitionerId = patientData.practitionerId;
    const patientEmail = patientData.email || ctx.token.email;
    const patientName =
      patientData.displayName || patientData.firstname || patientEmail?.split('@')[0] || 'Patient';
    let invitationToken = patientData.invitationToken;

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
          await patientRef.update({ invitationToken });
        }
      } catch (e: any) {
        logger.warn('⚠️ Token lookup failed', e);
      }
    }

    logger.info(`✅ Setting patient status to 'approved'`);
    await patientRef.update({
      status: 'approved',
      approvalStatus: 'approved',
      approvedAt: FieldValue.serverTimestamp(),
      activatedAt: FieldValue.serverTimestamp(),
    });

    if (invitationToken) {
      try {
        logger.info(`🔒 Marking invitation token as used: ${invitationToken}`);
        const tokenRef = db.collection('invitationTokens').doc(invitationToken);
        const tokenSnap = await tokenRef.get();
        if (tokenSnap.exists)
          await tokenRef.update({ used: true, usedAt: FieldValue.serverTimestamp() });
      } catch (e: any) {
        logger.warn('⚠️ Failed to mark token used', e);
      }
    }

    const userRef = db.collection('users').doc(patientUid);
    const userSnap = await userRef.get();
    if (userSnap.exists)
      await userRef.update({
        approvalStatus: 'approved',
        approvedAt: FieldValue.serverTimestamp(),
      });

    if (patientEmail) {
      logger.info(`📧 Sending welcome email to ${patientEmail}`);
      await db.collection('mail').add({
        to: patientEmail,
        message: {
          subject: '🎉 Bienvenue sur NeuroNutrition !',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4F46E5;">Bienvenue ${patientName} !</h2>
              <p>Votre compte patient a été créé avec succès.</p>
              <ul>
                <li>Consulter vos rendez-vous</li>
                <li>Remplir vos questionnaires</li>
                <li>Suivre vos recommandations</li>
                <li>Communiquer avec votre praticien</li>
              </ul>
              <p style="margin: 30px 0;">
                <a href="https://neuronutrition-app-patient.web.app" style="background-color:#4F46E5;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px;display:inline-block;">Accéder à mon espace patient</a>
              </p>
            </div>
          `,
        },
      });
    }

    if (practitionerId) {
      logger.info(`🔔 Notifying practitioner ${practitionerId}`);
      const practitionerRef = db.collection('practitioners').doc(practitionerId);
      const practitionerSnap = await practitionerRef.get();
      if (practitionerSnap.exists) {
        const practitionerData = practitionerSnap.data() as any;
        const practitionerEmail = practitionerData.email;
        if (practitionerEmail) {
          await db.collection('mail').add({
            to: practitionerEmail,
            message: {
              subject: '✅ Nouveau patient activé - NeuroNutrition',
              html: `Nouveau patient activé: ${patientName} (${patientEmail})`,
            },
          });
        }
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
      }
    }

    logger.info('🎉 SUCCESS: Base activation done');

    // ⚠️ IMPORTANT: Ne pas assigner les questionnaires immédiatement
    // L'assignation se fera APRÈS la fiche d'identification (détection d'âge)
    await patientRef.update({
      hasQuestionnairesAssigned: false,
      identificationRequired: true,
      activationCompletedAt: FieldValue.serverTimestamp(),
    });

    logger.info(
      '✅ Patient activation completed - identification required before questionnaire assignment'
    );

    return {
      success: true,
      message: 'Compte activé avec succès',
      status: 'approved',
      identificationRequired: true,
      nextStep: 'complete_identification',
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

/**
 * Diagnostic des questionnaires d'un patient (comparaison root vs sous-collection)
 */
export const diagnosePatientQuestionnaires = onCall(async (request) => {
  const ctx = request.auth;
  if (!ctx) throw new HttpsError('unauthenticated', 'Authentication required');

  const { patientUid, email } = request.data as { patientUid?: string; email?: string };
  let targetUid = patientUid;

  try {
    if (!targetUid) {
      if (!email) throw new HttpsError('invalid-argument', 'Provide patientUid or email');
      logger.info(`🔍 Diagnosing by email lookup: ${email}`);
      const q = await db.collection('patients').where('email', '==', email).limit(1).get();
      if (q.empty) throw new HttpsError('not-found', 'Patient email not found');
      targetUid = q.docs[0].id;
    }

    logger.info(`🩺 Questionnaire diagnostic for patient ${targetUid}`);

    // Charger document patient pour méta
    const patientDoc = await db.collection('patients').doc(targetUid).get();
    if (!patientDoc.exists) throw new HttpsError('not-found', 'Patient document missing');
    const pdata = patientDoc.data() as any;

    // Root questionnaires (id = templateId_patientUid)
    const rootSnap = await db
      .collection('questionnaires')
      .where('patientUid', '==', targetUid)
      .get();
    const rootList = rootSnap.docs.map((d) => {
      const data = d.data() as any;
      const rawId = d.id;
      const templateId = rawId.includes('_') ? rawId.split('_')[0] : rawId;
      return {
        rawId,
        templateId,
        status: data.status || null,
        assignedAt: data.assignedAt || null,
        exists: true,
      };
    });

    return {
      patientUid: targetUid,
      email: pdata.email || null,
      hasQuestionnairesAssigned: !!pdata.hasQuestionnairesAssigned,
      pendingQuestionnairesCount: pdata.pendingQuestionnairesCount || 0,
      rootCount: rootList.length,
      rootList,
    };
  } catch (error: any) {
    logger.error('❌ Diagnostic error', error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError('internal', error.message || 'Diagnostic failed');
  }
});
