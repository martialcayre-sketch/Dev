#!/usr/bin/env node

/**
 * Script d'analyse de santé de la base de données Firestore
 *
 * Vérifie :
 * - Intégrité des données patients
 * - Cohérence des questionnaires assignés
 * - Tokens d'invitation invalides/expirés
 * - Doublons mode-de-vie / life-journey
 * - Patients orphelins (sans praticien)
 * - Données manquantes ou incohérentes
 * - Collections vides ou inutilisées
 */

import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
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

// Statistiques globales
const stats = {
  patients: {
    total: 0,
    withPractitioner: 0,
    withoutPractitioner: 0,
    withQuestionnaires: 0,
    withoutQuestionnaires: 0,
    withCompletedQuestionnaires: 0,
  },
  questionnaires: {
    total: 0,
    pending: 0,
    completed: 0,
    modeDeVie: 0,
    lifeJourney: 0,
    bothModeDeVieAndLifeJourney: 0,
    alimentaire: 0,
    dnsm: 0,
    plaintesDouleurs: 0,
  },
  tokens: {
    total: 0,
    valid: 0,
    expired: 0,
    used: 0,
    unused: 0,
  },
  practitioners: {
    total: 0,
    withPatients: 0,
    withoutPatients: 0,
  },
  lifeJourney: {
    total: 0,
    patientsWithData: 0,
  },
  issues: [],
};

// Couleurs pour la console
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function addIssue(severity, category, message, data = {}) {
  stats.issues.push({
    severity, // 'critical', 'warning', 'info'
    category,
    message,
    data,
  });
}

async function analyzePatients() {
  log('\n🔍 Analyse des patients...', 'cyan');

  const patientsSnapshot = await db.collection('patients').get();
  stats.patients.total = patientsSnapshot.size;

  for (const patientDoc of patientsSnapshot.docs) {
    const patientData = patientDoc.data();
    const patientUid = patientDoc.id;

    // Vérifier practitionerId
    if (patientData.practitionerId) {
      stats.patients.withPractitioner++;

      // Vérifier que le praticien existe
      const practitionerExists = await db
        .collection('practitioners')
        .doc(patientData.practitionerId)
        .get()
        .then((doc) => doc.exists);

      if (!practitionerExists) {
        addIssue(
          'critical',
          'patients',
          `Patient ${patientUid} référence un praticien inexistant`,
          { patientUid, practitionerId: patientData.practitionerId }
        );
      }
    } else {
      stats.patients.withoutPractitioner++;
      addIssue('warning', 'patients', `Patient ${patientUid} sans practitionerId`, {
        patientUid,
      });
    }

    // Vérifier les questionnaires assignés
    const questionnairesSnapshot = await db
      .collection('patients')
      .doc(patientUid)
      .collection('questionnaires')
      .get();

    if (questionnairesSnapshot.empty) {
      stats.patients.withoutQuestionnaires++;
      addIssue('warning', 'questionnaires', `Patient ${patientUid} sans questionnaires`, {
        patientUid,
      });
    } else {
      stats.patients.withQuestionnaires++;

      let hasModeDeVie = false;
      let hasLifeJourney = false;
      let completedCount = 0;

      for (const qDoc of questionnairesSnapshot.docs) {
        const qData = qDoc.data();
        stats.questionnaires.total++;

        if (qData.status === 'pending') stats.questionnaires.pending++;
        if (qData.status === 'completed') {
          stats.questionnaires.completed++;
          completedCount++;
        }

        // Compter les types de questionnaires
        if (qDoc.id === 'mode-de-vie') {
          hasModeDeVie = true;
          stats.questionnaires.modeDeVie++;
        }
        if (qDoc.id === 'life-journey') {
          hasLifeJourney = true;
          stats.questionnaires.lifeJourney++;
        }
        if (qDoc.id === 'alimentaire') stats.questionnaires.alimentaire++;
        if (qDoc.id === 'dnsm') stats.questionnaires.dnsm++;
        if (qDoc.id === 'plaintes-et-douleurs') stats.questionnaires.plaintesDouleurs++;
      }

      if (completedCount > 0) {
        stats.patients.withCompletedQuestionnaires++;
      }

      // Vérifier les doublons mode-de-vie / life-journey
      if (hasModeDeVie && hasLifeJourney) {
        stats.questionnaires.bothModeDeVieAndLifeJourney++;
        addIssue(
          'warning',
          'questionnaires',
          `Patient ${patientUid} a à la fois mode-de-vie ET life-journey`,
          { patientUid }
        );
      }

      // Vérifier si le patient a mode-de-vie au lieu de life-journey
      if (hasModeDeVie && !hasLifeJourney) {
        addIssue(
          'info',
          'migration',
          `Patient ${patientUid} a encore mode-de-vie (migration recommandée)`,
          { patientUid }
        );
      }
    }

    // Vérifier les données Life Journey
    const lifeJourneySnapshot = await db
      .collection('patients')
      .doc(patientUid)
      .collection('lifejourney')
      .get();

    if (!lifeJourneySnapshot.empty) {
      stats.lifeJourney.patientsWithData++;
      stats.lifeJourney.total += lifeJourneySnapshot.size;
    }
  }

  log(`  ✓ ${stats.patients.total} patients analysés`, 'green');
}

async function analyzePractitioners() {
  log('\n🔍 Analyse des praticiens...', 'cyan');

  const practitionersSnapshot = await db.collection('practitioners').get();
  stats.practitioners.total = practitionersSnapshot.size;

  for (const practitionerDoc of practitionersSnapshot.docs) {
    const practitionerId = practitionerDoc.id;

    // Compter les patients du praticien
    const patientsSnapshot = await db
      .collection('patients')
      .where('practitionerId', '==', practitionerId)
      .get();

    if (patientsSnapshot.empty) {
      stats.practitioners.withoutPatients++;
      addIssue('info', 'practitioners', `Praticien ${practitionerId} sans patients`, {
        practitionerId,
      });
    } else {
      stats.practitioners.withPatients++;
    }
  }

  log(`  ✓ ${stats.practitioners.total} praticiens analysés`, 'green');
}

async function analyzeTokens() {
  log("\n🔍 Analyse des tokens d'invitation...", 'cyan');

  const tokensSnapshot = await db.collection('invitationTokens').get();
  stats.tokens.total = tokensSnapshot.size;

  const now = Timestamp.now();

  for (const tokenDoc of tokensSnapshot.docs) {
    const tokenData = tokenDoc.data();
    const tokenId = tokenDoc.id;

    // Vérifier si utilisé
    if (tokenData.used) {
      stats.tokens.used++;
    } else {
      stats.tokens.unused++;
    }

    // Vérifier si expiré
    if (tokenData.expiresAt && tokenData.expiresAt.toMillis() < now.toMillis()) {
      stats.tokens.expired++;

      if (!tokenData.used) {
        addIssue('info', 'tokens', `Token ${tokenId} expiré et non utilisé`, {
          tokenId,
          email: tokenData.email,
          expiresAt: tokenData.expiresAt.toDate(),
        });
      }
    } else {
      stats.tokens.valid++;
    }

    // Vérifier si le praticien existe
    if (tokenData.practitionerId) {
      const practitionerExists = await db
        .collection('practitioners')
        .doc(tokenData.practitionerId)
        .get()
        .then((doc) => doc.exists);

      if (!practitionerExists) {
        addIssue('warning', 'tokens', `Token ${tokenId} référence un praticien inexistant`, {
          tokenId,
          practitionerId: tokenData.practitionerId,
        });
      }
    }
  }

  log(`  ✓ ${stats.tokens.total} tokens analysés`, 'green');
}

async function checkCollections() {
  log('\n🔍 Vérification des collections...', 'cyan');

  const collections = [
    'users',
    'profiles',
    'intakes',
    'plans',
    'sessions',
    'metrics',
    'stats',
    'questionnaireSubmissions',
    'formLinks',
    'mail',
    'consultations',
  ];

  for (const collectionName of collections) {
    try {
      const snapshot = await db.collection(collectionName).limit(1).get();
      if (snapshot.empty) {
        log(`    ⚠️  Collection "${collectionName}" est vide`, 'yellow');
      } else {
        log(`    ✓ Collection "${collectionName}" contient des données`, 'green');
      }
    } catch (error) {
      log(`    ❌ Erreur lors de la lecture de "${collectionName}": ${error.message}`, 'red');
    }
  }
}

function printReport() {
  log('\n════════════════════════════════════════════════════════════', 'green');
  log("  📊 RAPPORT D'ANALYSE FIRESTORE", 'green');
  log('════════════════════════════════════════════════════════════\n', 'green');

  // Patients
  log('👥 PATIENTS:', 'cyan');
  log(`   Total:                    ${stats.patients.total}`, 'white');
  log(`   Avec praticien:           ${stats.patients.withPractitioner}`, 'green');
  log(`   Sans praticien:           ${stats.patients.withoutPractitioner}`, 'yellow');
  log(`   Avec questionnaires:      ${stats.patients.withQuestionnaires}`, 'green');
  log(`   Sans questionnaires:      ${stats.patients.withoutQuestionnaires}`, 'yellow');
  log(`   Avec questionnaires complétés: ${stats.patients.withCompletedQuestionnaires}`, 'green');

  // Questionnaires
  log('\n📋 QUESTIONNAIRES:', 'cyan');
  log(`   Total:                    ${stats.questionnaires.total}`, 'white');
  log(`   Pending:                  ${stats.questionnaires.pending}`, 'yellow');
  log(`   Completed:                ${stats.questionnaires.completed}`, 'green');
  log(`   Mode de vie:              ${stats.questionnaires.modeDeVie}`, 'yellow');
  log(`   Life Journey:             ${stats.questionnaires.lifeJourney}`, 'green');
  log(`   Doublons (mode+life):     ${stats.questionnaires.bothModeDeVieAndLifeJourney}`, 'red');
  log(`   Alimentaire:              ${stats.questionnaires.alimentaire}`, 'white');
  log(`   DNSM:                     ${stats.questionnaires.dnsm}`, 'white');
  log(`   Plaintes & Douleurs:      ${stats.questionnaires.plaintesDouleurs}`, 'white');

  // Life Journey Data
  log('\n🎯 LIFE JOURNEY DATA:', 'cyan');
  log(`   Total soumissions:        ${stats.lifeJourney.total}`, 'white');
  log(`   Patients avec données:    ${stats.lifeJourney.patientsWithData}`, 'green');

  // Practitioners
  log('\n👨‍⚕️ PRATICIENS:', 'cyan');
  log(`   Total:                    ${stats.practitioners.total}`, 'white');
  log(`   Avec patients:            ${stats.practitioners.withPatients}`, 'green');
  log(`   Sans patients:            ${stats.practitioners.withoutPatients}`, 'yellow');

  // Tokens
  log("\n🎟️  TOKENS D'INVITATION:", 'cyan');
  log(`   Total:                    ${stats.tokens.total}`, 'white');
  log(`   Valides:                  ${stats.tokens.valid}`, 'green');
  log(`   Expirés:                  ${stats.tokens.expired}`, 'yellow');
  log(`   Utilisés:                 ${stats.tokens.used}`, 'green');
  log(`   Non utilisés:             ${stats.tokens.unused}`, 'yellow');

  // Issues
  log('\n⚠️  PROBLÈMES DÉTECTÉS:', 'magenta');
  log(`   Total:                    ${stats.issues.length}\n`, 'white');

  if (stats.issues.length === 0) {
    log('   ✅ Aucun problème détecté !', 'green');
  } else {
    const critical = stats.issues.filter((i) => i.severity === 'critical');
    const warnings = stats.issues.filter((i) => i.severity === 'warning');
    const infos = stats.issues.filter((i) => i.severity === 'info');

    if (critical.length > 0) {
      log(`   ❌ Critiques:              ${critical.length}`, 'red');
      critical.forEach((issue) => {
        log(`      • ${issue.message}`, 'red');
      });
    }

    if (warnings.length > 0) {
      log(`   ⚠️  Avertissements:         ${warnings.length}`, 'yellow');
      warnings.forEach((issue) => {
        log(`      • ${issue.message}`, 'yellow');
      });
    }

    if (infos.length > 0) {
      log(`   ℹ️  Informations:           ${infos.length}`, 'cyan');
      infos.forEach((issue) => {
        log(`      • ${issue.message}`, 'cyan');
      });
    }
  }

  // Recommandations
  log('\n📝 RECOMMANDATIONS:', 'yellow');

  if (stats.questionnaires.modeDeVie > 0) {
    log(
      `   • Exécuter la migration mode-de-vie → life-journey (${stats.questionnaires.modeDeVie} questionnaires)`,
      'yellow'
    );
    log('     Commande: .\\scripts\\migrate-mode-de-vie-to-life-journey.ps1', 'cyan');
  }

  if (stats.questionnaires.bothModeDeVieAndLifeJourney > 0) {
    log(
      `   • Supprimer les doublons mode-de-vie (${stats.questionnaires.bothModeDeVieAndLifeJourney} patients concernés)`,
      'yellow'
    );
  }

  if (stats.tokens.expired > 0 && stats.tokens.unused > 0) {
    log(`   • Nettoyer les tokens expirés non utilisés (${stats.tokens.expired} tokens)`, 'yellow');
  }

  if (stats.patients.withoutPractitioner > 0) {
    log(
      `   • Assigner un praticien aux patients orphelins (${stats.patients.withoutPractitioner} patients)`,
      'yellow'
    );
  }

  if (stats.patients.withoutQuestionnaires > 0) {
    log(
      `   • Assigner des questionnaires aux patients (${stats.patients.withoutQuestionnaires} patients)`,
      'yellow'
    );
  }

  log('\n════════════════════════════════════════════════════════════\n', 'green');
}

async function main() {
  try {
    log('════════════════════════════════════════════════════════════', 'cyan');
    log('  🔍 ANALYSE DE SANTÉ FIRESTORE', 'cyan');
    log('════════════════════════════════════════════════════════════', 'cyan');

    await analyzePatients();
    await analyzePractitioners();
    await analyzeTokens();
    await checkCollections();

    printReport();

    process.exit(0);
  } catch (error) {
    log('\n❌ ERREUR CRITIQUE:', 'red');
    console.error(error);
    process.exit(1);
  }
}

main();
