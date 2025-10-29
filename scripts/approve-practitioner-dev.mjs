/**
 * Script pour approuver un praticien dans l'émulateur Firestore
 * Usage: node scripts/approve-practitioner-dev.mjs <email_du_praticien>
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'neuronutrition-app',
  // Config minimale pour l'émulateur
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connexion à l'émulateur
connectFirestoreEmulator(db, 'localhost', 5003);

const email = process.argv[2];

if (!email) {
  console.error('❌ Usage: node scripts/approve-practitioner-dev.mjs <email>');
  console.error('   Exemple: node scripts/approve-practitioner-dev.mjs john@example.com');
  process.exit(1);
}

async function approvePractitioner() {
  try {
    console.log(`🔍 Recherche du praticien avec email: ${email}...`);
    
    const q = query(collection(db, 'practitioners'), where('email', '==', email));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.error('❌ Aucun praticien trouvé avec cet email');
      console.log('\n💡 Assurez-vous que:');
      console.log('   1. Le praticien s\'est inscrit via Google Sign-In');
      console.log('   2. Les émulateurs Firebase sont en cours d\'exécution');
      console.log('   3. L\'email est correct');
      process.exit(1);
    }
    
    const practitionerDoc = snapshot.docs[0];
    const data = practitionerDoc.data();
    
    console.log('\n📋 Informations du praticien:');
    console.log(`   UID: ${practitionerDoc.id}`);
    console.log(`   Email: ${data.email}`);
    console.log(`   Nom: ${data.displayName || 'N/A'}`);
    console.log(`   Statut actuel: ${data.status}`);
    
    if (data.status === 'approved') {
      console.log('\n✅ Ce praticien est déjà approuvé!');
      process.exit(0);
    }
    
    console.log('\n🔄 Approbation en cours...');
    
    await updateDoc(doc(db, 'practitioners', practitionerDoc.id), {
      status: 'approved',
      approvedAt: new Date(),
    });
    
    console.log('✅ Praticien approuvé avec succès!');
    console.log('\n🚀 Le praticien peut maintenant se connecter au dashboard');
    console.log(`   URL: http://localhost:3010/login`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

approvePractitioner();
