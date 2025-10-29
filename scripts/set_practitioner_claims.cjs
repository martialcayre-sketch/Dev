#!/usr/bin/env node

/**
 * Script to set custom claims for practitioner users
 * Usage: node scripts/set_practitioner_claims.cjs <email>
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../neuronutrition-app-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setPractitionerClaims(email) {
  try {
    console.log(`🔍 Recherche de l'utilisateur: ${email}`);
    
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    console.log(`✅ Utilisateur trouvé: ${user.uid}`);
    
    // Set custom claims
    await admin.auth().setCustomUserClaims(user.uid, {
      role: 'practitioner',
      admin: true,
      fullAdmin: true
    });
    
    console.log(`✅ Custom claims définis pour ${email}:`);
    console.log(`   - role: practitioner`);
    console.log(`   - admin: true`);
    console.log(`   - fullAdmin: true`);
    
    // Verify claims
    const updatedUser = await admin.auth().getUser(user.uid);
    console.log(`\n🎫 Custom claims actuels:`, updatedUser.customClaims);
    
    console.log(`\n⚠️  IMPORTANT: L'utilisateur doit se déconnecter et se reconnecter pour que les claims prennent effet`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

const email = process.argv[2];

if (!email) {
  console.error('❌ Usage: node scripts/set_practitioner_claims.cjs <email>');
  console.error('   Exemple: node scripts/set_practitioner_claims.cjs martialcayre@gmail.com');
  process.exit(1);
}

setPractitionerClaims(email);
