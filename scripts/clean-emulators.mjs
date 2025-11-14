#!/usr/bin/env node

/**
 * Script pour nettoyer complètement les émulateurs Firebase
 *
 * Ce script :
 * 1. Arrête les émulateurs s'ils tournent
 * 2. Supprime les données des émulateurs
 * 3. Redémarre les émulateurs avec des données vides
 *
 * Usage:
 *   node scripts/clean-emulators.mjs
 */

import { spawn } from 'child_process';
import { rm } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

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

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options,
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
}

async function stopEmulators() {
  log('🛑 Arrêt des émulateurs Firebase...', 'yellow');

  try {
    // Essayer d'arrêter proprement avec pkill
    await runCommand('pkill', ['-f', 'firebase.*emulators']);
    await runCommand('pkill', ['-f', 'java.*firestore']);

    // Attendre un peu
    await new Promise((resolve) => setTimeout(resolve, 2000));

    log('   ✅ Émulateurs arrêtés', 'green');
  } catch (error) {
    log("   ℹ️  Émulateurs déjà arrêtés ou erreur d'arrêt", 'blue');
  }
}

async function clearEmulatorData() {
  log('🧹 Suppression des données des émulateurs...', 'cyan');

  try {
    // Chemins des données des émulateurs
    const emulatorPaths = [
      join(homedir(), '.cache/firebase/emulators'),
      join(process.cwd(), 'firebase-export'),
      join(process.cwd(), '.firebase'),
      join(process.cwd(), 'firestore-debug.log'),
      join(process.cwd(), 'firebase-debug.log'),
      join(process.cwd(), 'ui-debug.log'),
    ];

    for (const path of emulatorPaths) {
      try {
        await rm(path, { recursive: true, force: true });
        log(`   ✓ Supprimé: ${path}`, 'green');
      } catch (error) {
        // Ignorer les erreurs de fichiers inexistants
        if (error.code !== 'ENOENT') {
          log(`   ⚠️  Impossible de supprimer: ${path}`, 'yellow');
        }
      }
    }

    log('   ✅ Données des émulateurs nettoyées', 'green');
  } catch (error) {
    log(`   ❌ Erreur lors du nettoyage: ${error.message}`, 'red');
  }
}

async function startEmulators() {
  log('🚀 Redémarrage des émulateurs...', 'cyan');

  try {
    // Démarrer en mode détaché
    const emulatorsProcess = spawn('firebase', ['emulators:start', '--only', 'firestore,auth'], {
      stdio: 'pipe',
      detached: true,
      shell: true,
    });

    // Laisser le processus tourner en arrière-plan
    emulatorsProcess.unref();

    // Attendre que les émulateurs se lancent
    log('   ⏳ Attente du démarrage des émulateurs...', 'yellow');
    await new Promise((resolve) => setTimeout(resolve, 10000));

    log('   ✅ Émulateurs redémarrés', 'green');
    log('   🌐 Interface UI : http://127.0.0.1:5000/', 'blue');
    log('   🔐 Auth Emulator : http://127.0.0.1:5004/', 'blue');
    log('   📊 Firestore Emulator : http://127.0.0.1:5003/', 'blue');
  } catch (error) {
    log(`   ❌ Erreur lors du démarrage: ${error.message}`, 'red');
    throw error;
  }
}

async function main() {
  try {
    log('════════════════════════════════════════════════════════════', 'cyan');
    log('  🧹 NETTOYAGE COMPLET DES ÉMULATEURS FIREBASE', 'cyan');
    log('════════════════════════════════════════════════════════════', 'cyan');
    log('');

    // 1. Arrêter les émulateurs
    await stopEmulators();
    log('');

    // 2. Nettoyer les données
    await clearEmulatorData();
    log('');

    // 3. Redémarrer les émulateurs
    await startEmulators();

    log('');
    log('════════════════════════════════════════════════════════════', 'green');
    log('  ✅ NETTOYAGE ÉMULATEURS TERMINÉ', 'green');
    log('════════════════════════════════════════════════════════════', 'green');
    log('');
    log("💡 Les émulateurs sont maintenant vides et prêts à l'usage !", 'cyan');
    log('');
    log("Variables d'environnement nécessaires :", 'yellow');
    log('  export FIRESTORE_EMULATOR_HOST=localhost:5003', 'white');
    log('  export FIREBASE_AUTH_EMULATOR_HOST=localhost:5004', 'white');
    log('  export FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199', 'white');
    log('');

    process.exit(0);
  } catch (error) {
    log('\n❌ ERREUR CRITIQUE:', 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

main();
