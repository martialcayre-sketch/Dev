import admin from 'firebase-admin';
import { readFileSync } from 'fs';

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

async function checkQuestionnaires() {
  const patientId = '37a87xmECVhDkxEmN0qFrr4IsfF2';

  try {
    console.log(`🔍 Checking questionnaires for patient: ${patientId}\n`);

    // Check root collection
    console.log('📦 Checking ROOT collection (questionnaires):');
    const rootQuestionnaires = await db
      .collection('questionnaires')
      .where('patientUid', '==', patientId)
      .get();
    console.log(`   Found: ${rootQuestionnaires.docs.length} questionnaires`);
    rootQuestionnaires.docs.forEach((doc) => {
      const data = doc.data();
      console.log(`   - ${doc.id}: ${data.title} (status: ${data.status})`);
    });

    // Check subcollection
    console.log('\n📦 Checking SUBCOLLECTION (patients/{uid}/questionnaires):');
    const subQuestionnaires = await db
      .collection('patients')
      .doc(patientId)
      .collection('questionnaires')
      .get();
    console.log(`   Found: ${subQuestionnaires.docs.length} questionnaires`);
    subQuestionnaires.docs.forEach((doc) => {
      const data = doc.data();
      console.log(`   - ${doc.id}: ${data.title || 'No title'} (status: ${data.status})`);
    });

    console.log('\n💡 Solution:');
    if (rootQuestionnaires.docs.length === 0 && subQuestionnaires.docs.length > 0) {
      console.log(
        '   Les questionnaires sont dans la subcollection mais pas dans la root collection!'
      );
      console.log('   Il faut les migrer vers la root collection.');
    } else if (rootQuestionnaires.docs.length === 0 && subQuestionnaires.docs.length === 0) {
      console.log('   Aucun questionnaire trouvé nulle part!');
      console.log('   Il faut appeler activatePatient ou assignQuestionnaires.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkQuestionnaires();
