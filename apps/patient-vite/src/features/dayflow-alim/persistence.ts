import { firestore } from '@/lib/firebase';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import type { AxisScores, DayFlowPayload } from './types';

const PATH = (uid: string) => collection(firestore, 'users', uid, 'surveys', 'dayflow-alim');

export async function saveDayFlowSurvey(uid: string, payload: DayFlowPayload, id?: string) {
  const now = serverTimestamp();
  const base: DayFlowPayload = {
    ...payload,
    uid,
    version: payload.version || '1.0',
    createdAt: payload.createdAt || now,
    updatedAt: now,
    radarInverted: payload.radarInverted || invertRadar(payload.scores.axes),
  };

  if (id) {
    const ref = doc(PATH(uid), id);
    await setDoc(ref, base, { merge: true });
    return { id: ref.id };
  } else {
    const ref = await addDoc(PATH(uid), base);
    return { id: ref.id };
  }
}

export async function getDayFlowSurvey(uid: string, id: string) {
  const ref = doc(PATH(uid), id);
  const snap = await getDoc(ref);
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as any) } as DayFlowPayload) : undefined;
}

export async function listDayFlowSurveys(uid: string, opts?: { limit?: number }) {
  const q = query(PATH(uid), orderBy('createdAt', 'desc'), limit(opts?.limit ?? 50));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as DayFlowPayload[];
}

export function watchDayFlowSurveys(
  uid: string,
  cb: (items: DayFlowPayload[]) => void,
  opts?: { liveOnly?: boolean }
) {
  const q = query(PATH(uid), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const out = snap.docs
      .filter((d) => (opts?.liveOnly ? !d.data().archived : true))
      .map((d) => ({ id: d.id, ...(d.data() as any) })) as DayFlowPayload[];
    cb(out);
  });
}

export function invertRadar(axes: AxisScores): AxisScores {
  // Inversion simple: déficit = 100 - score
  return {
    AIA: Math.max(0, 100 - axes.AIA),
    SER: Math.max(0, 100 - axes.SER),
    DOP: Math.max(0, 100 - axes.DOP),
    NEU: Math.max(0, 100 - axes.NEU),
    CON: Math.max(0, 100 - axes.CON),
  };
}
