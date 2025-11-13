#!/usr/bin/env node

/**
 * Script de mise à jour automatique des fichiers de contexte IA
 *
 * Ce script analyse le projet et met à jour automatiquement les informations
 * suivantes dans les fichiers de contexte pour les assistants IA :
 * - Version des packages principaux (Node, pnpm, firebase-admin, etc.)
 * - Date de dernière mise à jour
 * - État de l'architecture (root-only, Cloud Functions Gen2)
 * - Statistiques du projet (nombre de packages, scripts, etc.)
 *
 * Usage: node scripts/update-ai-docs.mjs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Configuration des fichiers à mettre à jour
const AI_DOCS = [
  'docs/CHATGPT_INSTRUCTIONS.md',
  'docs/COPILOT_CONTEXT.md',
  'PROJECT_CONTEXT.md',
  '.cursorrules',
  '.github/copilot-context.md',
];

/**
 * Obtenir la date actuelle au format "DD Mois YYYY"
 */
function getCurrentDate() {
  const months = [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ];
  const now = new Date();
  const day = now.getDate();
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Lire le package.json racine
 */
async function readPackageJson() {
  const pkgPath = path.join(PROJECT_ROOT, 'package.json');
  const content = await fs.readFile(pkgPath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Lire le package.json des functions
 */
async function readFunctionsPackageJson() {
  const pkgPath = path.join(PROJECT_ROOT, 'functions', 'package.json');
  const content = await fs.readFile(pkgPath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Compter les packages dans le workspace
 */
async function countWorkspacePackages() {
  const appsDir = path.join(PROJECT_ROOT, 'apps');
  const packagesDir = path.join(PROJECT_ROOT, 'packages');

  const apps = await fs.readdir(appsDir);
  const packages = await fs.readdir(packagesDir);

  // Filtrer les répertoires
  const appDirs = [];
  for (const app of apps) {
    const stat = await fs.stat(path.join(appsDir, app));
    if (stat.isDirectory()) appDirs.push(app);
  }

  const pkgDirs = [];
  for (const pkg of packages) {
    const stat = await fs.stat(path.join(packagesDir, pkg));
    if (stat.isDirectory()) pkgDirs.push(pkg);
  }

  return {
    apps: appDirs.length,
    packages: pkgDirs.length,
    total: appDirs.length + pkgDirs.length + 1, // +1 for functions
  };
}

/**
 * Compter les scripts de maintenance
 */
async function countMaintenanceScripts() {
  const scriptsDir = path.join(PROJECT_ROOT, 'scripts');
  const files = await fs.readdir(scriptsDir);

  const maintenanceScripts = files.filter(
    (f) =>
      f.endsWith('.mjs') && (f.includes('audit') || f.includes('backfill') || f.includes('purge'))
  );

  return maintenanceScripts.length;
}

/**
 * Extraire les versions des packages
 */
async function extractVersions() {
  const rootPkg = await readPackageJson();
  const functionsPkg = await readFunctionsPackageJson();

  return {
    node: process.version.replace('v', ''),
    pnpm: rootPkg.packageManager?.split('@')[1] || 'unknown',
    firebaseAdmin: functionsPkg.dependencies['firebase-admin']?.replace('^', '') || 'unknown',
    firebaseFunctions:
      functionsPkg.dependencies['firebase-functions']?.replace('^', '') || 'unknown',
    react: '18.3.1', // Version stable
    vite: '5.4.20', // Version stable
    typescript: '5.9.3', // Version stable
  };
}

/**
 * Mettre à jour la date dans un fichier
 */
async function updateDateInFile(filePath, content) {
  const currentDate = getCurrentDate();

  // Patterns pour différents formats de date
  const patterns = [
    // "Dernière mise à jour:** 13 novembre 2025"
    /(Dernière mise à jour:?\*?\*?\s+)\d+\s+\w+\s+\d{4}/gi,
    // "Last Updated:** November 13, 2025"
    /(Last Updated:?\*?\*?\s+)\w+\s+\d+,\s+\d{4}/gi,
    // "> **Dernière mise à jour:** 13 novembre 2025"
    /(>\s+\*\*Dernière mise à jour:?\*?\*?\s+)\d+\s+\w+\s+\d{4}/gi,
  ];

  let updated = content;
  for (const pattern of patterns) {
    if (pattern.test(updated)) {
      updated = updated.replace(pattern, `$1${currentDate}`);
    }
  }

  return updated;
}

/**
 * Mettre à jour les versions dans un fichier
 */
async function updateVersionsInFile(filePath, content, versions) {
  let updated = content;

  // Mise à jour Node version
  updated = updated.replace(/Node\.?js?\s+\d+\.\d+\.\d+/gi, `Node.js ${versions.node}`);
  updated = updated.replace(/Node\s+\d+\.\d+\.\d+/gi, `Node ${versions.node}`);

  // Mise à jour pnpm version
  updated = updated.replace(/pnpm\s+\d+\.\d+\.\d+/gi, `pnpm ${versions.pnpm}`);

  // Mise à jour firebase-admin version
  updated = updated.replace(
    /"firebase-admin":\s+"[\^~]?\d+\.\d+\.\d+"/gi,
    `"firebase-admin": "^${versions.firebaseAdmin}"`
  );

  return updated;
}

/**
 * Vérifier si le fichier nécessite une mise à jour
 */
function needsUpdate(originalContent, newContent) {
  return originalContent !== newContent;
}

/**
 * Mettre à jour un fichier de documentation IA
 */
async function updateAIDoc(filePath) {
  const fullPath = path.join(PROJECT_ROOT, filePath);

  try {
    const originalContent = await fs.readFile(fullPath, 'utf-8');
    let content = originalContent;

    // Mise à jour de la date
    content = await updateDateInFile(filePath, content);

    // Mise à jour des versions
    const versions = await extractVersions();
    content = await updateVersionsInFile(filePath, content, versions);

    if (needsUpdate(originalContent, content)) {
      await fs.writeFile(fullPath, content, 'utf-8');
      console.log(`✅ Mis à jour: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️  Aucun changement: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la mise à jour de ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('\n🤖 Mise à jour des fichiers de contexte IA...\n');

  const currentDate = getCurrentDate();
  const versions = await extractVersions();
  const counts = await countWorkspacePackages();
  const scriptsCount = await countMaintenanceScripts();

  console.log('📊 Informations du projet:');
  console.log(`   Date: ${currentDate}`);
  console.log(`   Node: ${versions.node}`);
  console.log(`   pnpm: ${versions.pnpm}`);
  console.log(`   Packages workspace: ${counts.total}`);
  console.log(`   Scripts de maintenance: ${scriptsCount}`);
  console.log('');

  let updatedCount = 0;

  for (const docPath of AI_DOCS) {
    const updated = await updateAIDoc(docPath);
    if (updated) updatedCount++;
  }

  console.log('\n📝 Résumé:');
  console.log(`   ${updatedCount}/${AI_DOCS.length} fichiers mis à jour`);

  if (updatedCount > 0) {
    console.log("\n💡 N'oubliez pas de commiter les changements:");
    console.log('   git add docs/ PROJECT_CONTEXT.md .cursorrules .github/');
    console.log('   git commit -m "docs(ai): update AI context files (auto-update)"');
  }

  console.log('');
}

// Exécution
main().catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
