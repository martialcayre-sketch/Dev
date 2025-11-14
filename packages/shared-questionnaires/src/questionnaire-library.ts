/**
 * 🧠 NeuroNutrition - Registre Global des Variantes Questionnaires
 *
 * Point d'entrée centralisé pour tous les questionnaires avec leurs variantes d'âge
 */

import type { AgeVariant, Questionnaire } from './types';

// Import des questionnaires de base
import { STRESS_QUESTIONNAIRE_VARIANTS } from './variants/stress-variants';

/**
 * 📚 BIBLIOTHÈQUE COMPLÈTE DES QUESTIONNAIRES
 *
 * Structure: { [templateId]: { adult, teen, kid } }
 */
export const QUESTIONNAIRE_LIBRARY = {
  'questionnaire-de-stress-siin-def-pro': STRESS_QUESTIONNAIRE_VARIANTS,

  // 🚀 TODO: Ajouter autres questionnaires
  // 'questionnaire-mode-de-vie': MODE_DE_VIE_VARIANTS,
  // 'questionnaire-sommeil': SOMMEIL_VARIANTS,
  // 'questionnaire-alimentaire': ALIMENTAIRE_VARIANTS,
} as const;

/**
 * 🎯 FONCTION PRINCIPALE - Accès questionnaire par ID et âge
 */
export function getQuestionnaireById(
  templateId: string,
  ageVariant: AgeVariant
): Questionnaire | null {
  const variants = QUESTIONNAIRE_LIBRARY[templateId as keyof typeof QUESTIONNAIRE_LIBRARY];

  if (!variants) {
    console.warn(`Questionnaire template '${templateId}' not found in library`);
    return null;
  }

  return variants[ageVariant];
}

/**
 * 📋 Liste de tous les templates disponibles
 */
export function getAvailableTemplates(): Array<{
  id: string;
  title: string;
  category: string;
  hasVariants: boolean;
}> {
  return Object.entries(QUESTIONNAIRE_LIBRARY).map(([id, variants]) => ({
    id,
    title: variants.adult.metadata.title,
    category: variants.adult.metadata.category,
    hasVariants: !!variants.teen && !!variants.kid,
  }));
}

/**
 * 🔍 Recherche questionnaires par catégorie
 */
export function getQuestionnairesByCategory(
  category: string,
  ageVariant: AgeVariant = 'adult'
): Questionnaire[] {
  return Object.values(QUESTIONNAIRE_LIBRARY)
    .map((variants) => variants[ageVariant])
    .filter((questionnaire) => questionnaire.metadata.category === category);
}

/**
 * 📊 Statistiques de la bibliothèque
 */
export function getLibraryStats(): {
  totalTemplates: number;
  totalVariants: number;
  categoriesCount: number;
  categories: string[];
} {
  const templates = Object.values(QUESTIONNAIRE_LIBRARY);
  const categories = [...new Set(templates.map((v) => v.adult.metadata.category))];

  return {
    totalTemplates: templates.length,
    totalVariants: templates.length * 3, // adult + teen + kid
    categoriesCount: categories.length,
    categories,
  };
}
