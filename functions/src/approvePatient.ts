import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

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

  await patientRef.update({ approvalStatus: decision, approvedAt: FieldValue.serverTimestamp() });
  return { ok: true };
});
