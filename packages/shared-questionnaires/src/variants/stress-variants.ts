/**
 * 🧠 Tests des Variantes d'Âge - Questionnaire Stress
 *
 * Démo de génération automatique teen/kid à partir du template adult
 */

import { generateAgeVariant } from '../age-variants';
import { questionnaire_de_stress_siin_def_pro } from '../questionnaires/stress/questionnaire-de-stress-siin-def-pro';
import type { AgeVariant } from '../types';

// 🎯 Génération des variantes pour le questionnaire de stress
export const stress_questionnaire_teen = generateAgeVariant(
  questionnaire_de_stress_siin_def_pro,
  'teen'
);

export const stress_questionnaire_kid = generateAgeVariant(
  questionnaire_de_stress_siin_def_pro,
  'kid'
);

// 📋 Export des trois variantes du questionnaire de stress
export const STRESS_QUESTIONNAIRE_VARIANTS = {
  adult: questionnaire_de_stress_siin_def_pro,
  teen: stress_questionnaire_teen,
  kid: stress_questionnaire_kid,
} as const;

/**
 * 🔍 Fonction utilitaire pour obtenir le bon questionnaire selon l'âge
 */
export function getStressQuestionnaireForAge(ageVariant: AgeVariant) {
  return STRESS_QUESTIONNAIRE_VARIANTS[ageVariant];
}

/**
 * 📊 Exemple d'utilisation dans le code
 *
 * ```typescript
 * const ageResult = detectPatientAge({ uid: 'patient123', birthDate: '2010-05-15' });
 * const questionnaire = getStressQuestionnaireForAge(ageResult.variant);
 *
 * console.log(questionnaire.metadata.title);
 * // Adult: "questionnaire de stress siin def pro"
 * // Teen: "🧑 Test de stress pour ados"
 * // Kid: "🧒 Comment tu te sens ?"
 * ```
 */
