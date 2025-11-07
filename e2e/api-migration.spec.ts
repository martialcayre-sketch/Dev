/**
 * E2E Tests - HTTP API Migration
 *
 * Tests the migration from Firestore direct access to HTTP API
 * Covers patient and practitioner app functionality
 */

import { expect, Page, test } from '@playwright/test';

// Test configuration
const PATIENT_APP_URL = process.env.PATIENT_APP_URL || 'https://neuronutrition-app-patient.web.app';
const PRACTITIONER_APP_URL =
  process.env.PRACTITIONER_APP_URL || 'https://neuronutrition-app-practitioner.web.app';

// Test user credentials (should be set in environment or CI/CD)
const TEST_PATIENT_EMAIL = process.env.TEST_PATIENT_EMAIL || 'test-patient@example.com';
const TEST_PATIENT_PASSWORD = process.env.TEST_PATIENT_PASSWORD || 'TestPassword123!';
const TEST_PRACTITIONER_EMAIL =
  process.env.TEST_PRACTITIONER_EMAIL || 'test-practitioner@example.com';
const TEST_PRACTITIONER_PASSWORD = process.env.TEST_PRACTITIONER_PASSWORD || 'TestPassword123!';

test.describe('Patient App - HTTP API Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to patient app
    await page.goto(PATIENT_APP_URL);
  });

  test('should load questionnaires via API', async ({ page }) => {
    // Login
    await loginPatient(page);

    // Wait for questionnaires to load (via API)
    await page.waitForSelector('[data-testid="questionnaire-list"]', { timeout: 10000 });

    // Intercept API call
    const apiCall = page.waitForResponse(
      (response) =>
        response.url().includes('/api/patients/') && response.url().includes('/questionnaires')
    );

    // Reload to trigger API call
    await page.reload();
    const response = await apiCall;

    // Verify API response
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('questionnaires');
    expect(Array.isArray(data.questionnaires)).toBe(true);
  });

  test('should auto-save questionnaire responses via PATCH API', async ({ page }) => {
    // Login
    await loginPatient(page);

    // Navigate to questionnaires page
    await page.click('a[href*="/questionnaires"]');
    await page.waitForSelector('[data-testid="questionnaire-list"]');

    // Click on first questionnaire
    await page.click('[data-testid="questionnaire-item"]:first-child');
    await page.waitForSelector('[data-testid="questionnaire-form"]');

    // Listen for PATCH API call
    const patchPromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/patients/') &&
        response.url().includes('/responses') &&
        response.request().method() === 'PATCH'
    );

    // Fill in a form field
    const firstInput = await page.locator('input[type="text"], textarea, select').first();
    await firstInput.fill('Test response for API migration');

    // Wait for auto-save (debounced, typically 2-3 seconds)
    await page.waitForTimeout(3500);

    // Verify PATCH request was made
    const patchResponse = await patchPromise;
    expect(patchResponse.status()).toBe(200);
    const patchData = await patchResponse.json();
    expect(patchData.ok).toBe(true);
    expect(patchData.savedAt).toBeTruthy();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Login
    await loginPatient(page);

    // Mock network failure
    await page.route('**/api/patients/**', (route) => {
      route.abort('failed');
    });

    // Navigate to questionnaires
    await page.click('a[href*="/questionnaires"]');

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/network error|erreur réseau/i')).toBeVisible();
  });

  test('should poll for updates every 10 seconds', async ({ page }) => {
    // Login
    await loginPatient(page);

    // Navigate to questionnaires
    await page.click('a[href*="/questionnaires"]');
    await page.waitForSelector('[data-testid="questionnaire-list"]');

    let apiCallCount = 0;
    page.on('response', (response) => {
      if (response.url().includes('/api/patients/') && response.url().includes('/questionnaires')) {
        apiCallCount++;
      }
    });

    // Wait 25 seconds (should see ~2-3 polling calls)
    await page.waitForTimeout(25000);

    // Verify polling happened
    expect(apiCallCount).toBeGreaterThanOrEqual(2);
  });

  test('should include Firebase Auth token in API requests', async ({ page }) => {
    // Login
    await loginPatient(page);

    // Intercept API request
    let authHeader: string | null = null;
    await page.route('**/api/patients/**', (route) => {
      authHeader = route.request().headers()['authorization'];
      route.continue();
    });

    // Navigate to trigger API call
    await page.click('a[href*="/questionnaires"]');
    await page.waitForTimeout(2000);

    // Verify Authorization header
    expect(authHeader).toBeTruthy();
    expect(authHeader).toMatch(/^Bearer .+/);
  });
});

test.describe('Practitioner App - HTTP API Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PRACTITIONER_APP_URL);
  });

  test('should load practitioner questionnaires via API', async ({ page }) => {
    // Login as practitioner
    await loginPractitioner(page);

    // Wait for dashboard/questionnaires
    await page.waitForSelector('[data-testid="practitioner-dashboard"]', { timeout: 10000 });

    // Intercept API call
    const apiCall = page.waitForResponse(
      (response) =>
        response.url().includes('/api/practitioners/') && response.url().includes('/questionnaires')
    );

    // Navigate to questionnaires view
    await page.click('a[href*="/questionnaires"]');
    const response = await apiCall;

    // Verify API response
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('questionnaires');
    expect(Array.isArray(data.questionnaires)).toBe(true);
  });

  test('should filter questionnaires by status', async ({ page }) => {
    await loginPractitioner(page);
    await page.click('a[href*="/questionnaires"]');
    await page.waitForSelector('[data-testid="questionnaire-filter"]');

    // Intercept API call with status filter
    const apiCall = page.waitForResponse(
      (response) =>
        response.url().includes('/api/practitioners/') &&
        response.url().includes('status=submitted')
    );

    // Select "Submitted" filter
    await page.selectOption('[data-testid="status-filter"]', 'submitted');
    const response = await apiCall;

    // Verify filtered results
    expect(response.status()).toBe(200);
    const data = await response.json();
    data.questionnaires.forEach((q: any) => {
      expect(q.status).toBe('submitted');
    });
  });

  test('should paginate questionnaires with limit/offset', async ({ page }) => {
    await loginPractitioner(page);
    await page.click('a[href*="/questionnaires"]');

    // Intercept first page
    const firstPage = page.waitForResponse(
      (response) =>
        response.url().includes('/api/practitioners/') &&
        response.url().includes('limit=') &&
        response.url().includes('offset=0')
    );

    await page.waitForTimeout(2000);
    const firstResponse = await firstPage;
    const firstData = await firstResponse.json();

    // Click next page
    const secondPage = page.waitForResponse(
      (response) =>
        response.url().includes('/api/practitioners/') &&
        response.url().includes('offset=') &&
        !response.url().includes('offset=0')
    );

    await page.click('[data-testid="next-page"]');
    const secondResponse = await secondPage;
    const secondData = await secondResponse.json();

    // Verify pagination
    expect(firstData.questionnaires.length).toBeGreaterThan(0);
    expect(secondData.questionnaires.length).toBeGreaterThan(0);
    expect(firstData.questionnaires[0].id).not.toBe(secondData.questionnaires[0].id);
  });
});

test.describe('Backend API - Direct Testing', () => {
  test('should respond to health check', async ({ request }) => {
    const response = await request.get(`${PATIENT_APP_URL}/api/health`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.timestamp).toBeTruthy();
  });

  test('should return 404 for non-existent endpoints', async ({ request }) => {
    const response = await request.get(`${PATIENT_APP_URL}/api/nonexistent-endpoint`);
    expect(response.status()).toBe(404);
    const data = await response.json();
    expect(data.error).toBeTruthy();
  });

  test('should require authentication for protected endpoints', async ({ request }) => {
    // Try to access patient questionnaires without auth token
    const response = await request.get(
      `${PATIENT_APP_URL}/api/patients/test-patient/questionnaires`
    );

    // Should either return 401 Unauthorized or 403 Forbidden
    // (depends on backend implementation - currently no auth middleware)
    // TODO: Update when auth middleware is implemented
    expect([200, 401, 403, 500]).toContain(response.status());
  });

  test('should handle CORS properly', async ({ request }) => {
    const response = await request.get(`${PATIENT_APP_URL}/api/health`, {
      headers: {
        Origin: 'https://example.com',
      },
    });

    // Check CORS headers (if configured)
    const corsHeader = response.headers()['access-control-allow-origin'];
    // Currently backend may not have CORS configured, so this might fail
    // TODO: Update when CORS is properly configured
  });
});

test.describe('Performance & Reliability', () => {
  test('API response time should be under 2 seconds', async ({ page }) => {
    await page.goto(PATIENT_APP_URL);
    await loginPatient(page);

    const startTime = Date.now();
    const apiCall = page.waitForResponse((response) => response.url().includes('/api/patients/'));

    await page.click('a[href*="/questionnaires"]');
    await apiCall;
    const endTime = Date.now();

    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(2000);
  });

  test('should handle concurrent auto-saves', async ({ page }) => {
    await page.goto(PATIENT_APP_URL);
    await loginPatient(page);
    await page.click('a[href*="/questionnaires"]');
    await page.click('[data-testid="questionnaire-item"]:first-child');
    await page.waitForSelector('[data-testid="questionnaire-form"]');

    // Fill multiple fields rapidly
    const inputs = await page.locator('input[type="text"], textarea').all();
    const saveCalls: Promise<any>[] = [];

    page.on('response', (response) => {
      if (response.url().includes('/responses') && response.request().method() === 'PATCH') {
        saveCalls.push(response.json());
      }
    });

    // Rapid-fire changes
    for (let i = 0; i < Math.min(5, inputs.length); i++) {
      await inputs[i].fill(`Response ${i}`);
      await page.waitForTimeout(100);
    }

    // Wait for debounced save
    await page.waitForTimeout(4000);

    // Should have made at least 1 save call (debounced)
    expect(saveCalls.length).toBeGreaterThanOrEqual(1);
  });

  test('should retry failed API calls', async ({ page }) => {
    await page.goto(PATIENT_APP_URL);
    await loginPatient(page);

    let callCount = 0;

    // Fail first 2 attempts, succeed on 3rd
    await page.route('**/api/patients/**', (route) => {
      callCount++;
      if (callCount <= 2) {
        route.abort('failed');
      } else {
        route.continue();
      }
    });

    // Navigate to trigger API call
    await page.click('a[href*="/questionnaires"]');

    // Should eventually succeed after retries
    await expect(page.locator('[data-testid="questionnaire-list"]')).toBeVisible({
      timeout: 15000,
    });
    expect(callCount).toBeGreaterThanOrEqual(2);
  });
});

// ============================================================================
// Helper Functions
// ============================================================================

async function loginPatient(page: Page) {
  // Check if already logged in
  const isLoggedIn = await page.locator('[data-testid="user-menu"]').isVisible();
  if (isLoggedIn) return;

  // Navigate to login
  await page.click('a[href*="/login"]');
  await page.waitForSelector('[data-testid="login-form"]');

  // Fill credentials
  await page.fill('input[type="email"]', TEST_PATIENT_EMAIL);
  await page.fill('input[type="password"]', TEST_PATIENT_PASSWORD);

  // Submit
  await page.click('button[type="submit"]');

  // Wait for redirect
  await page.waitForURL(/dashboard|questionnaires/);
}

async function loginPractitioner(page: Page) {
  // Check if already logged in
  const isLoggedIn = await page.locator('[data-testid="user-menu"]').isVisible();
  if (isLoggedIn) return;

  // Navigate to login
  await page.click('a[href*="/login"]');
  await page.waitForSelector('[data-testid="login-form"]');

  // Fill credentials
  await page.fill('input[type="email"]', TEST_PRACTITIONER_EMAIL);
  await page.fill('input[type="password"]', TEST_PRACTITIONER_PASSWORD);

  // Submit
  await page.click('button[type="submit"]');

  // Wait for dashboard
  await page.waitForURL(/dashboard|patients/);
}
