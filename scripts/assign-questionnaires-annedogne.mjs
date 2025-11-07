#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
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

// Questionnaires par défaut
const DEFAULT_QUESTIONNAIRES = [
  {
    id: 'alimentation-generale',
    title: 'Questionnaire Alimentation Générale',
    category: 'nutrition',
    description: 'Évaluation de vos habitudes alimentaires',
  },
  {
    id: 'activite-physique',
    title: 'Questionnaire Activité Physique',
    category: 'lifestyle',
    description: "Évaluation de votre niveau d'activité physique",
  },
  {
    id: 'sommeil-stress',
    title: 'Questionnaire Sommeil et Stress',
    category: 'wellbeing',
    description: 'Évaluation de votre sommeil et niveau de stress',
  },
  {
    id: 'antecedents-medicaux',
    title: 'Questionnaire Antécédents Médicaux',
    category: 'medical',
    description: 'Vos antécédents médicaux et traitements',
  },
];

async function assignQuestionnaires() {
  const email = 'annedogne1@gmail.com';

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  📋 ASSIGNATION DES QUESTIONNAIRES');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  // Find patient
  const patientsSnap = await db.collection('patients').where('email', '==', email).get();

  if (patientsSnap.empty) {
    console.log('❌ Aucun patient trouvé avec cet email');
    return;
  }

  const patient = patientsSnap.docs[0];
  const patientId = patient.id;
  const patientData = patient.data();
  const practitionerId = patientData.practitionerId;

  console.log('✅ Patient trouvé:');
  console.log('  ID:', patientId);
  console.log('  Email:', patientData.email);
  console.log('  Praticien:', practitionerId || 'AUCUN');
  console.log('');

  // Check if already assigned
  const existingQ = await db
    .collection('questionnaires')
    .where('patientUid', '==', patientId)
    .get();

  if (!existingQ.empty) {
    console.log('⚠️  Ce patient a déjà', existingQ.size, 'questionnaires assignés');
    console.log('');
    return;
  }

  console.log('📝 Assignation de', DEFAULT_QUESTIONNAIRES.length, 'questionnaires...');
  console.log('');

  const batch = db.batch();
  const now = FieldValue.serverTimestamp();

  DEFAULT_QUESTIONNAIRES.forEach((template) => {
    const questionnaireData = {
      ...template,
      patientUid: patientId,
      practitionerId: practitionerId || null,
      status: 'pending',
      assignedAt: now,
      completedAt: null,
      submittedAt: null,
      responses: {},
    };

    // Generate unique ID for this patient's questionnaire
    const questionnaireId = `${patientId}_${template.id}`;

    // Write to root collection
    const rootRef = db.collection('questionnaires').doc(questionnaireId);
    batch.set(rootRef, questionnaireData);

    // Write to subcollection (for compatibility)
    const subRef = db
      .collection('patients')
      .doc(patientId)
      .collection('questionnaires')
      .doc(questionnaireId);
    batch.set(subRef, questionnaireData);

    console.log('  ✓', template.title);
  });

  // Update patient document
  const patientRef = db.collection('patients').doc(patientId);
  batch.update(patientRef, {
    hasQuestionnairesAssigned: true,
    questionnairesAssignedAt: now,
    pendingQuestionnairesCount: DEFAULT_QUESTIONNAIRES.length,
  });

  await batch.commit();

  console.log('');
  console.log('✅ Questionnaires assignés avec succès !');
  console.log('');
}

assignQuestionnaires()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Erreur:', err);
    process.exit(1);
  });
