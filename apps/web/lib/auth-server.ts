'use server';
import { cookies } from 'next/headers';

import { adminAuth, adminDb } from './firebase/admin';

export async function currentUserServer() {
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;
  if (!token) return null;
  try {
    const decoded = await adminAuth().verifyIdToken(token);
    return decoded;
  } catch {
    return null;
  }
}

export async function getUserDoc(uid: string) {
  const doc = await adminDb().collection('users').doc(uid).get();
  return doc.exists ? doc.data() : null;
}
