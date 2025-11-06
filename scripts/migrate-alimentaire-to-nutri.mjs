#!/usr/bin/env node

/**
 * Migration script: Replace 'alimentaire' questionnaires with 'nutri-assessment'
 *
 * Usage: node migrate-alimentaire-to-nutri.mjs <email> <password>
 *
 * This script:
 * 1. Finds all patients with 'alimentaire' questionnaires
 * 2. Replaces them with 'nutri-assessment'
 * 3. Updates related notifications
 * 4. Preserves questionnaire status and metadata
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

// Configuration Firebase (production)
const firebaseConfig = {
  apiKey: 'AIzaSyDjRCzC5TI5DdGkE8s8kL0eE7NLamfI7gw',
  authDomain: 'neuronutrition-app.firebaseapp.com',
  projectId: 'neuronutrition-app',
  storageBucket: 'neuronutrition-app.firebasestorage.app',
  messagingSenderId: '1026669074766',
  appId: '1:1026669074766:web:63a4a37a7c86abf01ea577',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Get credentials from command line
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('❌ Usage: node migrate-alimentaire-to-nutri.mjs <email> <password>');
  console.error('Example: node migrate-alimentaire-to-nutri.mjs admin@example.com mypassword');
  process.exit(1);
}

async function migrateAlimentaireToNutri() {
  console.log('\n� Authenticating...');

  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Authentication successful\n');
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    process.exit(1);
  }

  console.log('�🔄 Starting migration: alimentaire → nutri-assessment\n');

  let patientsProcessed = 0;
  let questionnairesUpdated = 0;
  let notificationsUpdated = 0;
  let submissionsUpdated = 0;

  try {
    // Get all patients
    const patientsSnapshot = await getDocs(collection(db, 'patients'));
    console.log(`📋 Found ${patientsSnapshot.size} patients to check\n`);

    for (const patientDoc of patientsSnapshot.docs) {
      const patientId = patientDoc.id;

      // Check for 'alimentaire' questionnaire
      const alimentaireRef = doc(db, 'patients', patientId, 'questionnaires', 'alimentaire');

      const alimentaireSnap = await getDoc(alimentaireRef);

      if (alimentaireSnap.exists()) {
        console.log(`👤 Patient ${patientId}: Found 'alimentaire' questionnaire`);
        const alimentaireData = alimentaireSnap.data();

        // Create new 'nutri-assessment' questionnaire with same data
        const nutriRef = doc(db, 'patients', patientId, 'questionnaires', 'nutri-assessment');

        await setDoc(nutriRef, {
          ...alimentaireData,
          id: 'nutri-assessment',
          title: 'Bilan nutrition PNNS5 × SIIN',
          category: 'Nutrition',
          migratedFrom: 'alimentaire',
          migratedAt: serverTimestamp(),
        });
        console.log(`   ✅ Created 'nutri-assessment' questionnaire`);
        questionnairesUpdated++;

        // Delete old 'alimentaire' questionnaire
        await deleteDoc(alimentaireRef);
        console.log(`   🗑️  Deleted 'alimentaire' questionnaire`);

        // Update notifications
        const notificationsQuery = query(
          collection(db, 'patients', patientId, 'notifications'),
          where('questionnaireId', '==', 'alimentaire')
        );

        const notificationsSnap = await getDocs(notificationsQuery);

        for (const notifDoc of notificationsSnap.docs) {
          await updateDoc(notifDoc.ref, {
            questionnaireId: 'nutri-assessment',
            title: 'Nouveau questionnaire: Bilan nutrition PNNS5 × SIIN',
            message: 'Votre praticien vous a assigné le bilan nutrition PNNS5 × SIIN à compléter',
          });
          notificationsUpdated++;
        }

        if (notificationsSnap.size > 0) {
          console.log(`   🔔 Updated ${notificationsSnap.size} notification(s)`);
        }

        // Update submissions if any
        const submissionsQuery = query(
          collection(db, 'questionnaireSubmissions'),
          where('patientUid', '==', patientId),
          where('questionnaireId', '==', 'alimentaire')
        );

        const submissionsSnap = await getDocs(submissionsQuery);

        for (const submissionDoc of submissionsSnap.docs) {
          await updateDoc(submissionDoc.ref, {
            questionnaireId: 'nutri-assessment',
            questionnaireTitle: 'Bilan nutrition PNNS5 × SIIN',
          });
          submissionsUpdated++;
        }

        if (submissionsSnap.size > 0) {
          console.log(`   📝 Updated ${submissionsSnap.size} submission(s)`);
        }

        patientsProcessed++;
        console.log('');
      }
    }

    console.log('════════════════════════════════════════════════════════════');
    console.log('✅ Migration completed successfully!\n');
    console.log(`📊 Summary:`);
    console.log(`   • Patients processed: ${patientsProcessed}`);
    console.log(`   • Questionnaires updated: ${questionnairesUpdated}`);
    console.log(`   • Notifications updated: ${notificationsUpdated}`);
    console.log(`   • Submissions updated: ${submissionsUpdated}`);
    console.log('════════════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
migrateAlimentaireToNutri()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration error:', error);
    process.exit(1);
  });
