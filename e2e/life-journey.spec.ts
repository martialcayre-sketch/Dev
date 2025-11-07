import { expect, test } from '@playwright/test';

/**
 * Test E2E complet du questionnaire Life Journey
 * Flow: Patient assign → Patient fill → Patient submit → Practitioner review
 */

const PATIENT_EMAIL = 'patient-test-lifejourney@example.com';
const PATIENT_PASSWORD = 'Test123456!';
const PRACTITIONER_EMAIL = 'practitioner-test@example.com';
const PRACTITIONER_PASSWORD = 'Test123456!';

test.describe('Life Journey Questionnaire E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Note: Ce test nécessite que les comptes existent déjà
    // En environnement de test, ils doivent être créés au préalable
  });

  test('Patient can fill and submit Life Journey questionnaire', async ({ page }) => {
    // 1. Login patient
    await page.goto('https://neuronutrition-app-patient.web.app/login');
    await page.fill('input[type="email"]', PATIENT_EMAIL);
    await page.fill('input[type="password"]', PATIENT_PASSWORD);
    await page.click('button[type="submit"]');

    // Attendre la navigation après login
    await page.waitForURL('**/dashboard');

    // 2. Naviguer vers les questionnaires
    await page.click('text=Consultation');
    await expect(page).toHaveURL(/.*questionnaires/);

    // 3. Trouver et ouvrir Life Journey
    const lifeJourneyCard = page.locator('text=Mode de vie – 7 Sphères Vitales').first();
    await expect(lifeJourneyCard).toBeVisible();
    await lifeJourneyCard.click();

    // 4. Vérifier que la page Life Journey s'affiche
    await expect(page.locator('h2:has-text("Mode de vie – 7 Sphères Vitales")')).toBeVisible();

    // 5. Remplir une sphère (Sommeil)
    await page.click('text=Votre sommeil');

    // Attendre le modal
    await expect(page.locator('text=Votre sommeil').nth(1)).toBeVisible();

    // Répondre aux questions de la sphère Sommeil
    const questions = page
      .locator('button')
      .filter({ hasText: /Excellent sommeil|Tout à fait satisfaisant|Jamais/ });
    const count = await questions.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      await questions.nth(i).click();
    }

    // Valider la sphère
    await page.click('text=Valider la sphère');

    // 6. Vérifier l'auto-save (indicateur visuel)
    await expect(page.locator('text=Sauvegarde...')).toBeVisible({ timeout: 2000 });
    await expect(page.locator('text=Sauvegarde...')).not.toBeVisible({ timeout: 5000 });

    // 7. Remplir rapidement toutes les autres sphères
    const spheres = [
      'Votre rythme biologique',
      'Votre adaptation et le stress',
      'Votre activité physique',
      'Votre exposition aux toxiques',
      'Votre relation aux autres',
      'Votre mode alimentaire',
    ];

    for (const sphere of spheres) {
      await page.click(`text=${sphere}`);
      await page.waitForTimeout(500);

      // Cliquer sur la première option de chaque question (réponse rapide)
      const firstOptions = page.locator('button').filter({ hasText: /pts\)/ });
      const optCount = await firstOptions.count();

      for (let i = 0; i < Math.min(optCount, 10); i++) {
        await firstOptions.nth(i).click();
        await page.waitForTimeout(100);
      }

      await page.click('text=Valider la sphère');
      await page.waitForTimeout(300);
    }

    // 8. Vérifier que le radar s'affiche avec des données
    await expect(page.locator('text=Score global:')).toBeVisible();

    // 9. Soumettre le questionnaire
    await page.click('button:has-text("Terminer et valider")');

    // 10. Vérifier la redirection vers la liste
    await expect(page).toHaveURL(/.*questionnaires/, { timeout: 10000 });

    // 11. Vérifier que Life Journey est marqué comme submitted
    const submittedCard = page.locator('text=Mode de vie').first();
    await expect(submittedCard).toBeVisible();
  });

  test('Practitioner can view Life Journey radar', async ({ page }) => {
    // 1. Login practitioner
    await page.goto('https://neuronutrition-app-practitioner.web.app/login');
    await page.fill('input[type="email"]', PRACTITIONER_EMAIL);
    await page.fill('input[type="password"]', PRACTITIONER_PASSWORD);
    await page.click('button[type="submit"]');

    // Attendre la navigation après login
    await page.waitForURL('**/dashboard');

    // 2. Naviguer vers les patients
    await page.click('text=Patients');

    // 3. Trouver le patient de test
    const patientLink = page.locator(`text=${PATIENT_EMAIL}`).first();
    await expect(patientLink).toBeVisible({ timeout: 10000 });
    await patientLink.click();

    // 4. Vérifier que le radar Life Journey s'affiche
    await expect(page.locator('text=Mode de vie – 7 Sphères Vitales')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator('text=Score global:')).toBeVisible();

    // 5. Vérifier que toutes les sphères sont affichées
    await expect(page.locator('text=Sommeil')).toBeVisible();
    await expect(page.locator('text=Rythme biologique')).toBeVisible();
    await expect(page.locator('text=Stress')).toBeVisible();
    await expect(page.locator('text=Activité physique')).toBeVisible();

    // 6. Vérifier le questionnaire dans la liste
    await page.click('text=Voir tous');
    await expect(page.locator('text=Mode de vie – 7 Sphères Vitales')).toBeVisible();
  });

  test('Auto-save works during questionnaire filling', async ({ page }) => {
    // 1. Login patient
    await page.goto('https://neuronutrition-app-patient.web.app/login');
    await page.fill('input[type="email"]', PATIENT_EMAIL);
    await page.fill('input[type="password"]', PATIENT_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard');

    // 2. Ouvrir Life Journey
    await page.click('text=Consultation');
    await page.click('text=Mode de vie – 7 Sphères Vitales');

    // 3. Ouvrir une sphère et répondre à une question
    await page.click('text=Votre sommeil');
    const firstOption = page.locator('button').filter({ hasText: /pts\)/ }).first();
    await firstOption.click();

    // 4. Vérifier que l'indicateur de sauvegarde apparaît
    await expect(page.locator('text=Sauvegarde...')).toBeVisible({ timeout: 3000 });

    // 5. Attendre la fin de la sauvegarde
    await expect(page.locator('text=Sauvegarde...')).not.toBeVisible({ timeout: 5000 });

    // 6. Recharger la page pour vérifier que la réponse est persistée
    await page.reload();
    await page.click('text=Votre sommeil');

    // La réponse devrait toujours être sélectionnée (vérification visuelle du bouton actif)
    await expect(firstOption).toHaveClass(/border-nn-primary-500/);
  });

  test('Double-write to root and subcollection works', async ({ page, context }) => {
    // Ce test nécessite un accès direct à Firestore via Firebase Admin SDK
    // ou via l'API REST Firebase
    // Pour une vraie validation, utiliser un script Node.js séparé qui vérifie:
    // 1. questionnaires/{life-journey} existe avec patientUid
    // 2. patients/{uid}/questionnaires/{life-journey} existe avec mêmes données
    // 3. patients/{uid}/lifejourney/{id} existe (legacy)
    // 4. users/{uid}/surveys contient une entrée

    test.skip('Requires Firebase Admin SDK access');
  });
});
