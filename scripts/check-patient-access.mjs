#!/usr/bin/env node

/**
 * Script pour vérifier l'accès praticien à un patient spécifique
 */

import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(readFileSync('c:/dev/serviceAccountKey.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
const auth = getAuth();

async function checkPatientAccess() {
  const patientId = 'kNfyLteJLwd21KComYaCx0telS43';

  console.log("\n🔍 Vérification de l'accès praticien au patient...\n");
  console.log('Patient ID:', patientId);

  try {
    // Récupérer le document patient
    const patientDoc = await db.collection('patients').doc(patientId).get();

    if (!patientDoc.exists) {
      console.log('❌ Patient introuvable dans Firestore');
      return;
    }

    const patientData = patientDoc.data();
    console.log('\n✅ Patient trouvé:');
    console.log('  Email:', patientData.email);
    console.log('  Prénom:', patientData.firstname || 'N/A');
    console.log('  Nom:', patientData.lastname || 'N/A');
    console.log('  Status:', patientData.status);
    console.log('  PractitionerId:', patientData.practitionerId || 'NON ASSIGNÉ ⚠️');

    // Vérifier le praticien
    if (patientData.practitionerId) {
      try {
        const practitionerUser = await auth.getUser(patientData.practitionerId);
        console.log('\n✅ Praticien assigné:');
        console.log('  UID:', practitionerUser.uid);
        console.log('  Email:', practitionerUser.email);
        console.log('  Display Name:', practitionerUser.displayName || 'N/A');

        // Vérifier le custom claim
        if (practitionerUser.customClaims?.practitioner) {
          console.log('  Role: Practitioner ✅');
        } else {
          console.log('  Role: ⚠️ ATTENTION - Pas de claim "practitioner"');
        }

        // Vérifier le document practitioner
        const practitionerDoc = await db
          .collection('practitioners')
          .doc(patientData.practitionerId)
          .get();

        if (practitionerDoc.exists) {
          const practitionerData = practitionerDoc.data();
          console.log('\n✅ Document praticien trouvé:');
          console.log('  Name:', practitionerData.name || 'N/A');
          console.log('  Email:', practitionerData.email || 'N/A');
        } else {
          console.log('\n⚠️ Document praticien INTROUVABLE dans /practitioners');
        }
      } catch (err) {
        console.log('\n❌ Erreur lors de la récupération du praticien:', err.message);
      }
    } else {
      console.log('\n⚠️ PROBLÈME: Patient sans practitionerId assigné!');
    }

    // Vérifier les questionnaires
    const questionnairesSnap = await db
      .collection('patients')
      .doc(patientId)
      .collection('questionnaires')
      .get();

    console.log(`\n📋 Questionnaires: ${questionnairesSnap.size}`);
    questionnairesSnap.forEach((doc) => {
      const q = doc.data();
      console.log(`  - ${doc.id}: ${q.title} (${q.status})`);
    });

    // Test de requête comme le fait l'app
    console.log("\n🧪 Test de requête (comme dans l'app):");
    const testPractitionerId = patientData.practitionerId;

    if (testPractitionerId) {
      const patientsQuery = await db
        .collection('patients')
        .where('practitionerId', '==', testPractitionerId)
        .get();

      console.log(`  Patients trouvés pour ce praticien: ${patientsQuery.size}`);
      patientsQuery.forEach((doc) => {
        const p = doc.data();
        console.log(`    - ${doc.id}: ${p.email} (${p.status})`);
      });
    }

    console.log('\n✅ Vérification terminée\n');
  } catch (error) {
    console.error('\n❌ Erreur:', error);
  }
}

checkPatientAccess();
