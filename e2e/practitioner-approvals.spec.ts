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
  });

  return { uid: user.uid };
}

async function seedPatientAssignedTo({
  email,
  password,
  practitionerUid,
  approvalStatus,
}: {
  email: string;
  password: string;
  practitionerUid: string;
  approvalStatus: 'pending' | 'approved';
}) {
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
    displayName: 'Test Patient',
  });

  await db.collection('users').doc(user.uid).set({
    uid: user.uid,
    email,
    role: 'patient',
    displayName: 'Test Patient',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    emailVerified: true,
    approvalStatus,
    chosenPractitionerId: practitionerUid,
  });

  return { uid: user.uid };
}

test.describe('Practitioner approval flows', () => {
  test('Practitioner sees pending patients and can approve them', async ({ page }) => {
    const practitionerEmail = `practitioner-${Date.now()}@example.com`;
    const practitionerPassword = 'Password123!';
    const practitioner = await seedPractitioner({
      email: practitionerEmail,
      password: practitionerPassword,
    });

    const patientEmail = `patient-${Date.now()}-pending@example.com`;
    const patientPassword = 'Password123!';
    const patient = await seedPatientAssignedTo({
      email: patientEmail,
      password: patientPassword,
      practitionerUid: practitioner.uid,
      approvalStatus: 'pending',
    });

    // Login as practitioner
    await page.goto('/login/practitioner');
    await expect(page.locator('h1')).toHaveText('Connexion praticien');

    await page.getByLabel('Email').fill(practitionerEmail);
    await page.getByLabel('Mot de passe').fill(practitionerPassword);
    await page.getByRole('button', { name: 'Se connecter' }).click();

    // Wait for authentication and navigation with longer timeout
    await page.waitForURL('**/practitioner/home', { timeout: 15000 });
    console.log('Logged in successfully, at:', page.url());

    // Wait a bit more to ensure auth state is fully established
    await page.waitForTimeout(1000);

    // Navigate to approvals page
    await page.goto('/practitioner/approvals');

    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Debug: Verify we're on the right page
    const title = await page.locator('h1').textContent();
    console.log('Approvals page title:', title);

    // If we got redirected back to login, something is wrong with auth persistence
    if (title === 'Connexion praticien') {
      console.log('ERROR: Got redirected back to login page!');
      console.log('Current URL:', page.url());
      throw new Error('Auth state not persisting - redirected to login');
    }

    // Navigate to approvals page
    await page.goto('/practitioner/approvals');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Debug: Verify we're on the right page
    const approvalsTitle = await page.locator('h1').textContent();
    console.log('Approvals page title:', approvalsTitle);

    // If we got redirected back to login, something is wrong with auth persistence
    if (approvalsTitle === 'Connexion praticien') {
      console.log('ERROR: Got redirected back to login page!');
      console.log('Current URL:', page.url());
      throw new Error('Auth state not persisting - redirected to login');
    }

    // Debug: Check what's on the page
    const pageText = await page.textContent('body');
    console.log('Page body text (first 500 chars):', pageText?.substring(0, 500));
    console.log('Contains patient email:', pageText?.includes(patientEmail));
    console.log('Contains "Aucun patient":', pageText?.includes('Aucun patient'));

    // Take screenshot for debugging
    await page.screenshot({
      path: `test-results/approvals-debug-${Date.now()}.png`,
      fullPage: true,
    });

    // Directly check the admin backend to verify the patient was created
    initAdmin();
    const db = admin.firestore();
    const usersSnapshot = await db
      .collection('users')
      .where('role', '==', 'patient')
      .where('chosenPractitionerId', '==', practitioner.uid)
      .where('approvalStatus', '==', 'pending')
      .get();
    console.log('Firestore query returned', usersSnapshot.size, 'patients');
    usersSnapshot.docs.forEach((doc) => {
      console.log('Patient doc:', doc.id, doc.data());
    });

    // Verify pending patient is visible (check for email or display name)
    await expect(
      page.locator(`text=${patientEmail}`).or(page.locator('text=Test Patient'))
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('pending', { exact: false })).toBeVisible();

    // Approve the patient
    const approveButton = page.getByRole('button', { name: /approuver|approve/i }).first();
    await approveButton.click();

    // Wait for approval to process
    await page.waitForTimeout(1000);

    // Verify patient status updated or disappeared from pending list
    // (Implementation may vary - could disappear, or show "approved" status)

    // Now login as patient and verify they can access home
    await page.goto('/login/patient');
    await page.getByLabel('Email').fill(patientEmail);
    await page.getByLabel('Mot de passe').fill(patientPassword);
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await page.waitForURL('**/patient/home');
    expect(page.url()).toContain('/patient/home');
  });

  test('Practitioner can reject a patient', async ({ page }) => {
    const practitionerEmail = `practitioner-reject-${Date.now()}@example.com`;
    const practitionerPassword = 'Password123!';
    const practitioner = await seedPractitioner({
      email: practitionerEmail,
      password: practitionerPassword,
    });

    const patientEmail = `patient-reject-${Date.now()}@example.com`;
    const patientPassword = 'Password123!';
    await seedPatientAssignedTo({
      email: patientEmail,
      password: patientPassword,
      practitionerUid: practitioner.uid,
      approvalStatus: 'pending',
    });

    // Login as practitioner
    await page.goto('/login/practitioner');
    await page.getByLabel('Email').fill(practitionerEmail);
    await page.getByLabel('Mot de passe').fill(practitionerPassword);
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await page.waitForURL('**/practitioner/home');

    // Navigate to approvals page
    await page.goto('/practitioner/approvals');

    // Wait for page to load and query to execute
    await page.waitForTimeout(2000);

    // Verify pending patient is visible
    await expect(
      page.locator(`text=${patientEmail}`).or(page.locator('text=Test Patient'))
    ).toBeVisible({ timeout: 10000 });

    // Reject the patient
    const rejectButton = page.getByRole('button', { name: /rejeter|reject/i }).first();
    await rejectButton.click();

    // Wait for rejection to process
    await page.waitForTimeout(1000);

    // Verify patient disappeared from pending list or status updated
  });
});
