#!/usr/bin/env node
console.error(
  'DEPRECATED: legacy patient-specific fix. Use scripts/backfill-questionnaires.mjs and root-only flow.'
);
process.exit(1);

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

// VRAIS questionnaires par défaut (depuis constants/questionnaires.ts)
const DEFAULT_QUESTIONNAIRES = [
  {
    id: 'plaintes-et-douleurs',
    title: 'Mes plaintes actuelles et troubles ressentis',
    category: 'Mode de vie',
    description: "Évaluez l'intensité de vos troubles actuels (fatigue, douleurs, digestion, etc.)",
  },
  {
    id: 'mode-de-vie',
    title: 'Questionnaire contextuel mode de vie',
    category: 'Mode de vie',
    description: 'Renseignez vos habitudes quotidiennes et votre mode de vie',
  },
  {
    id: 'nutri-assessment',
    title: 'Bilan nutrition PNNS5 × SIIN',
    category: 'Nutrition',
    description:
      'Questionnaire PNNS5 × SIIN avec radar nutritionnel et recommandations personnalisées',
  },
  {
    id: 'dnsm',
    title: 'Questionnaire Dopamine-Noradrénaline-Sérotonine-Mélatonine',
    category: 'Neuro-psychologie',
    description: 'Évaluez vos neurotransmetteurs et votre équilibre hormonal (7 questions)',
  },
];

async function fixQuestionnaires() {
  const email = 'annedogne1@gmail.com';

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  🔧 CORRECTION DES QUESTIONNAIRES');
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

  // ÉTAPE 1: Supprimer les mauvais questionnaires
  console.log('🗑️  Suppression des anciens questionnaires...');

  const oldQRoot = await db.collection('questionnaires').where('patientUid', '==', patientId).get();

  const oldQSub = await db.collection('patients').doc(patientId).collection('questionnaires').get();

  console.log('  Trouvés:', oldQRoot.size, 'dans root,', oldQSub.size, 'dans subcollection');

  const deleteBatch = db.batch();

  oldQRoot.docs.forEach((doc) => {
    console.log('  ❌ Suppression:', doc.data().title);
    deleteBatch.delete(doc.ref);
  });

  oldQSub.docs.forEach((doc) => {
    deleteBatch.delete(doc.ref);
  });

  await deleteBatch.commit();
  console.log('  ✅ Anciens questionnaires supprimés');
  console.log('');

  // ÉTAPE 2: Assigner les BONS questionnaires
  console.log('📝 Assignation des BONS questionnaires...');
  console.log('');

  const createBatch = db.batch();
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
    createBatch.set(rootRef, questionnaireData);

    // Write to subcollection (for compatibility)
    const subRef = db
      .collection('patients')
      .doc(patientId)
      .collection('questionnaires')
      .doc(questionnaireId);
    createBatch.set(subRef, questionnaireData);

    console.log('  ✓', template.title);
    console.log('    Catégorie:', template.category);
  });

  // Update patient document
  const patientRef = db.collection('patients').doc(patientId);
  createBatch.update(patientRef, {
    hasQuestionnairesAssigned: true,
    questionnairesAssignedAt: now,
    pendingQuestionnairesCount: DEFAULT_QUESTIONNAIRES.length,
  });

  await createBatch.commit();

  console.log('');
  console.log('✅ Questionnaires corrigés avec succès !');
  console.log('');
  console.log('📋 Les 4 questionnaires assignés :');
  console.log('  1. Mes plaintes actuelles et troubles ressentis');
  console.log('  2. Questionnaire contextuel mode de vie (Life Journey)');
  console.log('  3. Bilan nutrition PNNS5 × SIIN');
  console.log('  4. Questionnaire DNSM (Dopamine-Noradrénaline-Sérotonine-Mélatonine)');
  console.log('');
}

fixQuestionnaires()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Erreur:', err);
    process.exit(1);
  });
