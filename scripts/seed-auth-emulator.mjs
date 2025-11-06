#!/usr/bin/env node
/**
 * Script pour créer automatiquement un compte Google de test dans l'émulateur Auth
 * Cela évite l'écran "No Google.com accounts exist in the Auth Emulator"
 */

const EMULATOR_HOST = 'localhost:5004';
const PROJECT_ID = 'neuronutrition-app';

const testAccounts = [
  {
    email: 'test.praticien@example.com',
    displayName: 'Dr Test Praticien',
    photoUrl: 'https://via.placeholder.com/150',
    emailVerified: true,
    providerId: 'google.com',
  },
  {
    email: 'praticien@neuronutrition.fr',
    displayName: 'Dr Marie Dupont',
    photoUrl: 'https://via.placeholder.com/150',
    emailVerified: true,
    providerId: 'google.com',
  },
];

async function createAccount(account) {
  try {
    const response = await fetch(
      `http://${EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer owner`,
        },
        body: JSON.stringify({
          email: account.email,
          password: 'password123', // Mot de passe fictif pour l'émulateur
          displayName: account.displayName,
          photoUrl: account.photoUrl,
          emailVerified: account.emailVerified,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Compte créé: ${account.email} (${account.displayName})`);
      return data;
    } else {
      console.log(`⚠️  Compte déjà existant ou erreur: ${account.email}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la création du compte ${account.email}:`, error.message);
    return null;
  }
}

async function seedAuthEmulator() {
  console.log("\n🔥 Initialisation des comptes de test dans l'émulateur Auth...\n");

  // Attendre que l'émulateur soit prêt
  let retries = 10;
  while (retries > 0) {
    try {
      const response = await fetch(`http://${EMULATOR_HOST}/`);
      if (response.ok) break;
    } catch (error) {
      console.log(`⏳ Attente de l'émulateur Auth... (${retries} tentatives restantes)`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      retries--;
    }
  }

  if (retries === 0) {
    console.error("❌ L'émulateur Auth n'est pas accessible sur", EMULATOR_HOST);
    process.exit(1);
  }

  console.log('✅ Émulateur Auth prêt\n');

  // Créer les comptes de test
  for (const account of testAccounts) {
    await createAccount(account);
  }

  console.log('\n✅ Initialisation terminée!');
  console.log('\n📝 Comptes disponibles:');
  testAccounts.forEach((acc) => {
    console.log(`   - ${acc.email} (${acc.displayName})`);
  });
  console.log('\n💡 Vous pouvez maintenant vous connecter avec Google Sign-In\n');
}

seedAuthEmulator().catch((error) => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
