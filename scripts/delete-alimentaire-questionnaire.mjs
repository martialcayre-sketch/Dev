#!/usr/bin/env node

/**
 * Script to delete 'alimentaire' questionnaires from all patients
 *
 * Usage: node delete-alimentaire-questionnaire.mjs <email> <password>
 *
 * This script:
 * 1. Finds all patients with 'alimentaire' questionnaires
 * 2. Deletes the questionnaire document
 * 3. Decrements pendingQuestionnairesCount if status is pending
 * 4. Deletes related notifications
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
  increment,
  query,
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
  console.error('❌ Usage: node delete-alimentaire-questionnaire.mjs <email> <password>');
  console.error('Example: node delete-alimentaire-questionnaire.mjs admin@example.com mypassword');
  process.exit(1);
}

async function deleteAlimentaireQuestionnaires() {
  console.log('\n🔐 Authenticating...');

  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Authentication successful\n');
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    process.exit(1);
  }

  console.log('🗑️  Starting deletion: alimentaire questionnaires\n');

  let patientsProcessed = 0;
  let questionnairesDeleted = 0;
  let notificationsDeleted = 0;
  let countersUpdated = 0;

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

        // If questionnaire is pending, decrement the counter
        if (alimentaireData.status === 'pending') {
          const patientRef = doc(db, 'patients', patientId);
          await updateDoc(patientRef, {
            pendingQuestionnairesCount: increment(-1),
          });
          console.log(`   📊 Decremented pendingQuestionnairesCount`);
          countersUpdated++;
        }

        // Delete the questionnaire
        await deleteDoc(alimentaireRef);
        console.log(`   🗑️  Deleted 'alimentaire' questionnaire`);
        questionnairesDeleted++;

        // Delete related notifications
        const notificationsQuery = query(
          collection(db, 'patients', patientId, 'notifications'),
          where('questionnaireId', '==', 'alimentaire')
        );

        const notificationsSnap = await getDocs(notificationsQuery);

        for (const notifDoc of notificationsSnap.docs) {
          await deleteDoc(notifDoc.ref);
          notificationsDeleted++;
        }

        if (notificationsSnap.size > 0) {
          console.log(`   🔔 Deleted ${notificationsSnap.size} notification(s)`);
        }

        patientsProcessed++;
        console.log('');
      }
    }

    console.log('════════════════════════════════════════════════════════════');
    console.log('✅ Deletion completed successfully!\n');
    console.log(`📊 Summary:`);
    console.log(`   • Patients processed: ${patientsProcessed}`);
    console.log(`   • Questionnaires deleted: ${questionnairesDeleted}`);
    console.log(`   • Notifications deleted: ${notificationsDeleted}`);
    console.log(`   • Counters updated: ${countersUpdated}`);
    console.log('════════════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('\n❌ Deletion failed:', error);
    throw error;
  }
}

// Run deletion
deleteAlimentaireQuestionnaires()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Deletion error:', error);
    process.exit(1);
  });
