/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from 'firebase-functions/v2';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { auth } from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { FieldValue } from 'firebase-admin/firestore';

setGlobalOptions({ region: 'europe-west1', maxInstances: 10 });

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export const onAuthCreate = auth.user().onCreate(async (user) => {
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
