import type { LifeJourneyResult } from '@/components/SIIN/LifeJourney7Spheres';
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

const PATH = (uid: string) => collection(firestore, 'users', uid, 'surveys');

export async function saveLifeJourneySurvey(uid: string, payload: LifeJourneyResult, id?: string) {
  const now = serverTimestamp();
  const base = {
    ...payload,
    uid,
    type: 'lifejourney-v1',
    version: '1.0',
    createdAt: payload.completedAt ? new Date(payload.completedAt) : now,
    updatedAt: now,
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

export async function getLifeJourneySurvey(uid: string, id: string) {
  const ref = doc(PATH(uid), id);
  const snap = await getDoc(ref);
  return snap.exists()
    ? ({ id: snap.id, ...(snap.data() as any) } as LifeJourneyResult & { id: string })
    : undefined;
}

export async function listLifeJourneySurveys(uid: string, opts?: { limit?: number }) {
  const q = query(PATH(uid), orderBy('createdAt', 'desc'), limit(opts?.limit ?? 50));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as (LifeJourneyResult & {
    id: string;
  })[];
}

export function watchLifeJourneySurveys(
  uid: string,
  cb: (items: (LifeJourneyResult & { id: string })[]) => void,
  opts?: { liveOnly?: boolean }
) {
  const q = query(PATH(uid), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const out = snap.docs
      .filter((d) => (opts?.liveOnly ? !(d.data() as any).archived : true))
      .map((d) => ({ id: d.id, ...(d.data() as any) })) as (LifeJourneyResult & { id: string })[];
    cb(out);
  });
}
