import { test, expect } from '@playwright/test';

test('app loads correctly', async ({ page }) => {
  await page.goto('/');

  // Vérifie le titre de la page
  await expect(page).toHaveTitle(/NeuroNutrition/);

  // Vérifie que la page se charge sans erreur
  const status = await page.evaluate(() => document.readyState);
  expect(status).toBe('complete');
});
