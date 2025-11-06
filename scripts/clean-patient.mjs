#!/usr/bin/env node
/**
 * Script pour nettoyer les questionnaires et notifications d'un patient
 * Usage: node scripts/clean-patient.mjs <patient-uid>
 */

import { initializeApp } from 'firebase/app';
import { collection, deleteDoc, doc, getDocs, getFirestore, updateDoc } from 'firebase/firestore';

// Configuration Firebase (production)
const firebaseConfig = {
  apiKey: 'AIzaSyDjRCzC5TI5DdGkE8s8kL0eE7NLamfI7gw',
  authDomain: 'neuronutrition-app.firebaseapp.com',
  projectId: 'neuronutrition-app',
  storageBucket: 'neuronutrition-app.firebasestorage.app',
  messagingSenderId: '1026669074766',
  appId: '1:1026669074766:web:63a4a37a7c86abf01ea577',
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const patientUid = process.argv[2];

if (!patientUid) {
  console.error('❌ Usage: node scripts/clean-patient.mjs <patient-uid>');
  process.exit(1);
}

async function cleanPatientData() {
  console.log(`\n🔄 Nettoyage des données pour le patient: ${patientUid}\n`);

  try {
    // 1. Supprimer tous les questionnaires
    console.log('📋 Suppression des questionnaires...');
    const questionnairesRef = collection(db, 'patients', patientUid, 'questionnaires');
    const questionnairesSnap = await getDocs(questionnairesRef);
    let count = 0;
    for (const docSnap of questionnairesSnap.docs) {
      await deleteDoc(docSnap.ref);
      console.log(`   ✓ Supprimé: ${docSnap.id}`);
      count++;
    }
    console.log(`   → ${count} questionnaire(s) supprimé(s)\n`);

    // 2. Supprimer toutes les notifications
    console.log('🔔 Suppression des notifications...');
    const notificationsRef = collection(db, 'patients', patientUid, 'notifications');
    const notificationsSnap = await getDocs(notificationsRef);
    count = 0;
    for (const docSnap of notificationsSnap.docs) {
      await deleteDoc(docSnap.ref);
      console.log(`   ✓ Supprimé: ${docSnap.data().title}`);
      count++;
    }
    console.log(`   → ${count} notification(s) supprimée(s)\n`);

    // 3. Réinitialiser les champs du document patient
    console.log('👤 Réinitialisation du document patient...');
    const patientRef = doc(db, 'patients', patientUid);
    await updateDoc(patientRef, {
      hasQuestionnairesAssigned: false,
      pendingQuestionnairesCount: 0,
      questionnairesAssignedAt: null,
    });
    console.log('   ✓ Document patient réinitialisé\n');

    console.log('✅ Nettoyage terminé avec succès!');
    console.log(
      "\n💡 Vous pouvez maintenant réouvrir l'espace Consultation pour réassigner les questionnaires.\n"
    );
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    process.exit(1);
  }
}

cleanPatientData();
