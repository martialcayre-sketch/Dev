/**
 * 🧪 Tests du Système de Détection d'Âge - NeuroNutrition
 *
 * Tests unitaires pour valider le comportement du système d'adaptation par âge
 */

import { describe, expect, test } from '@jest/globals';
import {
  AGE_THRESHOLDS,
  calculateAgeInYears,
  canAssignQuestionnaires,
  detectPatientAge,
  getAgeVariant,
} from '../src/age-detection';

describe('🧮 calculateAgeInYears', () => {
  test("calcule correctement l'âge en années", () => {
    const today = new Date('2025-11-14');

    // Mock de Date pour tests déterministes
    jest.useFakeTimers();
    jest.setSystemTime(today);

    expect(calculateAgeInYears('2010-05-15')).toBe(15); // Teen
    expect(calculateAgeInYears('2015-11-14')).toBe(10); // Kid
    expect(calculateAgeInYears('1990-03-20')).toBe(35); // Adult
    expect(calculateAgeInYears('2025-11-13')).toBe(0); // Bébé

    jest.useRealTimers();
  });

  test('gère les anniversaires non encore passés', () => {
    const today = new Date('2025-11-14');
    jest.useFakeTimers();
    jest.setSystemTime(today);

    // Anniversaire pas encore passé cette année
    expect(calculateAgeInYears('2010-12-25')).toBe(14); // Pas encore 15
    expect(calculateAgeInYears('2010-11-14')).toBe(15); // Anniversaire aujourd'hui

    jest.useRealTimers();
  });

  test('rejette les dates invalides', () => {
    expect(() => calculateAgeInYears('date-invalide')).toThrow('Date de naissance invalide');
    expect(() => calculateAgeInYears('')).toThrow('Date de naissance invalide');
  });
});

describe('🎯 getAgeVariant', () => {
  test("classe correctement les tranches d'âge", () => {
    expect(getAgeVariant(25)).toBe('adult');
    expect(getAgeVariant(18)).toBe('adult'); // Limite adult
    expect(getAgeVariant(17)).toBe('teen');
    expect(getAgeVariant(13)).toBe('teen'); // Limite teen
    expect(getAgeVariant(12)).toBe('kid');
    expect(getAgeVariant(5)).toBe('kid');
    expect(getAgeVariant(0)).toBe('kid');
  });

  test('respecte les seuils définis', () => {
    expect(getAgeVariant(AGE_THRESHOLDS.ADULT_MIN)).toBe('adult');
    expect(getAgeVariant(AGE_THRESHOLDS.ADULT_MIN - 1)).toBe('teen');
    expect(getAgeVariant(AGE_THRESHOLDS.TEEN_MIN)).toBe('teen');
    expect(getAgeVariant(AGE_THRESHOLDS.TEEN_MIN - 1)).toBe('kid');
  });
});

describe('🧠 detectPatientAge', () => {
  const mockPatient = {
    uid: 'patient-123',
    birthDate: '2010-05-15',
  };

  beforeEach(() => {
    const today = new Date('2025-11-14');
    jest.useFakeTimers();
    jest.setSystemTime(today);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('détecte correctement un adolescent', () => {
    const result = detectPatientAge(mockPatient);

    expect(result.isValid).toBe(true);
    expect(result.ageInYears).toBe(15);
    expect(result.variant).toBe('teen');
    expect(result.error).toBeUndefined();
  });

  test('détecte un enfant', () => {
    const kidPatient = {
      uid: 'kid-123',
      birthDate: '2018-01-01',
    };

    const result = detectPatientAge(kidPatient);

    expect(result.isValid).toBe(true);
    expect(result.ageInYears).toBe(7);
    expect(result.variant).toBe('kid');
  });

  test('détecte un adulte', () => {
    const adultPatient = {
      uid: 'adult-123',
      birthDate: '1985-06-10',
    };

    const result = detectPatientAge(adultPatient);

    expect(result.isValid).toBe(true);
    expect(result.ageInYears).toBe(40);
    expect(result.variant).toBe('adult');
  });

  test('gère les patients sans date de naissance', () => {
    const patientSansBirthDate = {
      uid: 'no-birth-123',
    };

    const result = detectPatientAge(patientSansBirthDate);

    expect(result.isValid).toBe(false);
    expect(result.variant).toBe('adult'); // Fallback
    expect(result.error).toContain('Date de naissance manquante');
  });

  test('rejette les âges invalides', () => {
    const patientFutur = {
      uid: 'future-123',
      birthDate: '2030-01-01',
    };

    const result = detectPatientAge(patientFutur);

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Âge invalide');
  });

  test('rejette les âges excessifs', () => {
    const patientTresVieux = {
      uid: 'old-123',
      birthDate: '1850-01-01',
    };

    const result = detectPatientAge(patientTresVieux);

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Âge invalide');
  });
});

describe('🔒 canAssignQuestionnaires', () => {
  beforeEach(() => {
    const today = new Date('2025-11-14');
    jest.useFakeTimers();
    jest.setSystemTime(today);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("autorise l'assignation avec identification valide", () => {
    const patientValide = {
      uid: 'valid-123',
      birthDate: '2010-05-15',
    };

    const result = canAssignQuestionnaires(patientValide);

    expect(result.canAssign).toBe(true);
    expect(result.requiresIdentification).toBe(false);
  });

  test("refuse l'assignation sans identification", () => {
    const patientSansIdent = {
      uid: 'no-ident-123',
    };

    const result = canAssignQuestionnaires(patientSansIdent);

    expect(result.canAssign).toBe(false);
    expect(result.requiresIdentification).toBe(true);
    expect(result.reason).toContain('identification');
  });

  test("refuse l'assignation avec données invalides", () => {
    const patientInvalide = {
      uid: 'invalid-123',
      birthDate: 'date-invalide',
    };

    const result = canAssignQuestionnaires(patientInvalide);

    expect(result.canAssign).toBe(false);
  });
});

describe("🎯 Cas d'usage réels", () => {
  beforeEach(() => {
    const today = new Date('2025-11-14');
    jest.useFakeTimers();
    jest.setSystemTime(today);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('Scénario: Enfant de 8 ans avec parents', () => {
    const enfant = {
      uid: 'enfant-8ans',
      birthDate: '2017-03-10',
    };

    const detection = detectPatientAge(enfant);
    const validation = canAssignQuestionnaires(enfant);

    expect(detection.ageInYears).toBe(8);
    expect(detection.variant).toBe('kid');
    expect(validation.canAssign).toBe(true);

    // L'enfant devrait nécessiter l'aide des parents
    // (cette logique sera dans les composants React)
  });

  test('Scénario: Adolescent de 16 ans autonome', () => {
    const ado = {
      uid: 'ado-16ans',
      birthDate: '2009-07-22',
    };

    const detection = detectPatientAge(ado);

    expect(detection.ageInYears).toBe(16);
    expect(detection.variant).toBe('teen');
    // Les adolescents peuvent répondre seuls
  });

  test('Scénario: Adulte standard', () => {
    const adulte = {
      uid: 'adulte-standard',
      birthDate: '1990-11-14',
    };

    const detection = detectPatientAge(adulte);

    expect(detection.ageInYears).toBe(35);
    expect(detection.variant).toBe('adult');
  });

  test('Scénario: Patient sans identification -> Blocage', () => {
    const patientAnonyme = {
      uid: 'anonyme-patient',
    };

    const validation = canAssignQuestionnaires(patientAnonyme);

    expect(validation.canAssign).toBe(false);
    expect(validation.requiresIdentification).toBe(true);

    // Conforme aux spécifications:
    // "Pas d'assignation possible sans avoir rempli la fiche d'identification"
  });
});

describe('🔄 Intégration avec assignQuestionnaires', () => {
  test("Mock d'intégration avec la Cloud Function", async () => {
    // Simule le comportement de assignQuestionnaires.ts
    const mockPatientData = {
      uid: 'integration-test',
      identification: {
        birthDate: '2012-09-15',
      },
    };

    const today = new Date('2025-11-14');
    jest.useFakeTimers();
    jest.setSystemTime(today);

    // Étapes de la Cloud Function
    const ageValidation = canAssignQuestionnaires({
      uid: mockPatientData.uid,
      birthDate: mockPatientData.identification.birthDate,
    });

    expect(ageValidation.canAssign).toBe(true);

    if (ageValidation.canAssign) {
      const ageResult = detectPatientAge({
        uid: mockPatientData.uid,
        birthDate: mockPatientData.identification.birthDate,
      });

      expect(ageResult.ageInYears).toBe(13);
      expect(ageResult.variant).toBe('teen');

      // Les questionnaires seraient créés avec:
      // - patientAge: 13
      // - ageVariant: 'teen'
      // - requiresParentAssistance: false
    }

    jest.useRealTimers();
  });
});
