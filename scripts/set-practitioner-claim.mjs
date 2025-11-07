#!/usr/bin/env node

/**
 * Script pour ajouter le custom claim "practitioner" à un utilisateur
 */

import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(readFileSync('c:/dev/serviceAccountKey.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth();

async function setPractitionerClaim() {
  const practitionerUid = 'RJlOj8vuW6cNFZovcrHvF9yJcSG3';

  console.log('\n🔧 Ajout du custom claim "practitioner"...\n');
  console.log('UID:', practitionerUid);

  try {
    // Récupérer l'utilisateur
    const user = await auth.getUser(practitionerUid);
    console.log('Email:', user.email);

    // Définir le custom claim
    await auth.setCustomUserClaims(practitionerUid, {
      practitioner: true,
    });

    console.log('\n✅ Custom claim "practitioner" ajouté avec succès!');

    // Vérifier
    const updatedUser = await auth.getUser(practitionerUid);
    console.log('\nCustom claims actuels:', updatedUser.customClaims);

    console.log("\n⚠️ IMPORTANT: L'utilisateur doit se déconnecter et se reconnecter");
    console.log('   pour que le nouveau claim soit pris en compte.\n');
  } catch (error) {
    console.error('\n❌ Erreur:', error);
  }
}

setPractitionerClaim();
