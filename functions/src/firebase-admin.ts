import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  // En prod (Cloud Functions/Run), ADC est utilisé automatiquement
  // En local, si vous souhaitez utiliser un service account JSON, définissez USE_LOCAL_SERVICE_ACCOUNT=true
  // et placez le fichier dans functions/.secrets/serviceAccount.json (non versionné)
  if (process.env.USE_LOCAL_SERVICE_ACCOUNT === 'true') {
    // Chargement conditionnel, évitez de committer le fichier
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const serviceAccount = require('../.secrets/serviceAccount.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    admin.initializeApp();
  }
}

export const firestore = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
export default admin;
