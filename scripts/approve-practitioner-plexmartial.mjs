import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccountKey.json';
let serviceAccount;

try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
} catch (error) {
  console.error(
    '❌ Service account key not found. Set GOOGLE_APPLICATION_CREDENTIALS or place serviceAccountKey.json in root.'
  );
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function approvePractitioner() {
  const email = 'martialcayre@gmail.com';
  const uid = 'RJlOj8vuW6cNFZovcrHvF9yJcSG3';

  try {
    console.log(`🔍 Approving practitioner: ${email}`);
    console.log(`📋 UID: ${uid}`);

    // Get practitioner document
    const practitionerRef = db.collection('practitioners').doc(uid);
    const practitionerDoc = await practitionerRef.get();

    if (!practitionerDoc.exists) {
      console.log('❌ Practitioner document not found in Firestore');
      process.exit(1);
    }

    const data = practitionerDoc.data();
    console.log(`📋 Current status: ${data.status || 'none'}`);
    console.log(`📋 Current approvalStatus: ${data.approvalStatus || 'none'}`);

    if (data.approvalStatus === 'approved') {
      console.log('✅ Practitioner already approved!');
    } else {
      // Update to approved
      await practitionerRef.update({
        approvalStatus: 'approved',
        status: 'approved',
        approvedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log('✅ Practitioner approved successfully!');
    }

    // Set custom claims for immediate access
    await admin.auth().setCustomUserClaims(uid, {
      practitioner: true,
      approved: true,
    });
    console.log('✅ Custom claims set: { practitioner: true, approved: true }');

    console.log('\n🎉 Done! Practitioner can now invite patients.');
    console.log('💡 User needs to logout/login to refresh their token.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

approvePractitioner();
