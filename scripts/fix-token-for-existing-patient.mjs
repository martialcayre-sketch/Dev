#!/usr/bin/env node

/**
 * Script pour marquer un token d'invitation comme utilisé
 * pour un patient qui a déjà créé son compte
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialiser Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync('./neuronutrition-app-firebase-adminsdk.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function fixTokenForPatient(patientEmail) {
  try {
    console.log(`\n🔍 Recherche du token pour: ${patientEmail}`);

    // 1. Chercher les tokens non utilisés pour cet email
    const tokensQuery = await db
      .collection('invitationTokens')
      .where('email', '==', patientEmail)
      .where('used', '==', false)
      .get();

    if (tokensQuery.empty) {
      console.log('❌ Aucun token non utilisé trouvé pour cet email');
      return;
    }

    const tokenDoc = tokensQuery.docs[0];
    const tokenId = tokenDoc.id;
    console.log(`✅ Token trouvé: ${tokenId}`);

    // 2. Marquer le token comme utilisé
    await db.collection('invitationTokens').doc(tokenId).update({
      used: true,
      usedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`✅ Token marqué comme utilisé`);

    // 3. Chercher le patient
    const patientsQuery = await db
      .collection('patients')
      .where('email', '==', patientEmail)
      .limit(1)
      .get();

    if (!patientsQuery.empty) {
      const patientDoc = patientsQuery.docs[0];
      const patientId = patientDoc.id;

      // 4. Ajouter le token au document patient
      await db.collection('patients').doc(patientId).update({
        invitationToken: tokenId,
      });
      console.log(`✅ Token ajouté au document patient: ${patientId}`);
    }

    console.log(`\n🎉 Correction terminée avec succès !`);
  } catch (error) {
    console.error(`❌ Erreur:`, error);
  } finally {
    process.exit(0);
  }
}

// Email du patient à corriger
const patientEmail = 'plexmartial@gmail.com';
fixTokenForPatient(patientEmail);
