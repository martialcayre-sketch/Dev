import * as admin from 'firebase-admin';

let initialized = false;

function decodeServiceAccountFromEnv(): admin.ServiceAccount | undefined {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
  if (b64) {
    const json = Buffer.from(b64, 'base64').toString('utf8');
    return JSON.parse(json);
  }
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey } as admin.ServiceAccount;
  }
  return undefined;
}

export function adminApp() {
  if (!initialized) {
    const svc = decodeServiceAccountFromEnv();
    if (svc) {
      const credential = admin.credential.cert(svc as admin.ServiceAccount);
      admin.initializeApp({ credential });
    } else if (!admin.apps.length) {
      // Fall back to application default credentials when available (emulator or local ADC)
      try {
        admin.initializeApp();
      } catch {
        // Leave uninitialized; callers must guard usage
      }
    }
    initialized = true;
  }
  return admin.app();
}

export const adminAuth = () => (admin.apps.length ? admin.app().auth() : admin.auth());
export const adminDb = () => (admin.apps.length ? admin.app().firestore() : admin.firestore());
