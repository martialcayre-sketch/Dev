import { db } from './firebase'
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore'

export async function getPublicFormByToken(token: string) {
  const ref = doc(db, 'formLinks', token)
  const snap = await getDoc(ref)
  return snap.exists() ? (snap.data() as any) : null
}

export async function submitPublicResponse(token: string, payload: any) {
  const col = collection(db, 'formLinks', token, 'responses')
  await addDoc(col, { payload, createdAt: serverTimestamp() })
}

