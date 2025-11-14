/**
 * 🧠 NeuroNutrition - Service de Scoring DNSM Centralisé
 *
 * Service backend pour calcul sécurisé des scores DNSM
 * (Migré depuis apps/patient-vite/src/hooks/useDNSMScore.ts)
 */

export interface DNSMScores {
  dopamine: number;
  noradrenaline: number;
  serotonine: number;
  melatonine: number;
  total: number;
  dopaminePercent: number;
  noradrenalinePercent: number;
  serotoninePercent: number;
  melatoninePercent: number;
  globalPercent: number;
}

export interface DNSMInterpretation {
  axis: 'dopamine' | 'noradrenaline' | 'serotonine' | 'melatonine';
  score: number;
  percent: number;
  status: 'normal' | 'probable' | 'marquee';
  label: string;
  color: string;
  recommendation?: string;
}

export interface DNSMScoringResult {
  scores: DNSMScores;
  interpretations: DNSMInterpretation[];
  isComplete: boolean;
  calculatedAt: string;
  version: string;
}

/**
 * 🎯 Service principal de calcul des scores DNSM
 */
export class DNSMScoringService {
  private static readonly VERSION = '1.0.0';
  private static readonly MAX_SCORE_PER_AXIS = 40;
  private static readonly QUESTIONS_PER_AXIS = 10;
  private static readonly MAX_TOTAL_SCORE = 160;

  /**
   * Calcule les scores DNSM à partir des réponses questionnaire
   */
  public static calculateScores(responses: Record<string, number>): DNSMScoringResult {
    const scores = this.computeRawScores(responses);
    const interpretations = this.generateInterpretations(scores);
    const isComplete = this.validateCompleteness(responses);

    return {
      scores,
      interpretations,
      isComplete,
      calculatedAt: new Date().toISOString(),
      version: this.VERSION,
    };
  }

  /**
   * Calcul des scores bruts par axe neurotransmetteur
   */
  private static computeRawScores(responses: Record<string, number>): DNSMScores {
    // Définition des questions par axe (échelle Likert 0-4)
    const dopamineIds = Array.from({ length: this.QUESTIONS_PER_AXIS }, (_, i) => `da-${i + 1}`);
    const noradrenalineIds = Array.from(
      { length: this.QUESTIONS_PER_AXIS },
      (_, i) => `na-${i + 1}`
    );
    const serotonineIds = Array.from({ length: this.QUESTIONS_PER_AXIS }, (_, i) => `se-${i + 1}`);
    const melatonineIds = Array.from({ length: this.QUESTIONS_PER_AXIS }, (_, i) => `me-${i + 1}`);

    // Calcul scores bruts
    const dopamine = dopamineIds.reduce((sum, id) => sum + (responses[id] || 0), 0);
    const noradrenaline = noradrenalineIds.reduce((sum, id) => sum + (responses[id] || 0), 0);
    const serotonine = serotonineIds.reduce((sum, id) => sum + (responses[id] || 0), 0);
    const melatonine = melatonineIds.reduce((sum, id) => sum + (responses[id] || 0), 0);

    const total = dopamine + noradrenaline + serotonine + melatonine;

    // Normalisation en pourcentages (0-100)
    const dopaminePercent = Math.round((dopamine / this.MAX_SCORE_PER_AXIS) * 100);
    const noradrenalinePercent = Math.round((noradrenaline / this.MAX_SCORE_PER_AXIS) * 100);
    const serotoninePercent = Math.round((serotonine / this.MAX_SCORE_PER_AXIS) * 100);
    const melatoninePercent = Math.round((melatonine / this.MAX_SCORE_PER_AXIS) * 100);
    const globalPercent = Math.round((total / this.MAX_TOTAL_SCORE) * 100);

    return {
      dopamine,
      noradrenaline,
      serotonine,
      melatonine,
      total,
      dopaminePercent,
      noradrenalinePercent,
      serotoninePercent,
      melatoninePercent,
      globalPercent,
    };
  }

  /**
   * Génération des interprétations cliniques par axe
   */
  private static generateInterpretations(scores: DNSMScores): DNSMInterpretation[] {
    const axes: Array<{
      key: keyof Pick<DNSMScores, 'dopamine' | 'noradrenaline' | 'serotonine' | 'melatonine'>;
      percentKey: keyof Pick<
        DNSMScores,
        'dopaminePercent' | 'noradrenalinePercent' | 'serotoninePercent' | 'melatoninePercent'
      >;
      axis: 'dopamine' | 'noradrenaline' | 'serotonine' | 'melatonine';
    }> = [
      { key: 'dopamine', percentKey: 'dopaminePercent', axis: 'dopamine' },
      { key: 'noradrenaline', percentKey: 'noradrenalinePercent', axis: 'noradrenaline' },
      { key: 'serotonine', percentKey: 'serotoninePercent', axis: 'serotonine' },
      { key: 'melatonine', percentKey: 'melatoninePercent', axis: 'melatonine' },
    ];

    return axes.map(({ key, percentKey, axis }) =>
      this.interpretAxis(axis, scores[key], scores[percentKey])
    );
  }

  /**
   * Interprétation d'un axe neurotransmetteur spécifique
   */
  private static interpretAxis(
    axis: 'dopamine' | 'noradrenaline' | 'serotonine' | 'melatonine',
    score: number,
    percent: number
  ): DNSMInterpretation {
    let status: 'normal' | 'probable' | 'marquee';
    let label: string;
    let color: string;
    let recommendation: string;

    // Seuils cliniques DNSM (échelle 0-40 par axe)
    if (score <= 10) {
      status = 'normal';
      label = 'Fonctionnement normal';
      color = 'emerald';
      recommendation = this.getNormalRecommendation(axis);
    } else if (score <= 19) {
      status = 'probable';
      label = 'Dysfonction probable';
      color = 'amber';
      recommendation = this.getProblematicRecommendation(axis);
    } else {
      status = 'marquee';
      label = 'Dysfonction marquée';
      color = 'rose';
      recommendation = this.getSevereRecommendation(axis);
    }

    return {
      axis,
      score,
      percent,
      status,
      label,
      color,
      recommendation,
    };
  }

  /**
   * Recommandations pour fonctionnement normal
   */
  private static getNormalRecommendation(axis: string): string {
    const recommendations = {
      dopamine: 'Maintenir les activités qui procurent du plaisir et de la motivation',
      noradrenaline: "Continuer la pratique régulière d'exercice et de gestion du stress",
      serotonine: 'Préserver un bon équilibre social et des habitudes de sommeil',
      melatonine: 'Maintenir une hygiène de sommeil et une exposition lumineuse régulière',
    };
    return recommendations[axis as keyof typeof recommendations];
  }

  /**
   * Recommandations pour dysfonction probable
   */
  private static getProblematicRecommendation(axis: string): string {
    const recommendations = {
      dopamine: 'Envisager des activités stimulantes et consulter pour un bilan nutritionnel',
      noradrenaline: 'Adapter la gestion du stress et envisager un suivi personnalisé',
      serotonine: "Améliorer l'équilibre social et consulter si troubles persistent",
      melatonine: "Optimiser l'hygiène de sommeil et consulter si troubles du sommeil",
    };
    return recommendations[axis as keyof typeof recommendations];
  }

  /**
   * Recommandations pour dysfonction marquée
   */
  private static getSevereRecommendation(axis: string): string {
    const recommendations = {
      dopamine: 'Consultation spécialisée recommandée pour bilan approfondi',
      noradrenaline: 'Suivi médical conseillé pour évaluation et prise en charge',
      serotonine: "Consultation recommandée pour évaluation de l'humeur et du sommeil",
      melatonine: 'Bilan du sommeil et consultation spécialisée conseillés',
    };
    return recommendations[axis as keyof typeof recommendations];
  }

  /**
   * Validation de la complétude du questionnaire
   */
  private static validateCompleteness(responses: Record<string, number>): boolean {
    const allRequiredIds = [
      ...Array.from({ length: this.QUESTIONS_PER_AXIS }, (_, i) => `da-${i + 1}`),
      ...Array.from({ length: this.QUESTIONS_PER_AXIS }, (_, i) => `na-${i + 1}`),
      ...Array.from({ length: this.QUESTIONS_PER_AXIS }, (_, i) => `se-${i + 1}`),
      ...Array.from({ length: this.QUESTIONS_PER_AXIS }, (_, i) => `me-${i + 1}`),
    ];

    return allRequiredIds.every(
      (id) =>
        responses[id] !== undefined &&
        responses[id] !== null &&
        Number.isInteger(responses[id]) &&
        responses[id] >= 0 &&
        responses[id] <= 4
    );
  }

  /**
   * 📊 Génération des données pour graphique radar
   */
  public static generateRadarData(scores: DNSMScores): Array<{
    axis: string;
    value: number;
    fullMark: number;
    color: string;
  }> {
    return [
      {
        axis: 'Dopamine',
        value: scores.dopaminePercent,
        fullMark: 100,
        color: '#3B82F6', // blue-500
      },
      {
        axis: 'Noradrénaline',
        value: scores.noradrenalinePercent,
        fullMark: 100,
        color: '#EF4444', // red-500
      },
      {
        axis: 'Sérotonine',
        value: scores.serotoninePercent,
        fullMark: 100,
        color: '#10B981', // emerald-500
      },
      {
        axis: 'Mélatonine',
        value: scores.melatoninePercent,
        fullMark: 100,
        color: '#8B5CF6', // violet-500
      },
    ];
  }
}
