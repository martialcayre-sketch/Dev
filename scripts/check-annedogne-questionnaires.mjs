#!/usr/bin/env node

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

async function checkPatient() {
  const email = 'annedogne1@gmail.com';

  // Find patient
  const patientsSnap = await db.collection('patients').where('email', '==', email).get();

  if (patientsSnap.empty) {
    console.log('❌ Aucun patient trouvé avec cet email');
    return;
  }

  const patient = patientsSnap.docs[0];
  const patientId = patient.id;
  const patientData = patient.data();

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  👤 PATIENT: ' + email);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('  ID:', patientId);
  console.log('  Email:', patientData.email);
  console.log('  Nom:', patientData.displayName || 'N/A');
  console.log('  Créé le:', patientData.createdAt?.toDate() || 'N/A');
  console.log('  Status:', patientData.status || 'N/A');
  console.log('  Praticien:', patientData.practitionerId || 'AUCUN');
  console.log('');

  // Check root collection
  const qRoot = await db.collection('questionnaires').where('patientUid', '==', patientId).get();

  console.log('📋 QUESTIONNAIRES (collection root):', qRoot.size);
  if (qRoot.size > 0) {
    qRoot.docs.forEach((q) => {
      const data = q.data();
      console.log('  ✓', data.title);
      console.log('    Status:', data.status);
      console.log('    Assigné le:', data.assignedAt?.toDate() || 'N/A');
      console.log('    Praticien:', data.practitionerId || 'N/A');
    });
  } else {
    console.log('  ❌ Aucun questionnaire dans la collection root');
  }
  console.log('');

  // Check subcollection
  const qSub = await db.collection('patients').doc(patientId).collection('questionnaires').get();

  console.log('📋 QUESTIONNAIRES (sous-collection):', qSub.size);
  if (qSub.size > 0) {
    qSub.docs.forEach((q) => {
      const data = q.data();
      console.log('  ✓', data.title);
      console.log('    Status:', data.status);
      console.log('    Assigné le:', data.assignedAt?.toDate() || 'N/A');
    });
  } else {
    console.log('  ❌ Aucun questionnaire dans la sous-collection');
  }
  console.log('');
}

checkPatient()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Erreur:', err);
    process.exit(1);
  });
