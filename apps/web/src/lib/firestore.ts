import { db } from './firebase'
import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { auth } from './firebase'

export async function upsertProfile(data: { displayName?: string }) {
  const u = auth.currentUser
  if (!u) throw new Error('Not authenticated')
  const ref = doc(db, 'profiles', u.uid)
  await setDoc(ref, { ownerUid: u.uid, ...data, updatedAt: serverTimestamp() }, { merge: true })
}

export async function getProfile() {
  const u = auth.currentUser
  if (!u) throw new Error('Not authenticated')
  const ref = doc(db, 'profiles', u.uid)
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() as any : null
}

export async function addIntake(kind: 'HAD'|'PSQI'|'DNSM', payload: any) {
  const u = auth.currentUser
  if (!u) throw new Error('Not authenticated')
  const col = collection(db, 'intakes')
  await addDoc(col, { ownerUid: u.uid, kind, payload, createdAt: serverTimestamp() })
}

export async function setProfileBadge(key: string, value: Record<string, any>) {
  const u = auth.currentUser
  if (!u) throw new Error('Not authenticated')
  const ref = doc(db, 'profiles', u.uid)
  const payload: any = { badges: { [key]: { ...value, updatedAt: serverTimestamp() } } }
  await setDoc(ref, payload, { merge: true })
}
