import { test, expect } from '@playwright/test';
import * as admin from 'firebase-admin';

const PROJECT_ID = 'neuronutrition-app';

function initAdmin() {
  if (!process.env.FIRESTORE_EMULATOR_HOST) process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8081';
  if (!process.env.FIREBASE_AUTH_EMULATOR_HOST)
    process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9098';
  if (!process.env.GOOGLE_CLOUD_PROJECT) process.env.GOOGLE_CLOUD_PROJECT = PROJECT_ID;

  if (admin.apps.length === 0) {
    admin.initializeApp({ projectId: PROJECT_ID });
  }
}

async function seedPractitioner({ email, password }: { email: string; password: string }) {
  initAdmin();
  const auth = admin.auth();
  const db = admin.firestore();

  try {
    const existing = await auth.getUserByEmail(email);
    await auth.deleteUser(existing.uid);
  } catch {}

  const user = await auth.createUser({
    email,
    password,
    emailVerified: true,
    displayName: 'Dr. Test',
  });

  await db.collection('users').doc(user.uid).set({
    uid: user.uid,
    email,
    role: 'practitioner',
    displayName: 'Dr. Test',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    emailVerified: true,
    approvalStatus: 'approved',
  });

  return { uid: user.uid };
}

test.describe('Practitioner authentication', () => {
  test('Practitioner can login successfully', async ({ page, context }) => {
    const practitionerEmail = `practitioner-auth-${Date.now()}@example.com`;
    const practitionerPassword = 'Password123!';
    await seedPractitioner({ email: practitionerEmail, password: practitionerPassword });

    // Login as practitioner
    await page.goto('/login/practitioner');

    // Check we're on login page
    await expect(page.locator('h1')).toHaveText('Connexion praticien');

    await page.getByLabel('Email').fill(practitionerEmail);
    await page.getByLabel('Mot de passe').fill(practitionerPassword);

    // Click login and wait
    await page.getByRole('button', { name: 'Se connecter' }).click();

    // Wait for navigation with longer timeout
    try {
      await page.waitForURL('**/practitioner/home', { timeout: 15000 });
      console.log('SUCCESS: Navigated to practitioner home');
    } catch (e) {
      console.log('FAILED: Did not navigate to practitioner home');
      console.log('Current URL:', page.url());
      const title = await page.locator('h1').textContent();
      console.log('Current page title:', title);

      // Check for any error messages
      const bodyText = await page.textContent('body');
      console.log('Page text:', bodyText?.substring(0, 500));

      throw e;
    }

    expect(page.url()).toContain('/practitioner/home');
  });
});
