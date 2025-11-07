#!/usr/bin/env node

/**
 * Script pour assigner un practitionerId aux patients qui n'en ont pas
 * Usage: node scripts/fix-patient-practitioner-link.mjs <PRACTITIONER_UID>
 */

import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Chemin vers la clé de service
const SERVICE_ACCOUNT_PATH = join(__dirname, '..', 'serviceAccountKey.json');

// Initialiser Firebase Admin
const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function fixPatientPractitionerLinks(practitionerId) {
  if (!practitionerId) {
    console.error('❌ Usage: node scripts/fix-patient-practitioner-link.mjs <PRACTITIONER_UID>');
    console.error('');
    console.error('Exemple:');
    console.error('  node scripts/fix-patient-practitioner-link.mjs abc123xyz');
    process.exit(1);
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  🔗 LIAISON PATIENTS → PRATICIEN');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log(`Praticien ID: ${practitionerId}`);
  console.log('');

  try {
    // Vérifier que le praticien existe
    const practitionerDoc = await db.collection('practitioners').doc(practitionerId).get();
    if (!practitionerDoc.exists) {
      console.error(`❌ Le praticien ${practitionerId} n'existe pas !`);
      process.exit(1);
    }

    console.log(`✅ Praticien trouvé: ${practitionerDoc.data().email || 'N/A'}`);
    console.log('');

    // Récupérer tous les patients
    const patientsSnapshot = await db.collection('patients').get();
    console.log(`📊 ${patientsSnapshot.size} patients trouvés`);
    console.log('');

    let updated = 0;
    let alreadyLinked = 0;
    let errors = 0;

    for (const patientDoc of patientsSnapshot.docs) {
      const patientData = patientDoc.data();
      const patientId = patientDoc.id;

      // Si le patient a déjà un practitionerId
      if (patientData.practitionerId) {
        if (patientData.practitionerId === practitionerId) {
          console.log(`⏭️  ${patientData.email || patientId} - déjà lié à ce praticien`);
          alreadyLinked++;
        } else {
          console.log(
            `⚠️  ${patientData.email || patientId} - lié à un autre praticien: ${patientData.practitionerId}`
          );
        }
        continue;
      }

      // Sinon, assigner le practitionerId
      try {
        await db.collection('patients').doc(patientId).update({
          practitionerId: practitionerId,
          updatedAt: Timestamp.now(),
        });
        console.log(`✅ ${patientData.email || patientId} - lié au praticien`);
        updated++;
      } catch (err) {
        console.error(`❌ ${patientData.email || patientId} - erreur:`, err.message);
        errors++;
      }
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  📊 RÉSUMÉ');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log(`Patients mis à jour:      ${updated}`);
    console.log(`Déjà liés à ce praticien: ${alreadyLinked}`);
    console.log(`Erreurs:                  ${errors}`);
    console.log('');

    if (updated > 0) {
      console.log('✅ Liaison terminée avec succès !');
      console.log('');
      console.log("🔄 Rechargez l'application praticien pour voir les changements.");
    } else if (alreadyLinked > 0) {
      console.log('ℹ️  Tous les patients sont déjà liés à ce praticien.');
    } else {
      console.log('⚠️  Aucun patient mis à jour.');
    }
    console.log('');
  } catch (error) {
    console.error('');
    console.error('❌ Erreur lors de la liaison:', error);
    console.error('');
    process.exit(1);
  }
}

// Récupérer l'UID du praticien depuis les arguments
const practitionerId = process.argv[2];
fixPatientPractitionerLinks(practitionerId);
