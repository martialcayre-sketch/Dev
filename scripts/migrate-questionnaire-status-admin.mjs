/**
 * Script de migration : Ajoute le statut aux questionnaires existants
 * Utilise firebase-admin via les functions
 *
 * À exécuter avec : cd functions && node ../scripts/migrate-questionnaire-status-admin.mjs
 */

import admin from 'firebase-admin';

// Utilise le projet Firebase par défaut
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert('c:/dev/serviceAccountKey.json'),
    projectId: 'neuronutrition-app',
  });
}

const db = admin.firestore();

async function migrateQuestionnaireStatuses() {
  console.log('🚀 Début de la migration des statuts de questionnaires\n');

  try {
    // 1. Récupérer tous les patients
    const patientsSnap = await db.collection('patients').get();
    console.log(`📊 ${patientsSnap.size} patients trouvés\n`);

    let totalQuestionnaires = 0;
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const patientDoc of patientsSnap.docs) {
      const patientId = patientDoc.id;
      console.log(`\n👤 Patient: ${patientId}`);

      // 2. Récupérer les questionnaires du patient
      const questionnairesSnap = await db.collection(`patients/${patientId}/questionnaires`).get();

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
          await db.doc(`patients/${patientId}/questionnaires/${qId}`).update(updates);
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
