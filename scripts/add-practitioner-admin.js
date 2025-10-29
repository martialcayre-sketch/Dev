/* eslint-disable @typescript-eslint/no-var-requires */
// Script Node.js pour ajouter le praticien Martial CAYRE directement dans Firestore
// À exécuter dans le répertoire racine du projet

const admin = require('firebase-admin');

// Initialise l'app admin avec les credentials de l'émulateur ou de production
admin.initializeApp({
  projectId: 'neuronutrition-app',
});

const db = admin.firestore();
// Utilise l'émulateur Firestore si disponible
if (process.env.FIRESTORE_EMULATOR_HOST) {
  db.settings({ host: process.env.FIRESTORE_EMULATOR_HOST, ssl: false });
  console.log("Connexion à l'émulateur Firestore:", process.env.FIRESTORE_EMULATOR_HOST);
}

async function main() {
  const email = 'martialcayre@gmail.com';
  const displayName = 'Martial CAYRE';
  const uid = 'martial-cayre-unique'; // UID fixe pour ce praticien

  // Ajoute le document utilisateur
  await db.collection('users').doc(uid).set(
    {
      uid,
      email,
      role: 'practitioner',
      displayName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      emailVerified: true,
      approvalStatus: 'approved',
    },
    { merge: true }
  );

  console.log('Praticien ajouté dans Firestore:', displayName);
}

main().catch(console.error);
