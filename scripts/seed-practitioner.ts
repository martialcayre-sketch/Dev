import type { ServiceAccount } from 'firebase-admin';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getServiceAccount() {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
  if (b64) {
    return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  }
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) throw new Error('Missing Firebase Admin env');
  return { projectId, clientEmail, privateKey };
}

async function main() {
  const email = process.env.SEED_PRACTITIONER_EMAIL!;
  const username = process.env.SEED_PRACTITIONER_USERNAME!;
  const password = process.env.SEED_PRACTITIONER_PASSWORD!;
  if (!email || !username || !password) throw new Error('Missing seed env');

  initializeApp({ credential: cert(getServiceAccount() as ServiceAccount) });
  const auth = getAuth();
  const db = getFirestore();

  let user;
  try {
    user = await auth.getUserByEmail(email);
  } catch {
    user = await auth.createUser({ email, password, emailVerified: true, displayName: username });
  }

  const uid = user.uid;
  const batch = db.batch();
  batch.set(
    db.collection('users').doc(uid),
    {
      role: 'practitioner',
      email,
      username,
      emailVerified: true,
      approvedByPractitioner: true,
      createdAt: new Date(),
    },
    { merge: true }
  );
  batch.set(
    db.collection('practitioners').doc(username),
    {
      uid,
      username,
      displayName: username,
      active: true,
    },
    { merge: true }
  );
  await batch.commit();
  console.log('Seeded practitioner:', username);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
