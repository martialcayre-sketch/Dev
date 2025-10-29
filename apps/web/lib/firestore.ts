import { adminDb } from './firebase/admin';

export async function getUserByUsername(username: string) {
  const snap = await adminDb().collection('users').where('username', '==', username).limit(1).get();
  return snap.empty ? null : { id: snap.docs[0].id, ...(snap.docs[0].data() as any) };
}

export async function setPatientPending(uid: string, practitionerId: string) {
  const batch = adminDb().batch();
  const userRef = adminDb().collection('users').doc(uid);
  const patientRef = adminDb().collection('patients').doc(uid);
  batch.set(
    userRef,
    {
      role: 'patient',
      practitionerId,
      approvedByPractitioner: false,
      createdAt: new Date(),
    },
    { merge: true }
  );
  batch.set(
    patientRef,
    {
      uid,
      practitionerId,
      status: 'pending',
      createdAt: new Date(),
    },
    { merge: true }
  );
  await batch.commit();
}

export async function approvePatient(patientUid: string, action: 'approve' | 'reject') {
  const status = action === 'approve' ? 'approved' : 'rejected';
  const batch = adminDb().batch();
  const userRef = adminDb().collection('users').doc(patientUid);
  const patientRef = adminDb().collection('patients').doc(patientUid);
  batch.update(patientRef, { status });
  if (action === 'approve') {
    batch.update(userRef, { approvedByPractitioner: true });
  } else {
    batch.update(userRef, { approvedByPractitioner: false });
  }
  await batch.commit();
}
