#!/usr/bin/env node

/**
 * Script de migration : Ajoute le statut 'pending' aux questionnaires existants
 *
 * Mise à jour de tous les questionnaires existants pour ajouter :
 * - status: 'pending' (par défaut pour les questionnaires assignés non complétés)
 * - submittedAt: null
 * - completedAt: null (si pas déjà présent)
 *
 * Usage : node scripts/migrate-questionnaire-status.mjs
 */

import { initializeApp } from 'firebase/app';
import { collection, doc, getDocs, getFirestore, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyDXLAq3EQi6N-FN4s9RdJGW7VaQYC9EhFk',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'neuronutrition-app.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'neuronutrition-app',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'neuronutrition-app.appspot.com',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '522191764706',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:522191764706:web:8d9f3c2f5e4c1b2a3d4e5f',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateQuestionnaireStatuses() {
  console.log('🚀 Début de la migration des statuts de questionnaires\n');

  try {
    // 1. Récupérer tous les patients
    const patientsSnap = await getDocs(collection(db, 'patients'));
    console.log(`📊 ${patientsSnap.size} patients trouvés\n`);

    let totalQuestionnaires = 0;
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const patientDoc of patientsSnap.docs) {
      const patientId = patientDoc.id;
      console.log(`\n👤 Patient: ${patientId}`);

      // 2. Récupérer les questionnaires du patient
      const questionnairesSnap = await getDocs(
        collection(db, `patients/${patientId}/questionnaires`)
      );

      if (questionnairesSnap.empty) {
        console.log('   ⚠️  Aucun questionnaire');
        continue;
      }

      console.log(`   📋 ${questionnairesSnap.size} questionnaires`);
      totalQuestionnaires += questionnairesSnap.size;

      for (const qDoc of questionnairesSnap.docs) {
        const qId = qDoc.id;
        const qData = qDoc.data();

        try {
          // Vérifier si le statut existe déjà
          if (qData.status) {
            console.log(`   ✓ ${qId} : statut déjà présent (${qData.status})`);
            skippedCount++;
            continue;
          }

          // Déterminer le statut approprié
          let status = 'pending';
          const updates = {
            status,
            submittedAt: null,
          };

          // Si completedAt existe déjà, garder completed
          if (qData.completedAt) {
            updates.status = 'completed';
          }

          // Si responses existe et n'est pas vide, mettre in_progress
          if (qData.responses && Object.keys(qData.responses).length > 0 && !qData.completedAt) {
            updates.status = 'in_progress';
          }

          // Ajouter completedAt si absent
          if (!qData.completedAt) {
            updates.completedAt = null;
          }

          // Mettre à jour
          await updateDoc(doc(db, `patients/${patientId}/questionnaires/${qId}`), updates);
          console.log(`   ✅ ${qId} : migré vers status=${updates.status}`);
          migratedCount++;
        } catch (err) {
          console.error(`   ❌ Erreur sur ${qId}:`, err.message);
          errorCount++;
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ DE LA MIGRATION');
    console.log('='.repeat(60));
    console.log(`Total questionnaires  : ${totalQuestionnaires}`);
    console.log(`✅ Migrés            : ${migratedCount}`);
    console.log(`⏭️  Ignorés           : ${skippedCount}`);
    console.log(`❌ Erreurs           : ${errorCount}`);
    console.log('='.repeat(60) + '\n');

    if (errorCount === 0) {
      console.log('✅ Migration terminée avec succès !\n');
    } else {
      console.log(`⚠️  Migration terminée avec ${errorCount} erreur(s)\n`);
    }
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

migrateQuestionnaireStatuses()
  .then(() => {
    console.log('✅ Script terminé');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Erreur finale:', err);
    process.exit(1);
  });
