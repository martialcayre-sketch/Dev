/**
 * 🧠 NeuroNutrition - Service de Scoring Unifié
 *
 * Interface générique pour tous les modules de scoring
 */

import { DNSMScoringService, type DNSMScoringResult } from './DNSMScoringService';

export type QuestionnaireType =
  | 'dnsm'
  | 'life-journey'
  | 'stress'
  | 'nutrition'
  | 'sommeil'
  | 'plaintes-et-douleurs';

export interface GenericScoringResult {
  questionnaireType: QuestionnaireType;
  scores: Record<string, number>;
  interpretations: Array<{
    category: string;
    score: number;
    percent: number;
    status: 'normal' | 'attention' | 'problematique';
    recommendation: string;
  }>;
  isComplete: boolean;
  calculatedAt: string;
  version: string;
}

/**
 * 🎯 Factory pour tous les services de scoring
 */
export class UnifiedScoringService {
  /**
   * Point d'entrée principal pour le calcul de scores
   */
  public static calculateScores(
    questionnaireType: QuestionnaireType,
    responses: Record<string, number>
  ): GenericScoringResult {
    switch (questionnaireType) {
      case 'dnsm':
        return this.adaptDNSMResult(DNSMScoringService.calculateScores(responses));

      case 'life-journey':
        return this.calculateLifeJourneyScores(responses);

      case 'stress':
        return this.calculateStressScores(responses);

      case 'nutrition':
        return this.calculateNutritionScores(responses);

      case 'sommeil':
        return this.calculateSommeilScores(responses);

      case 'plaintes-et-douleurs':
        return this.calculatePlaintesScores(responses);

      default:
        throw new Error(`Questionnaire type '${questionnaireType}' not supported`);
    }
  }

  /**
   * Adaptation du résultat DNSM vers le format générique
   */
  private static adaptDNSMResult(dnsmResult: DNSMScoringResult): GenericScoringResult {
    return {
      questionnaireType: 'dnsm',
      scores: {
        dopamine: dnsmResult.scores.dopaminePercent,
        noradrenaline: dnsmResult.scores.noradrenalinePercent,
        serotonine: dnsmResult.scores.serotoninePercent,
        melatonine: dnsmResult.scores.melatoninePercent,
        global: dnsmResult.scores.globalPercent,
      },
      interpretations: dnsmResult.interpretations.map((interp) => ({
        category: interp.axis,
        score: interp.score,
        percent: interp.percent,
        status:
          interp.status === 'normal'
            ? 'normal'
            : interp.status === 'probable'
            ? 'attention'
            : 'problematique',
        recommendation: interp.recommendation || '',
      })),
      isComplete: dnsmResult.isComplete,
      calculatedAt: dnsmResult.calculatedAt,
      version: dnsmResult.version,
    };
  }

  /**
   * 🌟 Calcul Life Journey (SIIN) - 7 sphères de vie
   */
  private static calculateLifeJourneyScores(
    responses: Record<string, number>
  ): GenericScoringResult {
    const spheres = [
      { id: 'energie', questions: 5, weight: 1 },
      { id: 'sommeil', questions: 5, weight: 1 },
      { id: 'digestion', questions: 5, weight: 1 },
      { id: 'poids', questions: 5, weight: 1 },
      { id: 'moral', questions: 5, weight: 1 },
      { id: 'mobilite', questions: 5, weight: 1 },
      { id: 'social', questions: 5, weight: 1 },
    ];

    const scores: Record<string, number> = {};
    const interpretations = spheres.map((sphere) => {
      const sphereQuestions = Array.from(
        { length: sphere.questions },
        (_, i) => `${sphere.id}-${i + 1}`
      );

      const rawScore = sphereQuestions.reduce((sum, qId) => sum + (responses[qId] || 0), 0);
      const maxScore = sphere.questions * 4; // Échelle 0-4
      const percent = Math.round((rawScore / maxScore) * 100);

      scores[sphere.id] = percent;

      return {
        category: sphere.id,
        score: rawScore,
        percent,
        status: percent >= 75 ? 'normal' : percent >= 50 ? 'attention' : ('problematique' as const),
        recommendation: this.getLifeJourneyRecommendation(sphere.id, percent),
      };
    });

    // Score global
    const globalPercent = Math.round(
      Object.values(scores).reduce((sum, score) => sum + score, 0) / spheres.length
    );
    scores.global = globalPercent;

    const allQuestions = spheres.flatMap((s) =>
      Array.from({ length: s.questions }, (_, i) => `${s.id}-${i + 1}`)
    );
    const isComplete = allQuestions.every((id) => responses[id] !== undefined);

    return {
      questionnaireType: 'life-journey',
      scores,
      interpretations: interpretations as Array<{
        category: string;
        score: number;
        percent: number;
        status: 'normal' | 'attention' | 'problematique';
        recommendation: string;
      }>,
      isComplete,
      calculatedAt: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  /**
   * 😰 Calcul Stress (7 dimensions)
   */
  private static calculateStressScores(responses: Record<string, number>): GenericScoringResult {
    const dimensions = [
      'fatigue',
      'irritabilite',
      'anxiete',
      'concentration',
      'sommeil',
      'appetite',
      'motivation',
    ];

    const scores: Record<string, number> = {};
    const interpretations = dimensions.map((dim) => {
      const dimQuestions = Object.keys(responses).filter((key) => key.startsWith(dim));
      const rawScore = dimQuestions.reduce((sum, qId) => sum + (responses[qId] || 0), 0);
      const maxScore = dimQuestions.length * 4;
      const percent = maxScore > 0 ? Math.round((rawScore / maxScore) * 100) : 0;

      scores[dim] = percent;

      return {
        category: dim,
        score: rawScore,
        percent,
        status: percent <= 25 ? 'normal' : percent <= 60 ? 'attention' : ('problematique' as const),
        recommendation: this.getStressRecommendation(dim, percent),
      };
    });

    const globalPercent = Math.round(
      Object.values(scores).reduce((sum, score) => sum + score, 0) / dimensions.length
    );
    scores.global = globalPercent;

    return {
      questionnaireType: 'stress',
      scores,
      interpretations: interpretations as Array<{
        category: string;
        score: number;
        percent: number;
        status: 'normal' | 'attention' | 'problematique';
        recommendation: string;
      }>,
      isComplete: Object.keys(responses).length >= 21, // Estimation 3 questions par dimension
      calculatedAt: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  /**
   * 🍎 Calcul Nutrition (PNNS5 × SIIN)
   */
  private static calculateNutritionScores(responses: Record<string, number>): GenericScoringResult {
    // Implémentation simplifiée - à enrichir selon les besoins
    const categories = [
      'fruits-legumes',
      'cereales',
      'proteines',
      'laitages',
      'graisses',
      'sucres',
    ];

    const scores: Record<string, number> = {};
    const interpretations = categories.map((cat) => {
      const catQuestions = Object.keys(responses).filter((key) => key.includes(cat));
      const rawScore = catQuestions.reduce((sum, qId) => sum + (responses[qId] || 0), 0);
      const percent = Math.min(100, Math.round((rawScore / catQuestions.length) * 25)); // Normalisation

      scores[cat] = percent;

      return {
        category: cat,
        score: rawScore,
        percent,
        status: percent >= 70 ? 'normal' : percent >= 50 ? 'attention' : ('problematique' as const),
        recommendation: `Optimiser l'équilibre pour ${cat.replace('-', ' ')}`,
      };
    });

    scores.global = Math.round(
      Object.values(scores).reduce((sum, s) => sum + s, 0) / categories.length
    );

    return {
      questionnaireType: 'nutrition',
      scores,
      interpretations: interpretations as Array<{
        category: string;
        score: number;
        percent: number;
        status: 'normal' | 'attention' | 'problematique';
        recommendation: string;
      }>,
      isComplete: Object.keys(responses).length >= 15,
      calculatedAt: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  /**
   * 😴 Calcul Sommeil (PSQI adapté)
   */
  private static calculateSommeilScores(responses: Record<string, number>): GenericScoringResult {
    // Composantes du sommeil selon PSQI adapté
    const components = [
      'qualite_sommeil',
      'latence_endormissement',
      'duree_sommeil',
      'efficacite_sommeil',
      'troubles_sommeil',
      'medicaments_sommeil',
      'dysfonctionnement_diurne',
    ];

    const scores: Record<string, number> = {};
    const interpretations = components.map((comp) => {
      const rawScore = responses[comp] || 0;
      const percent = Math.round((rawScore / 4) * 100); // Echelle 0-4 -> 0-100%

      scores[comp] = percent;

      const status: 'normal' | 'attention' | 'problematique' =
        percent <= 25 ? 'normal' : percent <= 60 ? 'attention' : 'problematique';

      return {
        category: comp,
        score: rawScore,
        percent,
        status,
        recommendation: this.getSommeilRecommendation(comp, percent),
      };
    });

    // Score global PSQI (somme des composantes, max 21)
    const globalRaw = Object.keys(scores).reduce((sum, comp) => {
      return sum + Math.round((scores[comp] / 100) * 3); // Reconvert en 0-3 pour somme
    }, 0);
    const globalPercent = Math.round((globalRaw / 21) * 100);
    scores.global = globalPercent;

    const isComplete = components.every((comp) => responses[comp] !== undefined);

    return {
      questionnaireType: 'sommeil',
      scores,
      interpretations,
      isComplete,
      calculatedAt: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  /**
   * 🤕 Calcul Plaintes et Douleurs
   */
  private static calculatePlaintesScores(responses: Record<string, number>): GenericScoringResult {
    // Catégories du questionnaire plaintes et douleurs (echelle 1-10)
    const categories = [
      { id: 'fatigue', label: 'Fatigue', weight: 1 },
      { id: 'douleurs', label: 'Douleurs', weight: 1 },
      { id: 'digestion', label: 'Digestion', weight: 1 },
      { id: 'surpoids', label: 'Surpoids', weight: 1 },
      { id: 'insomnie', label: 'Insomnie', weight: 1 },
      { id: 'moral', label: 'Moral', weight: 1 },
      { id: 'mobilite', label: 'Mobilité', weight: 1 },
    ];

    const scores: Record<string, number> = {};
    const interpretations = categories.map((cat) => {
      const rawScore = responses[cat.id] || 0;
      const percent = Math.round((rawScore / 10) * 100); // Echelle 1-10 -> 0-100%

      scores[cat.id] = percent;

      // Inversion pour l'interprétation (plus le score est élevé, plus c'est problématique)

      const status: 'normal' | 'attention' | 'problematique' =
        percent <= 30 ? 'normal' : percent <= 60 ? 'attention' : 'problematique';

      return {
        category: cat.id,
        score: rawScore,
        percent,
        status,
        recommendation: this.getPlaintesRecommendation(cat.id, percent),
      };
    });

    // Score global (moyenne des pourcentages)
    const globalPercent = Math.round(
      Object.values(scores).reduce((sum, score) => sum + score, 0) / categories.length
    );
    scores.global = globalPercent;

    // Questionnaire complet si toutes les catégories sont répondues
    const isComplete = categories.every(
      (cat) => responses[cat.id] !== undefined && responses[cat.id] > 0
    );

    return {
      questionnaireType: 'plaintes-et-douleurs',
      scores,
      interpretations,
      isComplete,
      calculatedAt: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  /**
   * Recommandations Life Journey par sphère
   */
  private static getLifeJourneyRecommendation(sphere: string, percent: number): string {
    const recommendations: Record<string, Record<string, string>> = {
      energie: {
        low: "Améliorer l'hydratation et envisager un bilan nutritionnel",
        medium: "Optimiser les rythmes et l'activité physique",
        high: 'Maintenir les bonnes habitudes énergétiques',
      },
      sommeil: {
        low: 'Mettre en place une hygiène de sommeil stricte',
        medium: "Améliorer les conditions d'endormissement",
        high: 'Maintenir la qualité du sommeil',
      },
      // TODO: Compléter pour toutes les sphères
    };

    const level = percent < 50 ? 'low' : percent < 75 ? 'medium' : 'high';
    return recommendations[sphere]?.[level] || 'Consulter pour optimiser cette sphère';
  }

  /**
   * Recommandations Stress par dimension
   */
  private static getStressRecommendation(dimension: string, percent: number): string {
    const baseRecommendations: Record<string, string> = {
      fatigue: 'Optimiser le repos et la récupération',
      irritabilite: 'Pratiquer des techniques de gestion émotionnelle',
      anxiete: 'Développer des stratégies anti-stress',
      concentration: "Améliorer l'hygiène de vie cognitive",
      sommeil: "Renforcer l'hygiène de sommeil",
      appetite: "Rééquilibrer l'alimentation et les rythmes",
      motivation: 'Retrouver du sens et des objectifs',
    };

    return baseRecommendations[dimension] || 'Consulter pour un suivi personnalisé';
  }

  /**
   * Recommandations Plaintes et Douleurs par catégorie
   */
  private static getPlaintesRecommendation(category: string, percent: number): string {
    const categoryRecommendations: Record<string, Record<string, string>> = {
      fatigue: {
        low: 'Maintenir un bon équilibre énergétique',
        medium: "Améliorer la qualité du repos et de l'alimentation",
        high: 'Consultation recommandée pour bilan de fatigue chronique',
      },
      douleurs: {
        low: 'Continuer les bonnes habitudes',
        medium: 'Envisager des techniques de gestion de la douleur',
        high: 'Consultation spécialisée pour prise en charge de la douleur',
      },
      digestion: {
        low: 'Maintenir une bonne hygiène digestive',
        medium: "Adapter l'alimentation et consulter si nécessaire",
        high: 'Bilan digestif et suivi nutritionnel recommandés',
      },
      surpoids: {
        low: 'Maintenir un poids de forme',
        medium: "Optimiser l'alimentation et l'activité physique",
        high: 'Accompagnement nutritionnel personnalisé conseillé',
      },
      insomnie: {
        low: 'Préserver la qualité du sommeil',
        medium: "Améliorer l'hygiène de sommeil",
        high: 'Consultation spécialisée du sommeil recommandée',
      },
      moral: {
        low: "Maintenir l'équilibre émotionnel",
        medium: 'Envisager des techniques de bien-être',
        high: 'Accompagnement psychologique conseillé',
      },
      mobilite: {
        low: "Continuer l'activité physique régulière",
        medium: "Adapter l'activité physique aux besoins",
        high: 'Kinésithérapie et réadaptation recommandées',
      },
    };

    const level = percent <= 30 ? 'low' : percent <= 60 ? 'medium' : 'high';
    return categoryRecommendations[category]?.[level] || 'Consulter pour optimisation';
  }

  /**
   * Recommandations Sommeil par composante
   */
  private static getSommeilRecommendation(component: string, percent: number): string {
    const sommeilRecommendations: Record<string, string> = {
      qualite_sommeil: "Améliorer les conditions et l'environnement de sommeil",
      latence_endormissement: 'Optimiser la routine pré-dodo et la relaxation',
      duree_sommeil: 'Ajuster les horaires pour une durée de sommeil adéquate',
      efficacite_sommeil: 'Réduire les éveils nocturnes et améliorer la continuité',
      troubles_sommeil: 'Identifier et traiter les facteurs perturbateurs',
      medicaments_sommeil: 'Revoir avec le médecin la nécessité des aides au sommeil',
      dysfonctionnement_diurne: 'Améliorer la vigilance diurne par un meilleur sommeil',
    };

    return sommeilRecommendations[component] || 'Consulter pour optimisation du sommeil';
  }
}
