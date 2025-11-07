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

async function forceTokenRefresh() {
  const uid = 'RJlOj8vuW6cNFZovcrHvF9yJcSG3';

  try {
    console.log('🔄 Forcing token refresh for UID:', uid);

    // Get current user
    const userRecord = await admin.auth().getUser(uid);
    console.log('✅ User found:', userRecord.email);

    // Revoke all refresh tokens - this forces the user to get a new token with updated claims
    await admin.auth().revokeRefreshTokens(uid);
    console.log('✅ All refresh tokens revoked');

    // Set custom claims again
    await admin.auth().setCustomUserClaims(uid, {
      practitioner: true,
      approved: true,
    });
    console.log('✅ Custom claims set: { practitioner: true, approved: true }');

    console.log('\n🎉 Done!');
    console.log('⚠️  IMPORTANT: User MUST logout and login again immediately!');
    console.log('   Old tokens are now invalid.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

forceTokenRefresh();
