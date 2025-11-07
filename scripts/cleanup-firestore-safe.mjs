#!/usr/bin/env node

/**
 * Script de nettoyage et réparation automatique Firestore
 * AVEC EXCLUSION pour annedogne1@gmail.com
 *
 * Résout automatiquement :
 * - Supprime les tokens expirés non utilisés (SAUF annedogne1@gmail.com)
 * - Assigne des questionnaires aux patients qui n'en ont pas (SAUF annedogne1@gmail.com)
 * - Nettoie les doublons mode-de-vie/life-journey (SAUF annedogne1@gmail.com)
 * - Supprime les anciennes notifications (SAUF annedogne1@gmail.com)
 */

import { cert, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Email à exclure de toutes les opérations
const EXCLUDED_EMAIL = 'annedogne1@gmail.com';

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
  tokensSkipped: 0,
  questionnairesAssigned: 0,
  patientsFixed: 0,
  patientsSkipped: 0,
  duplicatesRemoved: 0,
  notificationsDeleted: 0,
};

function log(message, color = 'white') {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m',
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function deleteExpiredTokens() {
  log('\n🗑️  Suppression des tokens expirés non utilisés...', 'cyan');
  log(`   ⚠️  EXCLUSION: ${EXCLUDED_EMAIL}`, 'yellow');

  const now = Timestamp.now();
  const expiredTokensSnapshot = await db
    .collection('invitationTokens')
    .where('used', '==', false)
    .where('expiresAt', '<', now)
    .get();

  const batch = db.batch();

  for (const doc of expiredTokensSnapshot.docs) {
    const tokenData = doc.data();
    const tokenEmail = tokenData.email ? tokenData.email.toLowerCase() : '';

    if (tokenEmail === EXCLUDED_EMAIL.toLowerCase()) {
      log(`   ⏭️  Token skippé: ${doc.id} (${tokenEmail})`, 'yellow');
      stats.tokensSkipped++;
      continue;
    }

    batch.delete(doc.ref);
    stats.tokensDeleted++;
  }

  if (stats.tokensDeleted > 0) {
    await batch.commit();
    log(`  ✓ ${stats.tokensDeleted} tokens expirés supprimés`, 'green');
  } else {
    log('  ℹ️  Aucun token expiré à supprimer', 'white');
  }

  if (stats.tokensSkipped > 0) {
    log(`  ⚠️  ${stats.tokensSkipped} tokens exclus (${EXCLUDED_EMAIL})`, 'yellow');
  }
}

async function assignMissingQuestionnaires() {
  log('\n📋 Assignation des questionnaires manquants...', 'cyan');
  log(`   ⚠️  EXCLUSION: ${EXCLUDED_EMAIL}`, 'yellow');

  const patientsSnapshot = await db.collection('patients').get();

  for (const patientDoc of patientsSnapshot.docs) {
    const patientUid = patientDoc.id;
    const patientData = patientDoc.data();
    const patientEmail = patientData.email ? patientData.email.toLowerCase() : '';

    // Vérifier exclusion
    if (patientEmail === EXCLUDED_EMAIL.toLowerCase()) {
      log(`   ⏭️  Patient skippé: ${patientUid} (${patientEmail})`, 'yellow');
      stats.patientsSkipped++;
      continue;
    }

    // Vérifier si le patient a des questionnaires
    const questionnairesSnapshot = await db
      .collection('patients')
      .doc(patientUid)
      .collection('questionnaires')
      .get();

    if (questionnairesSnapshot.empty) {
      log(
        `  📝 Assignation des questionnaires au patient ${patientUid} (${patientEmail})...`,
        'white'
      );

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

      log(`  ✓ ${DEFAULT_QUESTIONNAIRES.length} questionnaires assignés`, 'green');
    }
  }

  if (stats.patientsFixed === 0) {
    log('  ℹ️  Tous les patients ont déjà des questionnaires', 'white');
  } else {
    log(`  ✓ ${stats.patientsFixed} patients ont reçu des questionnaires`, 'green');
  }

  if (stats.patientsSkipped > 0) {
    log(`  ⚠️  ${stats.patientsSkipped} patients exclus (${EXCLUDED_EMAIL})`, 'yellow');
  }
}

async function removeDuplicateQuestionnaires() {
  log('\n🔄 Suppression des doublons mode-de-vie/life-journey...', 'cyan');
  log(`   ⚠️  EXCLUSION: ${EXCLUDED_EMAIL}`, 'yellow');

  const patientsSnapshot = await db.collection('patients').get();

  for (const patientDoc of patientsSnapshot.docs) {
    const patientUid = patientDoc.id;
    const patientData = patientDoc.data();
    const patientEmail = patientData.email ? patientData.email.toLowerCase() : '';

    // Vérifier exclusion
    if (patientEmail === EXCLUDED_EMAIL.toLowerCase()) {
      log(`   ⏭️  Patient skippé: ${patientUid} (${patientEmail})`, 'yellow');
      continue;
    }

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
      log(
        `  🗑️  Suppression du doublon mode-de-vie pour ${patientUid} (${patientEmail})...`,
        'white'
      );
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
    log('  ℹ️  Aucun doublon détecté', 'white');
  } else {
    log(`  ✓ ${stats.duplicatesRemoved} doublons supprimés`, 'green');
  }
}

async function cleanOldNotifications() {
  log('\n🔔 Nettoyage des anciennes notifications (> 30 jours)...', 'cyan');
  log(`   ⚠️  EXCLUSION: ${EXCLUDED_EMAIL}`, 'yellow');

  const thirtyDaysAgo = Timestamp.fromMillis(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const patientsSnapshot = await db.collection('patients').get();

  for (const patientDoc of patientsSnapshot.docs) {
    const patientUid = patientDoc.id;
    const patientData = patientDoc.data();
    const patientEmail = patientData.email ? patientData.email.toLowerCase() : '';

    // Vérifier exclusion
    if (patientEmail === EXCLUDED_EMAIL.toLowerCase()) {
      continue;
    }

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
    log('  ℹ️  Aucune notification à nettoyer', 'white');
  } else {
    log(`  ✓ ${stats.notificationsDeleted} anciennes notifications supprimées`, 'green');
  }
}

function printSummary() {
  log('\n════════════════════════════════════════════════════════════', 'green');
  log('  📊 RÉSUMÉ DU NETTOYAGE', 'green');
  log('════════════════════════════════════════════════════════════\n', 'green');

  log(`⚠️  EMAIL EXCLU: ${EXCLUDED_EMAIL}`, 'yellow');
  log('', 'white');

  log(`✅ Tokens expirés supprimés:       ${stats.tokensDeleted}`, 'green');
  log(`⏭️  Tokens exclus:                 ${stats.tokensSkipped}`, 'yellow');
  log(`✅ Questionnaires assignés:        ${stats.questionnairesAssigned}`, 'green');
  log(`✅ Patients réparés:               ${stats.patientsFixed}`, 'green');
  log(`⏭️  Patients exclus:               ${stats.patientsSkipped}`, 'yellow');
  log(`✅ Doublons supprimés:             ${stats.duplicatesRemoved}`, 'green');
  log(`✅ Notifications nettoyées:        ${stats.notificationsDeleted}`, 'green');
  log('\n════════════════════════════════════════════════════════════\n', 'green');

  const totalActions =
    stats.tokensDeleted +
    stats.patientsFixed +
    stats.duplicatesRemoved +
    stats.notificationsDeleted;

  if (totalActions === 0) {
    log('ℹ️  Base de données saine, aucune action nécessaire.', 'white');
  } else {
    log(`✅ ${totalActions} actions de nettoyage effectuées avec succès !`, 'green');
    log(
      `⏭️  ${stats.tokensSkipped + stats.patientsSkipped} éléments exclus (${EXCLUDED_EMAIL})`,
      'yellow'
    );
  }
}

async function main() {
  try {
    log('════════════════════════════════════════════════════════════', 'cyan');
    log('  🔧 NETTOYAGE ET RÉPARATION FIRESTORE', 'cyan');
    log(`  ⚠️  AVEC EXCLUSION: ${EXCLUDED_EMAIL}`, 'yellow');
    log('════════════════════════════════════════════════════════════', 'cyan');

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
