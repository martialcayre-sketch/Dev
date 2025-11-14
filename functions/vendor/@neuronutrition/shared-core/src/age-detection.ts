/**
 * 🧠 NeuroNutrition - Système de Détection d'Âge
 *
 * Détection automatique de l'âge du patient et sélection des variantes questionnaires
 * conforme au Master Document V3
 */

/**
 * Types d'âge supportés pour les questionnaires
 */
export type AgeVariant = 'adult' | 'teen' | 'kid';

/**
 * Configuration des seuils d'âge
 */
export const AGE_THRESHOLDS = {
  ADULT_MIN: 18, // 18+ ans = adult
  TEEN_MIN: 13, // 13-17 ans = teen
  KID_MAX: 12, // 0-12 ans = kid
} as const;

/**
 * Interface pour les données patient nécessaires à la détection d'âge
 */
export interface PatientAgeData {
  birthDate?: string | Date;
  uid: string;
}

/**
 * Résultat de la détection d'âge
 */
export interface AgeDetectionResult {
  ageInYears: number;
  variant: AgeVariant;
  isValid: boolean;
  error?: string;
}

/**
 * Calcule l'âge en années à partir d'une date de naissance
 */
export function calculateAgeInYears(birthDate: string | Date): number {
  const birth = new Date(birthDate);
  const today = new Date();

  if (isNaN(birth.getTime())) {
    throw new Error('Date de naissance invalide');
  }

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  // Ajustement si l'anniversaire n'est pas encore passé cette année
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Détermine la variante questionnaire basée sur l'âge
 */
export function getAgeVariant(ageInYears: number): AgeVariant {
  if (ageInYears >= AGE_THRESHOLDS.ADULT_MIN) {
    return 'adult';
  } else if (ageInYears >= AGE_THRESHOLDS.TEEN_MIN) {
    return 'teen';
  } else {
    return 'kid';
  }
}

/**
 * 🎯 FONCTION PRINCIPALE - Détection automatique d'âge patient
 *
 * Analyse les données patient et détermine la variante questionnaire appropriée
 */
export function detectPatientAge(patient: PatientAgeData): AgeDetectionResult {
  try {
    // Vérification date de naissance
    if (!patient.birthDate) {
      return {
        ageInYears: 0,
        variant: 'adult', // Fallback par défaut
        isValid: false,
        error: 'Date de naissance manquante - identification patient requise',
      };
    }

    // Calcul de l'âge
    const ageInYears = calculateAgeInYears(patient.birthDate);

    // Validation âge réaliste
    if (ageInYears < 0 || ageInYears > 120) {
      return {
        ageInYears,
        variant: 'adult',
        isValid: false,
        error: `Âge invalide: ${ageInYears} ans`,
      };
    }

    // Détermination de la variante
    const variant = getAgeVariant(ageInYears);

    return {
      ageInYears,
      variant,
      isValid: true,
    };
  } catch (error) {
    return {
      ageInYears: 0,
      variant: 'adult',
      isValid: false,
      error: error instanceof Error ? error.message : 'Erreur détection âge',
    };
  }
}

/**
 * 🔍 Validation: Vérifie si un patient peut recevoir des questionnaires
 *
 * Conforme aux spécifications: "Pas d'assignation possible sans identification"
 */
export function canAssignQuestionnaires(patient: PatientAgeData): {
  canAssign: boolean;
  reason?: string;
  requiresIdentification: boolean;
} {
  const ageResult = detectPatientAge(patient);

  if (!ageResult.isValid) {
    return {
      canAssign: false,
      reason: ageResult.error || 'Données patient invalides',
      requiresIdentification: !patient.birthDate,
    };
  }

  return {
    canAssign: true,
    requiresIdentification: false,
  };
}

/**
 * 📊 Utilitaire: Obtient les informations d'âge formatées pour l'affichage
 */
export function getAgeDisplayInfo(patient: PatientAgeData): {
  ageText: string;
  variantText: string;
  needsIdentification: boolean;
} {
  const result = detectPatientAge(patient);

  if (!result.isValid) {
    return {
      ageText: 'Âge non défini',
      variantText: 'Identification requise',
      needsIdentification: true,
    };
  }

  const variantLabels: Record<AgeVariant, string> = {
    adult: 'Adulte',
    teen: 'Adolescent',
    kid: 'Enfant',
  };

  return {
    ageText: `${result.ageInYears} ans`,
    variantText: variantLabels[result.variant],
    needsIdentification: false,
  };
}

/**
 * 🧪 Export pour tests unitaires
 */
export const AgeDetectionTesting = {
  AGE_THRESHOLDS,
  calculateAgeInYears,
  getAgeVariant,
} as const;
