import { expect, test } from '@playwright/test';

// Placeholder E2E test – requires proper auth setup & data seeding later.
// Flow: visit patient app, ensure health endpoint responds (mock), navigate questionnaires page.

test('patient app basic navigation', async ({ page }) => {
  await page.goto('https://neuronutrition-app-patient.web.app');
  await expect(page).toHaveTitle(/NeuroNutrition/i);
  // TODO: add login, questionnaire listing assertions.
});
