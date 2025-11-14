#!/usr/bin/env node

/**
 * Script pour supprimer TOUS les patients dans les ÉMULATEURS Firebase
 *
 * Ce script supprime :
 * 1. Tous les comptes Firebase Auth émulateur
 * 2. Tous les documents patients dans l'émulateur Firestore
 * 3. Tous les questionnaires dans la collection root 'questionnaires'
 * 4. Toutes les sous-collections liées aux patients
 * 5. Tous les tokens d'invitation patients
 *
 * ⚠️  ATTENTION: Fonctionne uniquement avec les émulateurs !
 *
 * Usage:
 *   node scripts/purge-emulator-patients.mjs --confirm-delete-all
 */

import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Fonction pour les logs colorés
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

// Vérification que nous sommes en mode émulateur
if (!isEmulator) {
  log('════════════════════════════════════════════════════════════', 'red');
  log('  ❌ ERREUR : MODE ÉMULATEUR REQUIS', 'red');
  log('════════════════════════════════════════════════════════════', 'red');
  log('');
  log("Ce script ne fonctionne qu'avec les émulateurs Firebase !", 'yellow');
  log('');
  log('Pour activer les émulateurs, utilisez :', 'cyan');
  log('  export FIRESTORE_EMULATOR_HOST=localhost:5003', 'white');
  log('  export FIREBASE_AUTH_EMULATOR_HOST=localhost:5004', 'white');
  log('  export FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199', 'white');
  log('');
  log('Puis démarrez les émulateurs :', 'cyan');
  log('  firebase emulators:start --only firestore,auth', 'white');
  log('');
  process.exit(1);
}

// Initialiser Firebase Admin pour émulateurs
let credential;
const serviceAccountPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS || join(__dirname, '../serviceAccountKey.json');

try {
  if (serviceAccountPath) {
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    credential = cert(serviceAccount);
  }
} catch (error) {
  log('⚠️  Utilisation des credentials par défaut pour émulateurs', 'yellow');
}

initializeApp({
  credential: credential,
});

const db = getFirestore();
const auth = getAuth();

// Statistiques de suppression
const stats = {
  authUsersDeleted: 0,
  patientsDeleted: 0,
  questionnairesDeleted: 0,
  notificationsDeleted: 0,
  invitationTokensDeleted: 0,
  subcollectionsDeleted: 0,
  errors: 0,
};

/**
 * Supprimer une sous-collection complètement
 */
async function deleteSubcollection(docRef, subcollectionName) {
  const subcollectionRef = docRef.collection(subcollectionName);
  const snapshot = await subcollectionRef.get();

  if (snapshot.empty) return 0;

  let deleted = 0;
  for (const doc of snapshot.docs) {
    try {
      await doc.ref.delete();
      deleted++;
    } catch (error) {
      log(`   ❌ Erreur suppression ${subcollectionName}/${doc.id}: ${error.message}`, 'red');
      stats.errors++;
    }
  }

  return deleted;
}

/**
 * Supprimer tous les questionnaires de la collection root
 */
async function deleteAllRootQuestionnaires() {
  log('📋 Suppression des questionnaires collection root...', 'cyan');

  try {
    const questionnairesSnapshot = await db.collection('questionnaires').get();

    if (questionnairesSnapshot.empty) {
      log('   ℹ️  Aucun questionnaire root trouvé', 'blue');
      return;
    }

    log(`   → ${questionnairesSnapshot.size} questionnaire(s) root trouvé(s)`);

    for (const doc of questionnairesSnapshot.docs) {
      try {
        await doc.ref.delete();
        stats.questionnairesDeleted++;
        log(`   ✓ Supprimé: ${doc.id}`, 'green');
      } catch (error) {
        log(`   ❌ Erreur suppression questionnaire ${doc.id}: ${error.message}`, 'red');
        stats.errors++;
      }
    }

    log(`   ✅ ${stats.questionnairesDeleted} questionnaire(s) root supprimé(s)`, 'green');
  } catch (error) {
    log(`   ❌ Erreur lors de la suppression des questionnaires root: ${error.message}`, 'red');
    stats.errors++;
  }
}

/**
 * Supprimer tous les tokens d'invitation patients
 */
async function deletePatientInvitationTokens() {
  log("🎫 Suppression des tokens d'invitation patients...", 'cyan');

  try {
    const tokensSnapshot = await db.collection('invitationTokens').get();

    if (tokensSnapshot.empty) {
      log("   ℹ️  Aucun token d'invitation trouvé", 'blue');
      return;
    }

    for (const doc of tokensSnapshot.docs) {
      try {
        const tokenData = doc.data();
        await doc.ref.delete();
        stats.invitationTokensDeleted++;
        log(`   ✓ Token supprimé: ${doc.id} (${tokenData.email || 'email inconnu'})`, 'green');
      } catch (error) {
        log(`   ❌ Erreur suppression token ${doc.id}: ${error.message}`, 'red');
        stats.errors++;
      }
    }

    log(`   ✅ ${stats.invitationTokensDeleted} token(s) d'invitation supprimé(s)`, 'green');
  } catch (error) {
    log(`   ❌ Erreur lors de la suppression des tokens: ${error.message}`, 'red');
    stats.errors++;
  }
}

/**
 * Supprimer un patient complet (document + sous-collections)
 */
async function deletePatientData(patientDoc) {
  const patientId = patientDoc.id;
  const patientData = patientDoc.data();

  log(`   🧑‍⚕️ Suppression patient: ${patientId} (${patientData.email || 'email inconnu'})`);

  try {
    // 1. Supprimer les sous-collections
    const subcollections = ['questionnaires', 'notifications', 'consultation'];

    for (const subcollectionName of subcollections) {
      const deleted = await deleteSubcollection(patientDoc.ref, subcollectionName);
      if (deleted > 0) {
        log(`      ↳ ${deleted} document(s) supprimé(s) dans ${subcollectionName}`, 'yellow');
        stats.subcollectionsDeleted += deleted;

        if (subcollectionName === 'notifications') {
          stats.notificationsDeleted += deleted;
        }
      }
    }

    // 2. Supprimer le document patient
    await patientDoc.ref.delete();
    stats.patientsDeleted++;
    log(`      ✓ Document patient supprimé`, 'green');
  } catch (error) {
    log(`   ❌ Erreur suppression patient ${patientId}: ${error.message}`, 'red');
    stats.errors++;
  }
}

/**
 * Supprimer tous les patients Firestore
 */
async function deleteAllPatients() {
  log('🧑‍⚕️ Suppression de tous les patients Firestore...', 'cyan');

  try {
    const patientsSnapshot = await db.collection('patients').get();

    if (patientsSnapshot.empty) {
      log('   ℹ️  Aucun patient trouvé dans Firestore', 'blue');
      return;
    }

    log(`   → ${patientsSnapshot.size} patient(s) trouvé(s) dans Firestore`);

    for (const patientDoc of patientsSnapshot.docs) {
      await deletePatientData(patientDoc);
    }

    log(`   ✅ ${stats.patientsDeleted} patient(s) Firestore supprimé(s)`, 'green');
  } catch (error) {
    log(`   ❌ Erreur lors de la suppression des patients Firestore: ${error.message}`, 'red');
    stats.errors++;
  }
}

/**
 * Supprimer tous les utilisateurs Firebase Auth
 */
async function deleteAllAuthUsers() {
  log('🔐 Suppression des comptes Firebase Auth émulateur...', 'cyan');

  try {
    const listUsersResult = await auth.listUsers(1000);

    if (listUsersResult.users.length === 0) {
      log('   ℹ️  Aucun utilisateur Auth trouvé', 'blue');
      return;
    }

    log(`   → ${listUsersResult.users.length} utilisateur(s) Auth trouvé(s)`);

    for (const userRecord of listUsersResult.users) {
      try {
        // Supprimer l'utilisateur Firebase Auth
        await auth.deleteUser(userRecord.uid);
        stats.authUsersDeleted++;
        log(
          `   ✓ Auth supprimé: ${userRecord.uid} (${userRecord.email || 'email inconnu'})`,
          'green'
        );

        // Supprimer le document user s'il existe
        try {
          const userDocRef = db.collection('users').doc(userRecord.uid);
          const userDocSnapshot = await userDocRef.get();
          if (userDocSnapshot.exists) {
            await userDocRef.delete();
            log(`      ↳ Document user supprimé`, 'yellow');
          }
        } catch (error) {
          // Ignorer les erreurs de documents inexistants
        }
      } catch (error) {
        log(`   ❌ Erreur suppression auth ${userRecord.uid}: ${error.message}`, 'red');
        stats.errors++;
      }
    }

    log(`   ✅ ${stats.authUsersDeleted} compte(s) Auth supprimé(s)`, 'green');
  } catch (error) {
    log(`   ❌ Erreur lors de la suppression des comptes Auth: ${error.message}`, 'red');
    stats.errors++;
  }
}

/**
 * Afficher le résumé final
 */
function printSummary() {
  log('\n════════════════════════════════════════════════════════════', 'cyan');
  log('  📊 RÉSUMÉ DE LA SUPPRESSION (ÉMULATEURS)', 'cyan');
  log('════════════════════════════════════════════════════════════', 'cyan');

  log(`\n✅ Comptes Firebase Auth supprimés:      ${stats.authUsersDeleted}`, 'green');
  log(`✅ Documents patients supprimés:         ${stats.patientsDeleted}`, 'green');
  log(`✅ Questionnaires root supprimés:        ${stats.questionnairesDeleted}`, 'green');
  log(`✅ Notifications supprimées:             ${stats.notificationsDeleted}`, 'green');
  log(`✅ Tokens d'invitation supprimés:        ${stats.invitationTokensDeleted}`, 'green');
  log(`✅ Total sous-collections supprimées:    ${stats.subcollectionsDeleted}`, 'green');

  if (stats.errors > 0) {
    log(`\n❌ Erreurs rencontrées:                  ${stats.errors}`, 'red');
  }

  const totalOperations =
    stats.authUsersDeleted +
    stats.patientsDeleted +
    stats.questionnairesDeleted +
    stats.notificationsDeleted +
    stats.invitationTokensDeleted +
    stats.subcollectionsDeleted;

  log(`\n🎯 Total d'opérations réalisées:         ${totalOperations}`, 'cyan');

  if (totalOperations === 0) {
    log('\nℹ️  Émulateurs déjà vides, aucune action nécessaire.', 'blue');
  } else {
    log('\n🧹 Nettoyage émulateurs terminé ! Émulateurs vides.', 'green');
    log('\n💡 Vous pouvez maintenant tester avec de nouveaux patients.', 'blue');
  }
}

/**
 * Fonction principale
 */
async function main() {
  // Vérifier la confirmation
  const confirmArg = process.argv.find((arg) => arg === '--confirm-delete-all');

  if (!confirmArg) {
    log('════════════════════════════════════════════════════════════', 'yellow');
    log('  ⚠️  SUPPRESSION ÉMULATEURS PATIENTS', 'yellow');
    log('════════════════════════════════════════════════════════════', 'yellow');
    log('');
    log('Ce script va supprimer dans les ÉMULATEURS :', 'cyan');
    log('  • Tous les comptes Firebase Auth émulateur', 'white');
    log('  • Tous les documents patients dans Firestore émulateur', 'white');
    log('  • Tous les questionnaires', 'white');
    log('  • Toutes les notifications patients', 'white');
    log("  • Tous les tokens d'invitation", 'white');
    log('  • Toutes les sous-collections liées', 'white');
    log('');
    log('✅ SÉCURISÉ : Fonctionne uniquement avec les émulateurs !', 'green');
    log('');
    log('Pour confirmer, ajoutez le paramètre :', 'yellow');
    log('  --confirm-delete-all', 'cyan');
    log('');
    log('Exemple :', 'white');
    log('  node scripts/purge-emulator-patients.mjs --confirm-delete-all', 'green');
    log('');
    process.exit(1);
  }

  try {
    log('════════════════════════════════════════════════════════════', 'cyan');
    log('  🧹 SUPPRESSION ÉMULATEURS PATIENTS', 'cyan');
    log('════════════════════════════════════════════════════════════', 'cyan');
    log('');

    // Afficher l'environnement
    log('🧪 MODE ÉMULATEUR CONFIRMÉ', 'yellow');
    log(`   • Firestore: ${process.env.FIRESTORE_EMULATOR_HOST}`, 'white');
    log(`   • Auth: ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`, 'white');
    log(`   • Storage: ${process.env.FIREBASE_STORAGE_EMULATOR_HOST || 'Non configuré'}`, 'white');
    log('');

    // 1. Supprimer tous les questionnaires de la collection root
    await deleteAllRootQuestionnaires();
    log('');

    // 2. Supprimer tous les patients Firestore (avec leurs sous-collections)
    await deleteAllPatients();
    log('');

    // 3. Supprimer tous les tokens d'invitation
    await deletePatientInvitationTokens();
    log('');

    // 4. Supprimer tous les comptes Firebase Auth
    await deleteAllAuthUsers();

    // 5. Afficher le résumé
    printSummary();

    process.exit(0);
  } catch (error) {
    log('\n❌ ERREUR CRITIQUE:', 'red');
    log(error.message, 'red');
    log('', 'white');
    process.exit(1);
  }
}

main();
