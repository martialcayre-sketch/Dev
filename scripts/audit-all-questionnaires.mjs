#!/usr/bin/env node
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccountKey.json';
let serviceAccount;

try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
} catch (error) {
  console.error('❌ Service account key not found.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

console.log('🔍 AUDIT COMPLET DES QUESTIONNAIRES\n');
console.log('━'.repeat(60));

async function auditQuestionnaires() {
  const stats = {
    totalPatients: 0,
    patientsWithQuestionnaires: 0,
    totalInSubcollection: 0,
    totalInRoot: 0,
    missingInRoot: [],
    orphansInRoot: [],
  };

  // 1. Liste tous les patients
  const patientsSnap = await db.collection('patients').get();
  stats.totalPatients = patientsSnap.docs.length;

  console.log(`📊 Patients trouvés: ${stats.totalPatients}\n`);

  for (const patientDoc of patientsSnap.docs) {
    const patientId = patientDoc.id;
    const patientData = patientDoc.data();
    const patientEmail = patientData.email || patientId;

    // 2. Check subcollection
    const subQuestionnairesSnap = await db
      .collection('patients')
      .doc(patientId)
      .collection('questionnaires')
      .get();

    // 3. Check root collection
    const rootQuestionnairesSnap = await db
      .collection('questionnaires')
      .where('patientUid', '==', patientId)
      .get();

    const subCount = subQuestionnairesSnap.docs.length;
    const rootCount = rootQuestionnairesSnap.docs.length;

    if (subCount > 0 || rootCount > 0) {
      stats.patientsWithQuestionnaires++;
      stats.totalInSubcollection += subCount;
      stats.totalInRoot += rootCount;

      console.log(`\n👤 ${patientEmail}`);
      console.log(`   UID: ${patientId}`);
      console.log(`   Subcollection: ${subCount} questionnaires`);
      console.log(`   Root collection: ${rootCount} questionnaires`);

      if (subCount !== rootCount) {
        console.log(`   ⚠️  DÉSYNCHRONISÉ !`);
      }

      // List questionnaires in subcollection
      if (subCount > 0) {
        console.log(`\n   📋 Subcollection:`);
        for (const qDoc of subQuestionnairesSnap.docs) {
          const qData = qDoc.data();
          const inRoot = rootQuestionnairesSnap.docs.some((d) => d.id === qDoc.id);
          console.log(
            `      - ${qData.title || qDoc.id} [${qData.status}] ${inRoot ? '✅' : '❌ MANQUE EN ROOT'}`
          );

          if (!inRoot) {
            stats.missingInRoot.push({
              patientId,
              patientEmail,
              questionnaireId: qDoc.id,
              title: qData.title,
            });
          }
        }
      }

      // List questionnaires in root only
      const rootOnly = rootQuestionnairesSnap.docs.filter(
        (rDoc) => !subQuestionnairesSnap.docs.some((sDoc) => sDoc.id === rDoc.id)
      );

      if (rootOnly.length > 0) {
        console.log(`\n   📋 Root collection uniquement:`);
        for (const qDoc of rootOnly) {
          const qData = qDoc.data();
          console.log(
            `      - ${qData.title || qDoc.id} [${qData.status}] ❌ MANQUE EN SUBCOLLECTION`
          );

          stats.orphansInRoot.push({
            patientId,
            patientEmail,
            questionnaireId: qDoc.id,
            title: qData.title,
          });
        }
      }
    }
  }

  console.log('\n\n' + '━'.repeat(60));
  console.log('📊 RÉSUMÉ\n');
  console.log(`Total patients: ${stats.totalPatients}`);
  console.log(`Patients avec questionnaires: ${stats.patientsWithQuestionnaires}`);
  console.log(`\nQuestionnaires en subcollection: ${stats.totalInSubcollection}`);
  console.log(`Questionnaires en root collection: ${stats.totalInRoot}`);

  if (stats.missingInRoot.length > 0) {
    console.log(`\n⚠️  ${stats.missingInRoot.length} questionnaires MANQUANTS en root collection:`);
    for (const item of stats.missingInRoot) {
      console.log(`   - ${item.patientEmail}: ${item.title} (${item.questionnaireId})`);
    }
  }

  if (stats.orphansInRoot.length > 0) {
    console.log(`\n⚠️  ${stats.orphansInRoot.length} questionnaires EN ROOT SEULEMENT:`);
    for (const item of stats.orphansInRoot) {
      console.log(`   - ${item.patientEmail}: ${item.title} (${item.questionnaireId})`);
    }
  }

  console.log('\n' + '━'.repeat(60));
  console.log('\n💡 RECOMMANDATIONS:\n');

  if (stats.missingInRoot.length > 0) {
    console.log('   1️⃣  Migrer les questionnaires manquants vers root collection');
    console.log('      → node scripts/migrate-all-questionnaires.mjs\n');
  }

  if (stats.orphansInRoot.length > 0) {
    console.log('   2️⃣  Copier les questionnaires root vers subcollections manquantes');
    console.log('      (ou accepter que root soit la source de vérité)\n');
  }

  console.log('   3️⃣  Décider de la stratégie:');
  console.log('      A) ROOT COLLECTION = source de vérité (recommandé)');
  console.log('         → API utilise root uniquement');
  console.log('         → Frontend doit utiliser API au lieu de subcollection');
  console.log('         → Supprimer subcollections après migration complète\n');
  console.log('      B) DOUBLE-WRITE permanent');
  console.log('         → Maintenir synchronisation permanente');
  console.log('         → Plus complexe à maintenir\n');
}

auditQuestionnaires().catch(console.error);
