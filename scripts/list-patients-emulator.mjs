#!/usr/bin/env node

/**
 * Script pour lister les patients (compatible émulateur)
 */

import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function log(message, color = 'white') {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m',
  };
  console.log(`${colors[color] || colors.white}${message}${colors.reset}`);
}

// Détection de l'environnement
const isEmulator = !!(
  process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST
);

log('════════════════════════════════════════════════════════════', 'cyan');
log("  🔍 VÉRIFICATION DE L'ENVIRONNEMENT", 'cyan');
log('════════════════════════════════════════════════════════════', 'cyan');
log('');

if (isEmulator) {
  log('🧪 MODE ÉMULATEUR DÉTECTÉ', 'yellow');
  log(`   • Firestore: ${process.env.FIRESTORE_EMULATOR_HOST || 'Non configuré'}`, 'white');
  log(`   • Auth: ${process.env.FIREBASE_AUTH_EMULATOR_HOST || 'Non configuré'}`, 'white');
  log(`   • Storage: ${process.env.FIREBASE_STORAGE_EMULATOR_HOST || 'Non configuré'}`, 'white');
} else {
  log('🌐 MODE PRODUCTION DÉTECTÉ', 'red');
  log('   ⚠️  ATTENTION : Opérations sur données réelles !', 'red');
}

log('');

// Initialiser Firebase Admin
let credential;
const serviceAccountPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS || join(__dirname, '../serviceAccountKey.json');

try {
  if (serviceAccountPath) {
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    credential = cert(serviceAccount);
    log(`✅ Credentials chargés: ${serviceAccountPath}`, 'green');
  }
} catch (error) {
  log('⚠️  Utilisation des credentials par défaut (ADC)', 'yellow');
}

try {
  initializeApp({
    credential: credential,
  });
} catch (error) {
  log(`❌ Erreur d'initialisation Firebase: ${error.message}`, 'red');
  process.exit(1);
}

const db = getFirestore();
const auth = getAuth();

async function listPatients() {
  log('════════════════════════════════════════════════════════════', 'cyan');
  log('  🏥 LISTE DES PATIENTS', 'cyan');
  log('════════════════════════════════════════════════════════════', 'cyan');
  log('');

  try {
    // 1. Lister les patients Firestore
    const patientsSnapshot = await db.collection('patients').get();
    log(`📊 Patients Firestore: ${patientsSnapshot.size}`, 'blue');

    if (!patientsSnapshot.empty) {
      log('');
      patientsSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        log(`${index + 1}. 👤 ${doc.id}`, 'white');
        log(`   Email: ${data.email || 'N/A'}`, 'white');
        log(
          `   Nom: ${
            data.displayName || [data.firstname, data.lastname].filter(Boolean).join(' ') || 'N/A'
          }`,
          'white'
        );
        log(`   Praticien: ${data.practitionerId || 'N/A'}`, 'white');
        log('');
      });
    }

    // 2. Lister les questionnaires root
    const questionnairesSnapshot = await db.collection('questionnaires').get();
    log(`📋 Questionnaires root: ${questionnairesSnapshot.size}`, 'blue');

    if (!questionnairesSnapshot.empty) {
      log('');
      const questionnairesByPatient = {};
      questionnairesSnapshot.docs.forEach((doc) => {
        const patientUid = doc.id.split('_')[1];
        if (!questionnairesByPatient[patientUid]) {
          questionnairesByPatient[patientUid] = [];
        }
        questionnairesByPatient[patientUid].push(doc.id);
      });

      Object.entries(questionnairesByPatient).forEach(([patientUid, questionnaires]) => {
        log(`   Patient ${patientUid}: ${questionnaires.length} questionnaire(s)`, 'yellow');
      });
      log('');
    }

    // 3. Lister les tokens d'invitation
    const tokensSnapshot = await db.collection('invitationTokens').get();
    log(`🎫 Tokens d'invitation: ${tokensSnapshot.size}`, 'blue');

    if (!tokensSnapshot.empty) {
      log('');
      tokensSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        log(`${index + 1}. 🎫 ${doc.id}`, 'white');
        log(`   Email: ${data.email || 'N/A'}`, 'white');
        log(
          `   Expiré: ${data.expiresAt && data.expiresAt.toDate() < new Date() ? 'Oui' : 'Non'}`,
          'white'
        );
        log('');
      });
    }

    // 4. Lister les utilisateurs Auth (émulateur uniquement)
    if (isEmulator) {
      try {
        const listUsersResult = await auth.listUsers(1000);
        log(`🔐 Utilisateurs Auth: ${listUsersResult.users.length}`, 'blue');

        if (listUsersResult.users.length > 0) {
          log('');
          listUsersResult.users.forEach((userRecord, index) => {
            log(`${index + 1}. 🔐 ${userRecord.uid}`, 'white');
            log(`   Email: ${userRecord.email || 'N/A'}`, 'white');
            log(
              `   Provider: ${
                userRecord.providerData.map((p) => p.providerId).join(', ') || 'N/A'
              }`,
              'white'
            );
            log('');
          });
        }
      } catch (authError) {
        log(`⚠️  Impossible de lister les utilisateurs Auth: ${authError.message}`, 'yellow');
      }
    }

    // Résumé
    log('════════════════════════════════════════════════════════════', 'cyan');
    log('  📊 RÉSUMÉ', 'cyan');
    log('════════════════════════════════════════════════════════════', 'cyan');
    log('');
    log(`📊 Patients Firestore:        ${patientsSnapshot.size}`, 'white');
    log(`📋 Questionnaires root:       ${questionnairesSnapshot.size}`, 'white');
    log(`🎫 Tokens d'invitation:       ${tokensSnapshot.size}`, 'white');

    if (isEmulator) {
      try {
        const listUsersResult = await auth.listUsers(1000);
        log(`🔐 Utilisateurs Auth:         ${listUsersResult.users.length}`, 'white');
      } catch {
        log(`🔐 Utilisateurs Auth:         Erreur`, 'white');
      }
    }

    log('');

    if (patientsSnapshot.size > 0 || questionnairesSnapshot.size > 0 || tokensSnapshot.size > 0) {
      log('💡 Pour supprimer toutes les données patients :', 'cyan');
      log('   node scripts/purge-all-patients.mjs --confirm-delete-all', 'green');
      log('');
    } else {
      log('✨ Aucune donnée patient trouvée !', 'green');
      log('');
    }
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
    process.exit(1);
  }
}

listPatients();
