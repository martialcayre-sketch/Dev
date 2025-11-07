#!/usr/bin/env node

/**
 * Script pour lister les patients et leur practitionerId
 */

import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SERVICE_ACCOUNT_PATH = join(__dirname, '..', 'serviceAccountKey.json');

const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function listPatients() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  🏥 LISTE DES PATIENTS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  try {
    const patientsSnapshot = await db.collection('patients').get();

    if (patientsSnapshot.empty) {
      console.log('❌ Aucun patient trouvé');
      console.log('');
      return;
    }

    console.log(`📊 ${patientsSnapshot.size} patient(s) trouvé(s):`);
    console.log('');

    let withPractitioner = 0;
    let withoutPractitioner = 0;

    patientsSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      const hasPractitioner = !!data.practitionerId;

      if (hasPractitioner) {
        withPractitioner++;
      } else {
        withoutPractitioner++;
      }

      const icon = hasPractitioner ? '✅' : '❌';
      const status = hasPractitioner ? `(Praticien: ${data.practitionerId})` : '(AUCUN PRATICIEN)';

      console.log(`${index + 1}. ${icon} ${doc.id}`);
      console.log(`   Email: ${data.email || 'N/A'}`);
      console.log(
        `   Nom: ${data.displayName || [data.firstname, data.lastname].filter(Boolean).join(' ') || 'N/A'}`
      );
      console.log(`   Status: ${status}`);
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════════════');
    console.log('  📊 RÉSUMÉ');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log(`✅ Avec praticien:   ${withPractitioner}`);
    console.log(`❌ Sans praticien:   ${withoutPractitioner}`);
    console.log('');

    if (withoutPractitioner > 0) {
      console.log('⚠️  Il y a des patients sans praticien assigné !');
      console.log('');
      console.log('💡 Pour les lier à un praticien, exécutez :');
      console.log('   node scripts/fix-patient-practitioner-link.mjs <UID_PRATICIEN>');
      console.log('');
    }
  } catch (error) {
    console.error('');
    console.error('❌ Erreur:', error);
    console.error('');
    process.exit(1);
  }
}

listPatients();
