#!/usr/bin/env node
/**
 * Script pour assigner manuellement les questionnaires par défaut à un patient
 * Utilise Firebase CLI (pas besoin de serviceAccountKey)
 * Usage: node scripts/assign-questionnaires-firebase-cli.mjs <patientEmail>
 */

import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

// Initialiser Firebase Admin avec les credentials par défaut
initializeApp();
const db = getFirestore();

// Questionnaires par défaut
const DEFAULT_QUESTIONNAIRES = [
  {
    id: 'plaintes-et-douleurs',
    title: 'Mes plaintes actuelles et troubles ressentis',
    category: 'Mode de vie',
    description: "Évaluez l'intensité de vos troubles actuels (fatigue, douleurs, digestion, etc.)",
  },
  {
    id: 'life-journey',
    title: 'Mode de vie – 7 Sphères Vitales',
    category: 'Mode de vie SIIN',
    description: 'Questionnaire contextuel de mode de vie (SIIN) avec radar de scoring par sphère',
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

async function assignQuestionnairesToPatient(patientEmail) {
  try {
    console.log(`\n🔍 Recherche du patient: ${patientEmail}`);

    // Trouver le patient par email
    const patientsSnap = await db
      .collection('patients')
      .where('email', '==', patientEmail)
      .limit(1)
      .get();

    if (patientsSnap.empty) {
      console.error(`❌ Aucun patient trouvé avec l'email: ${patientEmail}`);
      process.exit(1);
    }

    const patientDoc = patientsSnap.docs[0];
    const patientId = patientDoc.id;
    const patientData = patientDoc.data();

    console.log(`✅ Patient trouvé: ${patientId}`);
    console.log(`   Nom: ${patientData.displayName || patientData.firstname || 'N/A'}`);
    console.log(`   Praticien: ${patientData.practitionerId || 'N/A'}`);

    // Vérifier les questionnaires existants
    const existingQuestionnaires = await db
      .collection('questionnaires')
      .where('patientUid', '==', patientId)
      .get();

    console.log(`\n📋 Questionnaires existants: ${existingQuestionnaires.size}`);

    if (existingQuestionnaires.size > 0) {
      console.log('\n⚠️  Le patient a déjà des questionnaires assignés:');
      existingQuestionnaires.forEach((doc) => {
        const data = doc.data();
        console.log(`   - ${data.title} (${data.status})`);
      });
    }

    console.log(`\n📝 Assignation de ${DEFAULT_QUESTIONNAIRES.length} questionnaires...`);

    const batch = db.batch();
    const timestamp = FieldValue.serverTimestamp();
    let assignedCount = 0;

    for (const template of DEFAULT_QUESTIONNAIRES) {
      // Générer un ID unique pour chaque questionnaire
      const uniqueId = `${template.id}_${patientId}`;

      // Vérifier si déjà assigné
      const existingDoc = await db.collection('questionnaires').doc(uniqueId).get();
      if (existingDoc.exists) {
        console.log(`   ⏭️  ${template.title} (déjà assigné)`);
        continue;
      }

      const questionnaireData = {
        ...template,
        patientUid: patientId,
        practitionerId: patientData.practitionerId || null,
        status: 'pending',
        assignedAt: timestamp,
        completedAt: null,
        responses: {},
      };

      // Double-write: root collection ET sous-collection
      // 1. Collection root (pour l'API Backend-First)
      const rootRef = db.collection('questionnaires').doc(uniqueId);
      batch.set(rootRef, questionnaireData);

      // 2. Sous-collection (pour compatibilité)
      const subRef = db
        .collection('patients')
        .doc(patientId)
        .collection('questionnaires')
        .doc(template.id);
      batch.set(subRef, questionnaireData);

      console.log(`   ✅ ${template.title}`);
      assignedCount++;
    }

    if (assignedCount > 0) {
      await batch.commit();
      console.log(`\n🎉 ${assignedCount} questionnaire(s) assigné(s) avec succès !`);

      // Mettre à jour le document patient
      await db
        .collection('patients')
        .doc(patientId)
        .update({
          hasQuestionnairesAssigned: true,
          questionnairesAssignedAt: timestamp,
          pendingQuestionnairesCount: FieldValue.increment(assignedCount),
        });

      console.log(`✅ Document patient mis à jour`);
    } else {
      console.log(`\nℹ️  Aucun nouveau questionnaire à assigner`);
    }

    console.log(`\n✨ Terminé !`);
  } catch (error) {
    console.error('\n❌ Erreur:', error);
    process.exit(1);
  }
}

// Main
const patientEmail = process.argv[2];

if (!patientEmail) {
  console.error('❌ Usage: node scripts/assign-questionnaires-firebase-cli.mjs <patientEmail>');
  console.error(
    '   Exemple: node scripts/assign-questionnaires-firebase-cli.mjs martialcayre@live.fr'
  );
  process.exit(1);
}

assignQuestionnairesToPatient(patientEmail)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
