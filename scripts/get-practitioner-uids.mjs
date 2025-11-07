#!/usr/bin/env node

/**
 * Script pour lister tous les UIDs praticiens
 */

import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Chemin vers la clé de service
const SERVICE_ACCOUNT_PATH = join(__dirname, '..', 'serviceAccountKey.json');

// Initialiser Firebase Admin
const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function getPractitionerUids() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  👨‍⚕️ LISTE DES PRATICIENS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  try {
    const practitionersSnapshot = await db.collection('practitioners').get();

    if (practitionersSnapshot.empty) {
      console.log('❌ Aucun praticien trouvé dans Firestore');
      console.log('');
      return;
    }

    console.log(`📊 ${practitionersSnapshot.size} praticien(s) trouvé(s):`);
    console.log('');

    practitionersSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. UID: ${doc.id}`);
      console.log(`   Email: ${data.email || 'N/A'}`);
      console.log(`   Nom: ${data.displayName || data.firstname + ' ' + data.lastname || 'N/A'}`);
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('💡 Pour lier les patients à un praticien, exécutez :');
    console.log('   node scripts/fix-patient-practitioner-link.mjs <UID_PRATICIEN>');
    console.log('');
  } catch (error) {
    console.error('');
    console.error('❌ Erreur lors de la récupération des praticiens:', error);
    console.error('');
    process.exit(1);
  }
}

getPractitionerUids();
