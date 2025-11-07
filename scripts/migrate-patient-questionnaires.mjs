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

async function migratePatientQuestionnaires() {
  const patientId = '37a87xmECVhDkxEmN0qFrr4IsfF2'; // plexmartial@gmail.com

  try {
    console.log('🔄 Migration des questionnaires pour patient:', patientId);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Get all questionnaires from subcollection
    const subCollectionRef = db.collection('patients').doc(patientId).collection('questionnaires');
    const subQuestionnaires = await subCollectionRef.get();

    console.log(`📋 Found ${subQuestionnaires.size} questionnaires in subcollection\n`);

    if (subQuestionnaires.empty) {
      console.log('⚠️  No questionnaires to migrate');
      process.exit(0);
    }

    let migrated = 0;
    let skipped = 0;

    // Migrate each questionnaire
    for (const doc of subQuestionnaires.docs) {
      const data = doc.data();
      const questionnaireId = doc.id;

      console.log(`\n📝 Processing: ${data.title || questionnaireId}`);
      console.log(`   ID: ${questionnaireId}`);
      console.log(`   Status: ${data.status || 'N/A'}`);

      // Check if already exists in root
      const rootRef = db.collection('questionnaires').doc(questionnaireId);
      const rootDoc = await rootRef.get();

      if (rootDoc.exists) {
        console.log('   ⏭️  Already exists in root collection - skipping');
        skipped++;
        continue;
      }

      // Copy to root collection with patientUid
      const rootData = {
        ...data,
        patientUid: patientId,
        migratedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await rootRef.set(rootData);
      console.log('   ✅ Migrated to root collection');
      migrated++;
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 MIGRATION TERMINÉE\n');
    console.log(`✅ Migrated: ${migrated}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`📊 Total: ${subQuestionnaires.size}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

migratePatientQuestionnaires();
