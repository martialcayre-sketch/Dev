#!/usr/bin/env node
/**
 * Script pour lister les comptes praticiens dans Firestore (émulateur ou production)
 */

import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Configuration pour l'émulateur
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:5003';

const app = initializeApp({
  projectId: 'neuronutrition-app',
});

const db = getFirestore(app);

async function listPractitioners() {
  try {
    console.log('\n📋 Liste des comptes praticiens:\n');

    const snapshot = await db.collection('practitioners').get();

    if (snapshot.empty) {
      console.log('❌ Aucun compte praticien trouvé\n');
      return;
    }

    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`👨‍⚕️ ${data.displayName || 'Sans nom'}`);
      console.log(`   Email: ${data.email}`);
      console.log(`   UID: ${doc.id}`);
      console.log(`   Status: ${data.status || 'N/A'}`);
      console.log(`   Créé le: ${data.createdAt?.toDate().toLocaleString() || 'N/A'}`);
      console.log('');
    });

    console.log(`Total: ${snapshot.size} compte(s)\n`);
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

listPractitioners().then(() => process.exit(0));
