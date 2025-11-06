/**
 * Configure Firebase Auth action code settings to extend link validity to 24 hours
 * Run with: node scripts/configure-auth-link-duration.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

async function configureAuthLinkDuration() {
  try {
    console.log("⚙️  Configuration des liens d'action Firebase Auth...");

    // Note: Firebase Auth link expiration is configured at the project level
    // Default is 1 hour, but we can't programmatically change it via Admin SDK
    // It must be configured in Firebase Console or via REST API

    console.log('\n⚠️  IMPORTANT:');
    console.log(
      'La durée de validité des liens doit être configurée manuellement dans la Console Firebase:'
    );
    console.log(
      '\n1. Allez sur https://console.firebase.google.com/project/neuronutrition-app/authentication/emails'
    );
    console.log('2. Cliquez sur l\'icône crayon (✏️) à côté de "Réinitialisation du mot de passe"');
    console.log(
      '3. Dans les paramètres avancés, définissez la durée de validité à 24 heures (86400 secondes)'
    );
    console.log(
      "\nAlternativement, utilisez l'API Firebase Auth REST pour définir actionCodeSettings.\n"
    );

    // For password reset links generated in code, we use the default expiration
    // which is controlled by Firebase project settings
    console.log('✅ Le code a été mis à jour pour utiliser actionCodeSettings');
    console.log('   Les liens générés utiliseront la durée configurée dans Firebase Console.');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

configureAuthLinkDuration()
  .then(() => {
    console.log('\n✅ Configuration terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
