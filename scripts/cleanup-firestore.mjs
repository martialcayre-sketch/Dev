#!/usr/bin/env node

/**
 * Script de nettoyage et réparation automatique Firestore
 *
 * Résout automatiquement :
 * - Supprime les tokens expirés non utilisés
 * - Assigne des questionnaires aux patients qui n'en ont pas
 * - Nettoie les doublons mode-de-vie/life-journey
 * - Supprime les anciennes notifications
 */

import { cert, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialiser Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '../serviceAccountKey.json'), 'utf8')
);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

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
    description:
      'Évaluez votre mode de vie selon 6 dimensions clés : physique, émotionnelle, mentale, sociale, spirituelle et environnementale',
  },
  {
    id: 'alimentaire',
    title: 'Questionnaire alimentaire',
    category: 'Alimentaire',
    description: 'Décrivez vos habitudes alimentaires et votre régime',
  },
  {
    id: 'dnsm',
    title: 'Questionnaire Dopamine-Noradrénaline-Sérotonine-Mélatonine',
    category: 'Neuro-psychologie',
    description: 'Évaluez vos neurotransmetteurs et votre équilibre hormonal',
  },
];

const stats = {
  tokensDeleted: 0,
  questionnairesAssigned: 0,
  patientsFixed: 0,
  duplicatesRemoved: 0,
  notificationsDeleted: 0,
};

async function deleteExpiredTokens() {
  console.log('\n🗑️  Suppression des tokens expirés non utilisés...');

  const now = Timestamp.now();
  const expiredTokensSnapshot = await db
    .collection('invitationTokens')
    .where('used', '==', false)
    .where('expiresAt', '<', now)
    .get();

  const batch = db.batch();
  expiredTokensSnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
    stats.tokensDeleted++;
  });

  if (stats.tokensDeleted > 0) {
    await batch.commit();
    console.log(`  ✓ ${stats.tokensDeleted} tokens expirés supprimés`);
  } else {
    console.log('  ℹ️  Aucun token expiré à supprimer');
  }
}

async function assignMissingQuestionnaires() {
  console.log('\n📋 Assignation des questionnaires manquants...');

  const patientsSnapshot = await db.collection('patients').get();

  for (const patientDoc of patientsSnapshot.docs) {
    const patientUid = patientDoc.id;
    const patientData = patientDoc.data();

    // Vérifier si le patient a des questionnaires
    const questionnairesSnapshot = await db
      .collection('patients')
      .doc(patientUid)
      .collection('questionnaires')
      .get();

    if (questionnairesSnapshot.empty) {
      console.log(`  📝 Assignation des questionnaires au patient ${patientUid}...`);

      const batch = db.batch();
      const now = FieldValue.serverTimestamp();

      DEFAULT_QUESTIONNAIRES.forEach((template) => {
        const questionnaireRef = db
          .collection('patients')
          .doc(patientUid)
          .collection('questionnaires')
          .doc(template.id);

        batch.set(questionnaireRef, {
          ...template,
          patientUid,
          practitionerId: patientData.practitionerId || null,
          status: 'pending',
          assignedAt: now,
          completedAt: null,
          responses: {},
        });
      });

      await batch.commit();

      // Mettre à jour le document patient
      await db.collection('patients').doc(patientUid).set(
        {
          hasQuestionnairesAssigned: true,
          questionnairesAssignedAt: now,
          pendingQuestionnairesCount: DEFAULT_QUESTIONNAIRES.length,
        },
        { merge: true }
      );

      stats.questionnairesAssigned += DEFAULT_QUESTIONNAIRES.length;
      stats.patientsFixed++;

      console.log(`  ✓ ${DEFAULT_QUESTIONNAIRES.length} questionnaires assignés`);
    }
  }

  if (stats.patientsFixed === 0) {
    console.log('  ℹ️  Tous les patients ont déjà des questionnaires');
  } else {
    console.log(`  ✓ ${stats.patientsFixed} patients ont reçu des questionnaires`);
  }
}

async function removeDuplicateQuestionnaires() {
  console.log('\n🔄 Suppression des doublons mode-de-vie/life-journey...');

  const patientsSnapshot = await db.collection('patients').get();

  for (const patientDoc of patientsSnapshot.docs) {
    const patientUid = patientDoc.id;

    const questionnairesSnapshot = await db
      .collection('patients')
      .doc(patientUid)
      .collection('questionnaires')
      .get();

    let hasModeDeVie = false;
    let hasLifeJourney = false;

    questionnairesSnapshot.docs.forEach((qDoc) => {
      if (qDoc.id === 'mode-de-vie') hasModeDeVie = true;
      if (qDoc.id === 'life-journey') hasLifeJourney = true;
    });

    // Si les deux existent, supprimer mode-de-vie
    if (hasModeDeVie && hasLifeJourney) {
      console.log(`  🗑️  Suppression du doublon mode-de-vie pour ${patientUid}...`);
      await db
        .collection('patients')
        .doc(patientUid)
        .collection('questionnaires')
        .doc('mode-de-vie')
        .delete();

      stats.duplicatesRemoved++;
    }
  }

  if (stats.duplicatesRemoved === 0) {
    console.log('  ℹ️  Aucun doublon détecté');
  } else {
    console.log(`  ✓ ${stats.duplicatesRemoved} doublons supprimés`);
  }
}

async function cleanOldNotifications() {
  console.log('\n🔔 Nettoyage des anciennes notifications (> 30 jours)...');

  const thirtyDaysAgo = Timestamp.fromMillis(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const patientsSnapshot = await db.collection('patients').get();

  for (const patientDoc of patientsSnapshot.docs) {
    const patientUid = patientDoc.id;

    const oldNotifications = await db
      .collection('patients')
      .doc(patientUid)
      .collection('notifications')
      .where('createdAt', '<', thirtyDaysAgo)
      .where('read', '==', true)
      .get();

    if (!oldNotifications.empty) {
      const batch = db.batch();
      oldNotifications.docs.forEach((doc) => {
        batch.delete(doc.ref);
        stats.notificationsDeleted++;
      });

      await batch.commit();
    }
  }

  if (stats.notificationsDeleted === 0) {
    console.log('  ℹ️  Aucune notification à nettoyer');
  } else {
    console.log(`  ✓ ${stats.notificationsDeleted} anciennes notifications supprimées`);
  }
}

function printSummary() {
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('  📊 RÉSUMÉ DU NETTOYAGE');
  console.log('════════════════════════════════════════════════════════════\n');
  console.log(`✅ Tokens expirés supprimés:       ${stats.tokensDeleted}`);
  console.log(`✅ Questionnaires assignés:        ${stats.questionnairesAssigned}`);
  console.log(`✅ Patients réparés:               ${stats.patientsFixed}`);
  console.log(`✅ Doublons supprimés:             ${stats.duplicatesRemoved}`);
  console.log(`✅ Notifications nettoyées:        ${stats.notificationsDeleted}`);
  console.log('\n════════════════════════════════════════════════════════════\n');

  const totalActions =
    stats.tokensDeleted +
    stats.patientsFixed +
    stats.duplicatesRemoved +
    stats.notificationsDeleted;

  if (totalActions === 0) {
    console.log('ℹ️  Base de données saine, aucune action nécessaire.');
  } else {
    console.log(`✅ ${totalActions} actions de nettoyage effectuées avec succès !`);
  }
}

async function main() {
  try {
    console.log('════════════════════════════════════════════════════════════');
    console.log('  🔧 NETTOYAGE ET RÉPARATION FIRESTORE');
    console.log('════════════════════════════════════════════════════════════');

    await deleteExpiredTokens();
    await assignMissingQuestionnaires();
    await removeDuplicateQuestionnaires();
    await cleanOldNotifications();

    printSummary();

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERREUR CRITIQUE:', error);
    process.exit(1);
  }
}

main();
