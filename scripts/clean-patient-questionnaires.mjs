#!/usr/bin/env node
/**
 * Script pour nettoyer les questionnaires et notifications d'un patient
 * Usage: node scripts/clean-patient-questionnaires.mjs <patient-uid>
 */

import * as dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { collection, deleteDoc, doc, getDocs, getFirestore, updateDoc } from 'firebase/firestore';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement depuis apps/patient/.env
dotenv.config({ path: join(__dirname, '../apps/patient/.env') });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const patientUid = process.argv[2];

if (!patientUid) {
  console.error('❌ Usage: node scripts/clean-patient-questionnaires.mjs <patient-uid>');
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
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    process.exit(1);
  }
}

cleanPatientData();
