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

async function seedPatient({
  email,
  password,
  emailVerified,
  approvalStatus,
}: {
  email: string;
  password: string;
  emailVerified: boolean;
  approvalStatus: 'pending' | 'approved';
}) {
  initAdmin();
  const auth = admin.auth();
  const db = admin.firestore();

  // Clean existing
  try {
    const existing = await auth.getUserByEmail(email);
    await auth.deleteUser(existing.uid);
  } catch {}

  const user = await auth.createUser({
    email,
    password,
    emailVerified,
    displayName: 'Test Patient',
  });

  await db.collection('users').doc(user.uid).set({
    uid: user.uid,
    email,
    role: 'patient',
    displayName: 'Test Patient',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    emailVerified,
    approvalStatus,
  });

  return { uid: user.uid };
}

test.describe('Patient redirect flows', () => {
  test('Unverified patient redirects to /verify-email', async ({ page }) => {
    const email = `p-${Date.now()}-unverified@example.com`;
    const password = 'Password123!';
    await seedPatient({ email, password, emailVerified: false, approvalStatus: 'pending' });

    await page.goto('/login/patient');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Mot de passe').fill(password);
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await page.waitForURL('**/verify-email');
    expect(page.url()).toContain('/verify-email');
  });

  test('Verified but pending patient redirects to /patient/pending-approval', async ({ page }) => {
    const email = `p-${Date.now()}-pending@example.com`;
    const password = 'Password123!';
    await seedPatient({ email, password, emailVerified: true, approvalStatus: 'pending' });

    await page.goto('/login/patient');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Mot de passe').fill(password);
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await page.waitForURL('**/patient/pending-approval');
    expect(page.url()).toContain('/patient/pending-approval');
  });

  test('Approved patient reaches /patient/home', async ({ page }) => {
    const email = `p-${Date.now()}-approved@example.com`;
    const password = 'Password123!';
    await seedPatient({ email, password, emailVerified: true, approvalStatus: 'approved' });

    await page.goto('/login/patient');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Mot de passe').fill(password);
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await page.waitForURL('**/patient/home');
    expect(page.url()).toContain('/patient/home');
  });
});
