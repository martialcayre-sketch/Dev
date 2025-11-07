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

async function checkInvitation() {
  const email = 'plexmartial@gmail.com';

  try {
    console.log(`🔍 Looking for invitation token for: ${email}\n`);

    // Find invitation tokens for this email (without orderBy to avoid index requirement)
    const tokensSnapshot = await db
      .collection('invitationTokens')
      .where('email', '==', email)
      .limit(10)
      .get();

    if (tokensSnapshot.empty) {
      console.log('❌ No invitation token found for this email');
      process.exit(1);
    }

    // Get the most recent token (manual sort since we can't use orderBy)
    const tokens = tokensSnapshot.docs.map((doc) => ({
      id: doc.id,
      data: doc.data(),
      createdAt: doc.data().createdAt?.toMillis() || 0,
    }));
    tokens.sort((a, b) => b.createdAt - a.createdAt);

    const tokenDoc = tokens[0];
    const tokenData = tokenDoc.data;
    const tokenId = tokenDoc.id;

    console.log('✅ Invitation Token Found!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📋 Token ID: ${tokenId}`);
    console.log(`📧 Email: ${tokenData.email}`);
    console.log(`🔒 Used: ${tokenData.used ? '✅ Yes' : '❌ No'}`);
    console.log(`⏰ Expires: ${tokenData.expiresAt?.toDate?.()?.toLocaleString() || 'N/A'}`);
    console.log(`👤 Practitioner ID: ${tokenData.practitionerId}`);
    console.log(`🆔 Patient ID: ${tokenData.patientId || 'N/A'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Build invitation link
    const patientAppUrl =
      process.env.PATIENT_APP_URL || 'https://neuronutrition-app-patient.web.app';
    const invitationLink = `${patientAppUrl}/signup?token=${tokenId}`;

    console.log('🔗 Invitation Link:');
    console.log(`   ${invitationLink}\n`);

    // Check if patient document exists
    if (tokenData.patientId) {
      const patientDoc = await db.collection('patients').doc(tokenData.patientId).get();
      if (patientDoc.exists) {
        const patientData = patientDoc.data();
        console.log('📋 Patient Document Status:');
        console.log(`   Status: ${patientData.status}`);
        console.log(`   Approval Status: ${patientData.approvalStatus}`);
        console.log(`   Provider: ${patientData.provider}`);
      }
    }

    console.log('\n✅ Ready to test signup flow!');
    console.log('💡 Copy the invitation link above and open it in a browser.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkInvitation();
