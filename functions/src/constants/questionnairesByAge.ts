/**
 * Templates de questionnaires organisés par tranche d'âge
 * Conforme au Master Document V3 - Assignment automatique par âge
 */

export type AgeVariant = 'adult' | 'teen' | 'kid';

export interface QuestionnaireTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedMinutes: number;
  ageVariant: AgeVariant;
}

/**
 * Questionnaires pour ADULTES (18+ ans)
 */
export const ADULT_QUESTIONNAIRES: QuestionnaireTemplate[] = [
  {
    id: 'plaintes-et-douleurs',
    title: 'Plaintes & Douleurs',
    description: 'Évaluation des douleurs et inconforts physiques',
    category: 'Mode de vie',
    estimatedMinutes: 8,
    ageVariant: 'adult',
  },
  {
    id: 'life-journey',
    title: 'Parcours de Vie',
    description: 'Analyse complète de votre mode de vie et habitudes',
    category: 'Mode de vie',
    estimatedMinutes: 12,
    ageVariant: 'adult',
  },
  {
    id: 'dnsm',
    title: 'Neurotransmetteurs (DNSM)',
    description: "Évaluation de l'équilibre des neurotransmetteurs",
    category: 'Neuro-psychologie',
    estimatedMinutes: 7,
    ageVariant: 'adult',
  },
  {
    id: 'alimentaire-siin',
    title: 'Alimentation (SIIN)',
    description: 'Analyse nutritionnelle complète selon le protocole SIIN',
    category: 'Nutrition',
    estimatedMinutes: 15,
    ageVariant: 'adult',
  },
];

/**
 * Questionnaires pour ADOLESCENTS (13-18 ans)
 */
export const TEEN_QUESTIONNAIRES: QuestionnaireTemplate[] = [
  {
    id: 'plaintes-douleurs-teen',
    title: 'Douleurs & Stress (Ado)',
    description: "Évaluation adaptée des douleurs et du stress chez l'adolescent",
    category: 'Mode de vie',
    estimatedMinutes: 6,
    ageVariant: 'teen',
  },
  {
    id: 'life-journey-teen',
    title: 'Mon Parcours (Ado)',
    description: 'Questionnaire sur ton mode de vie et tes habitudes',
    category: 'Mode de vie',
    estimatedMinutes: 8,
    ageVariant: 'teen',
  },
  {
    id: 'dnsm-teen',
    title: 'Mes Émotions (Ado)',
    description: 'Comprendre tes émotions et ton équilibre psychologique',
    category: 'Neuro-psychologie',
    estimatedMinutes: 5,
    ageVariant: 'teen',
  },
  {
    id: 'alimentaire-teen',
    title: 'Mon Alimentation (Ado)',
    description: 'Analyse de tes habitudes alimentaires et préférences',
    category: 'Nutrition',
    estimatedMinutes: 10,
    ageVariant: 'teen',
  },
];

/**
 * Questionnaires pour ENFANTS (6-12 ans)
 */
export const KID_QUESTIONNAIRES: QuestionnaireTemplate[] = [
  {
    id: 'plaintes-douleurs-kid',
    title: 'Mes Bobos (Enfant)',
    description: 'Questionnaire ludique sur les petits maux et douleurs',
    category: 'Mode de vie',
    estimatedMinutes: 4,
    ageVariant: 'kid',
  },
  {
    id: 'mode-de-vie-kid',
    title: 'Ma Journée (Enfant)',
    description: 'Raconte-nous ta journée et tes activités préférées',
    category: 'Mode de vie',
    estimatedMinutes: 6,
    ageVariant: 'kid',
  },
  {
    id: 'dnsm-kid',
    title: 'Mes Humeurs (Enfant)',
    description: 'Questionnaire avec pictogrammes sur les émotions',
    category: 'Neuro-psychologie',
    estimatedMinutes: 4,
    ageVariant: 'kid',
  },
  {
    id: 'alimentaire-kid',
    title: 'Ce que je Mange (Enfant)',
    description: 'Questionnaire visuel sur les aliments et les repas',
    category: 'Nutrition',
    estimatedMinutes: 5,
    ageVariant: 'kid',
  },
];

/**
 * Mapping des questionnaires par tranche d'âge
 */
export const QUESTIONNAIRE_TEMPLATES_BY_AGE: Record<AgeVariant, QuestionnaireTemplate[]> = {
  adult: ADULT_QUESTIONNAIRES,
  teen: TEEN_QUESTIONNAIRES,
  kid: KID_QUESTIONNAIRES,
};

/**
 * Obtient les templates de questionnaires pour une tranche d'âge donnée
 */
export function getQuestionnaireTemplatesForAge(ageVariant: AgeVariant): QuestionnaireTemplate[] {
  return QUESTIONNAIRE_TEMPLATES_BY_AGE[ageVariant] || ADULT_QUESTIONNAIRES;
}

/**
 * Obtient un template de questionnaire spécifique par ID et variante d'âge
 */
export function getQuestionnaireTemplate(
  baseId: string,
  ageVariant: AgeVariant
): QuestionnaireTemplate | null {
  const templates = getQuestionnaireTemplatesForAge(ageVariant);

  // Pour les adultes, chercher l'ID exact
  if (ageVariant === 'adult') {
    return templates.find((t) => t.id === baseId) || null;
  }

  // Pour teens et kids, chercher avec le suffixe
  const expectedId = `${baseId}-${ageVariant}`;
  return templates.find((t) => t.id === expectedId) || null;
}

/**
 * Vérifie si un questionnaire existe pour une tranche d'âge donnée
 */
export function hasQuestionnaireForAge(baseId: string, ageVariant: AgeVariant): boolean {
  return getQuestionnaireTemplate(baseId, ageVariant) !== null;
}

/**
 * Obtient le nombre total de questionnaires pour une tranche d'âge
 */
export function getQuestionnaireCountForAge(ageVariant: AgeVariant): number {
  return getQuestionnaireTemplatesForAge(ageVariant).length;
}

/**
 * Obtient la durée totale estimée pour tous les questionnaires d'une tranche d'âge
 */
export function getTotalEstimatedMinutes(ageVariant: AgeVariant): number {
  return getQuestionnaireTemplatesForAge(ageVariant).reduce(
    (total, template) => total + template.estimatedMinutes,
    0
  );
}
