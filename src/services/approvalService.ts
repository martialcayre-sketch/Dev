import { httpsCallable } from 'firebase/functions';

import { functions } from '../lib/firebase';

export async function approvePatient(patientUid: string) {
  const fn = httpsCallable<
    { patientUid: string; decision: 'approved' | 'rejected' },
    { ok: boolean }
  >(functions, 'approvePatient');
  const res = await fn({ patientUid, decision: 'approved' });
  return res.data;
}

export async function rejectPatient(patientUid: string) {
  const fn = httpsCallable<
    { patientUid: string; decision: 'approved' | 'rejected' },
    { ok: boolean }
  >(functions, 'approvePatient');
  const res = await fn({ patientUid, decision: 'rejected' });
  return res.data;
}
