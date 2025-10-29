import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import type { DocumentData, Timestamp } from 'firebase/firestore';
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

import { auth, db } from '../lib/firebase';
import type { UserProfile } from '../lib/types';

const USERS = 'users';

export async function createPractitionerProfile({
  email,
  password,
  displayName,
}: {
  email: string;
  password: string;
  displayName: string;
}) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) await updateProfile(cred.user, { displayName });
  const ref = doc(db, USERS, cred.user.uid);
  const data: UserProfile = {
    uid: cred.user.uid,
    email: cred.user.email || email,
    role: 'practitioner',
    displayName,
    createdAt: serverTimestamp() as unknown as Timestamp,
    emailVerified: cred.user.emailVerified,
    approvalStatus: 'approved',
  };
  await setDoc(ref, data, { merge: true });
  return cred.user;
}

export async function createPatientProfile({
  email,
  password,
  displayName,
  chosenPractitionerId,
}: {
  email: string;
  password: string;
  displayName: string;
  chosenPractitionerId: string;
}) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) await updateProfile(cred.user, { displayName });
  await sendEmailVerification(cred.user);
  const ref = doc(db, USERS, cred.user.uid);
  const data: Partial<UserProfile> = {
    uid: cred.user.uid,
    email: cred.user.email || email,
    role: 'patient',
    displayName,
    createdAt: serverTimestamp() as unknown as Timestamp,
    emailVerified: cred.user.emailVerified,
    chosenPractitionerId,
    approvalStatus: 'pending',
  };
  await setDoc(ref, data, { merge: true });
  return cred.user;
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const u = auth.currentUser;
  if (!u) return null;
  const snap = await getDoc(doc(db, USERS, u.uid));
  if (!snap.exists()) return null;
  const data = snap.data() as DocumentData;
  return {
    uid: data.uid ?? snap.id,
    email: data.email,
    role: data.role,
    displayName: data.displayName,
    createdAt: data.createdAt,
    emailVerified: data.emailVerified,
    chosenPractitionerId: data.chosenPractitionerId,
    approvalStatus: data.approvalStatus,
    approvedAt: data.approvedAt,
  } as UserProfile;
}

export function watchUserProfile(uid: string, cb: (p: UserProfile | null) => void) {
  const unsubscribe = onSnapshot(doc(db, USERS, uid), (snap) => {
    if (snap.exists()) {
      const d = snap.data() as DocumentData;
      cb({
        uid: d.uid ?? snap.id,
        email: d.email,
        role: d.role,
        displayName: d.displayName,
        createdAt: d.createdAt,
        emailVerified: d.emailVerified,
        chosenPractitionerId: d.chosenPractitionerId,
        approvalStatus: d.approvalStatus,
        approvedAt: d.approvedAt,
      } as UserProfile);
    } else cb(null);
  });
  return unsubscribe;
}

export async function listPractitioners(): Promise<
  Array<{ uid: string; displayName: string; email: string }>
> {
  const q = query(collection(db, USERS), where('role', '==', 'practitioner'));
  const res = await getDocs(q);
  return res.docs.map((d) => {
    const data = d.data() as DocumentData;
    return {
      uid: data.uid ?? d.id,
      displayName: data.displayName || data.email || 'Praticien',
      email: data.email,
    };
  });
}
