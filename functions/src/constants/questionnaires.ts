export interface QuestionnaireTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
}

// Harmonised single source of truth
export const DEFAULT_QUESTIONNAIRES: QuestionnaireTemplate[] = [
  {
    id: 'plaintes-et-douleurs',
    title: 'Mes plaintes actuelles et troubles ressentis',
    category: 'Mode de vie',
    description: "Évaluez l'intensité de vos troubles actuels (fatigue, douleurs, digestion, etc.)",
  },
  {
    id: 'life-journey',
    title: 'Mode de vie – 7 Sphères Vitales',
    category: 'Mode de vie SIIN',
    description: 'Questionnaire contextuel de mode de vie (SIIN) avec radar de scoring par sphère',
  },
  {
    id: 'nutri-assessment',
    title: 'Bilan nutrition PNNS5 × SIIN',
    category: 'Nutrition',
    description:
      'Questionnaire PNNS5 × SIIN avec radar nutritionnel et recommandations personnalisées',
  },
  {
    id: 'dnsm',
    title: 'Questionnaire Dopamine-Noradrénaline-Sérotonine-Mélatonine',
    category: 'Neuro-psychologie',
    description: 'Évaluez vos neurotransmetteurs et votre équilibre hormonal (7 questions)',
  },
];
