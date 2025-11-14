#!/usr/bin/env node

/**
 * Script pour arrêter proprement les émulateurs Firebase
 * Usage: node scripts/stop-emulators.mjs
 */

import { spawn } from 'child_process';

function log(message, color = 'white') {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m',
  };
  console.log(`${colors[color] || colors.white}${message}${colors.reset}`);
}

function runCommand(command, args = []) {
  return new Promise((resolve) => {
    const process = spawn(command, args, {
      stdio: 'pipe',
      shell: true,
    });

    process.on('close', () => resolve());
    process.on('error', () => resolve());
  });
}

async function stopEmulators() {
  log('🛑 Arrêt des émulateurs Firebase...', 'yellow');

  try {
    // Arrêter les processus Firebase
    await runCommand('pkill', ['-f', 'firebase.*emulators']);
    await runCommand('pkill', ['-f', 'java.*firestore']);
    await runCommand('pkill', ['-f', 'node.*firebase-tools']);

    // Attendre un peu
    await new Promise((resolve) => setTimeout(resolve, 2000));

    log('✅ Émulateurs arrêtés avec succès', 'green');
    log('');
    log('💡 Pour redémarrer les émulateurs :', 'cyan');
    log('   firebase emulators:start --only firestore,auth', 'white');
    log('');
  } catch (error) {
    log(`❌ Erreur lors de l'arrêt: ${error.message}`, 'red');
  }
}

stopEmulators();
