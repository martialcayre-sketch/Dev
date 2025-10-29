/* eslint-disable @typescript-eslint/no-var-requires */
// Script Node.js pour créer l'utilisateur praticien dans Firebase Auth et Firestore (production)
// Nécessite le fichier serviceAccountKey.json à la racine du projet

const admin = require('firebase-admin');

const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'neuronutrition-app',
});

const db = admin.firestore();

async function main() {
  const email = 'martialcayre@gmail.com';
  const displayName = 'Martial CAYRE';
  const password = 'Plexmartial1902';

  // Crée l'utilisateur dans Firebase Auth (ou récupère s'il existe déjà)
  let userRecord;
  try {
    userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
      emailVerified: true,
    });
    console.log('Utilisateur créé dans Auth:', userRecord.uid);
  } catch (err) {
    if (err && err.code === 'auth/email-already-exists') {
      // Récupère l'utilisateur existant et met à jour les infos de sécurité
      userRecord = await admin.auth().getUserByEmail(email);
      await admin.auth().updateUser(userRecord.uid, {
        password,
        displayName,
        emailVerified: true,
      });
      console.log('Utilisateur existant mis à jour dans Auth:', userRecord.uid);
    } else {
      throw err;
    }
  }

  // Ajoute le profil dans Firestore
  await db.collection('users').doc(userRecord.uid).set(
    {
      uid: userRecord.uid,
      email,
      role: 'practitioner',
      displayName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      emailVerified: true,
      approvalStatus: 'approved',
    },
    { merge: true }
  );

  console.log('Praticien créé dans Auth et Firestore:', displayName);
}

main().catch(console.error);
