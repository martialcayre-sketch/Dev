/**
 * Scoring Service - Logique metier centralisee
 * Calcule les scores et genere les interpretations pour tous les questionnaires
 */

/**
 * DNSM Scoring Service (Dopamine, Noradrénaline, Sérotonine, Mélatonine)
 * Échelle Likert 0-4, 10 questions par axe, score max 40/axe, 160 total
 */
export class DNSMScoringService {
  /**
   * Calculer les scores DNSM à partir des réponses
   * @param {Record<string, number>} responses - Réponses du questionnaire
   * @returns {Object} Scores bruts et normalisés
   */
  static calculateScores(responses) {
    if (!responses || typeof responses !== 'object') {
      throw new Error('Invalid responses object');
    }

    // IDs des questions par axe
    const dopamineIds = Array.from({ length: 10 }, (_, i) => `da-${i + 1}`);
    const noradrenalineIds = Array.from({ length: 10 }, (_, i) => `na-${i + 1}`);
    const serotonineIds = Array.from({ length: 10 }, (_, i) => `se-${i + 1}`);
    const melatonineIds = Array.from({ length: 10 }, (_, i) => `me-${i + 1}`);

    // Calculer scores bruts (somme des réponses 0-4)
    const dopamine = dopamineIds.reduce((sum, id) => sum + (responses[id] || 0), 0);
    const noradrenaline = noradrenalineIds.reduce((sum, id) => sum + (responses[id] || 0), 0);
    const serotonine = serotonineIds.reduce((sum, id) => sum + (responses[id] || 0), 0);
    const melatonine = melatonineIds.reduce((sum, id) => sum + (responses[id] || 0), 0);

    const total = dopamine + noradrenaline + serotonine + melatonine;

    // Vérifier complétion (toutes les 40 questions répondues)
    const allIds = [...dopamineIds, ...noradrenalineIds, ...serotonineIds, ...melatonineIds];
    const isComplete = allIds.every((id) => responses[id] !== undefined && responses[id] !== null);

    // Normalisation en pourcentage (score/40 * 100)
    const dopaminePercent = Math.round((dopamine / 40) * 100);
    const noradrenalinePercent = Math.round((noradrenaline / 40) * 100);
    const serotoninePercent = Math.round((serotonine / 40) * 100);
    const melatoninePercent = Math.round((melatonine / 40) * 100);
    const globalPercent = Math.round((total / 160) * 100);

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
      isComplete,
    };
  }

  /**
   * Obtenir l'interprétation clinique d'un score d'axe
   * @param {string} axis - Nom de l'axe
   * @param {number} score - Score brut (0-40)
   * @param {number} percent - Score normalisé (0-100%)
   * @returns {Object} Interprétation
   */
  static interpretAxis(axis, score, percent) {
    let status;
    let label;
    let color;

    if (score <= 10) {
      status = 'normal';
      label = 'Fonctionnement normal';
      color = 'emerald';
    } else if (score <= 19) {
      status = 'probable';
      label = 'Dysfonction probable';
      color = 'amber';
    } else {
      status = 'marquee';
      label = 'Dysfonction marquée';
      color = 'rose';
    }

    return { axis, score, percent, status, label, color };
  }

  /**
   * Générer toutes les interprétations DNSM
   * @param {Object} scores - Scores calculés
   * @returns {Array} Liste des interprétations par axe
   */
  static getInterpretations(scores) {
    return [
      this.interpretAxis('dopamine', scores.dopamine, scores.dopaminePercent),
      this.interpretAxis('noradrenaline', scores.noradrenaline, scores.noradrenalinePercent),
      this.interpretAxis('serotonine', scores.serotonine, scores.serotoninePercent),
      this.interpretAxis('melatonine', scores.melatonine, scores.melatoninePercent),
    ];
  }

  /**
   * Calculer et interpréter un questionnaire DNSM complet
   * @param {Record<string, number>} responses
   * @returns {Object} Scores, interprétations et complétion
   */
  static analyze(responses) {
    const scores = this.calculateScores(responses);
    const interpretations = this.getInterpretations(scores);

    return {
      scores,
      interpretations,
      isComplete: scores.isComplete,
    };
  }
}

/**
 * DayFlow Scoring (5 axes SIIN)
 */
export class DayFlowScoringService {
  interpretDayFlow(scores) {
    const { AIA = 0, SER = 0, DOP = 0, NEU = 0, CON = 0 } = scores;

    const ordered = Object.entries(scores)
      .map(([k, v]) => [k, v])
      .sort((a, b) => a[1] - b[1]); // plus faible en premier

    const advices = ordered.map(([axis, value]) => this.toAdvice(axis, value));

    const summary = `Profil actuel: axes a renforcer → ${
      advices
        .filter((a) => a.priority !== 'basse')
        .map((a) => a.label)
        .join(', ') || 'equilibre'
    }`;

    const plan7d = this.build7DayPlan(advices);

    return { summary, priorities: advices, plan7d };
  }

  toAdvice(axis, value) {
    const label = this.axisLabel(axis);
    const priority = value < 40 ? 'haute' : value < 70 ? 'moyenne' : 'basse';

    const base = {
      AIA: [
        'Ajoutez quotidiennement des polyphenols: the vert, fruits rouges, agrumes',
        'Cuisinez a basse temperature; privilegiez vapeur, mijotes, eviter fritures',
        'Augmentez omega-3: poissons gras 2×/sem. + huile de colza/lin quotidienne',
      ],
      SER: [
        'Petit-dejeuner riche en proteines (oeufs, yaourt grec, fromages frais)',
        'Collation « serotonine » en fin de journee: fruits + oleagineux',
        'Reduisez les ecrans apres 21h; rituel de deconnexion et tisane',
      ],
      DOP: [
        'Exposez-vous a la lumiere du matin; 15-30 min de activite dynamique',
        'Structurer la journee: 3 priorites + micro-recompenses sans sucre',
        'Augmentez tyrosine naturelle: volailles, legumineuses, graines',
      ],
      NEU: [
        'Legumes verts quotidiens + cruciferes 3×/sem. (brocoli, chou, roquette)',
        'Assaisonnez avec ail, oignon, curcuma + poivre, gingembre',
        'Hydratation 1.5-2L/j; limite alcool et exces de sel',
      ],
      CON: [
        'Lisez les etiquettes; remplacez produits ultra-transformes par frais',
        'Organisation repas: plan hebdo simple + batch cooking 2×/sem.',
        'Definissez un « 80/20 »: plaisir cadre, grignotage hors maison',
      ],
    };

    // Affine selon la severite
    if (priority === 'haute') {
      const enhancements = {
        AIA: 'Ajoutez quotidiennement: epices anti-oxydantes (curcuma, cannelle), cacao 85%',
        SER: 'Stabilisez la glycemie: diner tot, feculents complets, eviter sucres rapides',
        DOP: 'Cafeine strategique le matin, pas apres 14h; sieste courte possible',
        NEU: 'Augmentez omega-3 et noix; reduire charcuteries et fritures',
        CON: 'Courses intelligentes: 1/5 max de produits transformes dans le caddy',
      };
      base[axis] = [base[axis][0], base[axis][1], enhancements[axis]];
    }

    return { axis, label, priority, tips: base[axis] || [] };
  }

  axisLabel(axis) {
    const labels = {
      AIA: 'Anti-inflammatoire/antioxydant',
      SER: 'Serotonine',
      DOP: 'Dopamine',
      NEU: 'Neurovasculaire',
      CON: 'Conscience/Environnement',
    };
    return labels[axis] || axis;
  }

  build7DayPlan(advices) {
    const focusOrder = advices
      .filter((a) => a.priority !== 'basse')
      .map((a) => a.axis)
      .slice(0, 3);

    const seq = [
      focusOrder[0] || 'mix',
      focusOrder[0] || 'mix',
      focusOrder[1] || 'mix',
      focusOrder[1] || 'mix',
      focusOrder[2] || 'mix',
      focusOrder[2] || 'mix',
      'mix',
    ];

    return seq.map((s, i) => {
      if (s === 'mix') {
        return {
          day: i + 1,
          focus: advices
            .filter((a) => a.priority !== 'basse')
            .slice(0, 3)
            .map((a) => a.axis),
          actions: [
            'Marche/Batch cooking',
            'Assaisonnements riches en polyphenols',
            'Hydratation 2L',
          ],
        };
      }
      const a = advices.find((x) => x.axis === s);
      return {
        day: i + 1,
        focus: [s],
        actions: a ? a.tips : [],
      };
    });
  }
}

/**
 * Life Journey (7 Spheres SIIN) Scoring Service
 */
export class LifeJourneyScoringService {
  constructor() {
    // Definition des spheres avec leurs scores max
    this.spheres = {
      sommeil: { maxScore: 28, name: 'Sommeil' },
      rythme: { maxScore: 28, name: 'Rythme' },
      stress: { maxScore: 28, name: 'Stress' },
      activite: { maxScore: 20, name: 'Activite physique' },
      toxiques: { maxScore: 28, name: 'Toxiques' },
      relations: { maxScore: 20, name: 'Relations' },
      alimentation: { maxScore: 28, name: 'Alimentation' },
    };
  }

  /**
   * Calcule les scores par sphere
   * @param {Object} answers - { sommeil: { q1: 2, q2: 4, ... }, rythme: { ... }, ... }
   * @returns {Object} - { sommeil: { raw: 12, max: 28, percent: 43 }, ... }
   */
  calculateScores(answers) {
    const scores = {};

    for (const [sphereKey, sphereConfig] of Object.entries(this.spheres)) {
      const sphereAnswers = answers[sphereKey] || {};
      const raw = Object.values(sphereAnswers).reduce((sum, val) => sum + (Number(val) || 0), 0);
      const percent = Math.round((raw / sphereConfig.maxScore) * 100);

      scores[sphereKey] = {
        raw,
        max: sphereConfig.maxScore,
        percent,
      };
    }

    return scores;
  }

  /**
   * Calcule le score global (moyenne des pourcentages)
   */
  calculateGlobalScore(scores) {
    const percents = Object.values(scores).map((s) => s.percent);
    if (percents.length === 0) return 0;
    return Math.round(percents.reduce((a, b) => a + b, 0) / percents.length);
  }

  /**
   * Genere les donnees pour le radar chart
   */
  getRadarData(scores) {
    return Object.entries(this.spheres).map(([key, config]) => ({
      sphere: config.name,
      score: scores[key]?.percent || 0,
      fullMark: 100,
    }));
  }

  /**
   * Interpretation des resultats
   */
  interpretResults(scores, globalScore) {
    const weak = Object.entries(scores)
      .filter(([_, s]) => s.percent < 50)
      .sort((a, b) => a[1].percent - b[1].percent)
      .map(([key, _]) => this.spheres[key].name);

    const strong = Object.entries(scores)
      .filter(([_, s]) => s.percent >= 75)
      .map(([key, _]) => this.spheres[key].name);

    let summary = '';
    if (globalScore >= 75) {
      summary = 'Excellent equilibre de vie ! Maintenez vos bonnes habitudes.';
    } else if (globalScore >= 50) {
      summary = `Bon niveau general (${globalScore}/100). ${
        weak.length > 0 ? `À ameliorer : ${weak.slice(0, 2).join(', ')}` : ''
      }`;
    } else {
      summary = `Plusieurs spheres necessitent attention (${globalScore}/100). Priorites : ${weak
        .slice(0, 3)
        .join(', ')}`;
    }

    return {
      summary,
      globalScore,
      weakSpheres: weak,
      strongSpheres: strong,
      recommendations: this.getRecommendations(weak),
    };
  }

  /**
   * Recommandations basees sur les spheres faibles
   */
  getRecommendations(weakSpheres) {
    const recommendations = {
      Sommeil: [
        'Établir un horaire regulier de coucher/lever',
        'Éviter les ecrans 1h avant le coucher',
        'Creer un environnement propice (obscurite, fraicheur)',
      ],
      Rythme: [
        'Structurer vos journees avec des rituels',
        'Planifier les repas a heures fixes',
        'Alterner activites et temps de repos',
      ],
      Stress: [
        'Pratiquer la coherence cardiaque (3×5min/jour)',
        'Identifier et limiter les sources de stress',
        'Activites de detente quotidiennes (meditation, lecture)',
      ],
      'Activite physique': [
        'Marche quotidienne 30 min minimum',
        'Trouver une activite plaisir (danse, velo, natation)',
        'Reduire la sedentarite (pauses actives toutes les 2h)',
      ],
      Toxiques: [
        'Reduire progressivement alcool et tabac',
        'Limiter exposition aux polluants (aeration, produits naturels)',
        'Hydratation reguliere (1.5-2L eau/jour)',
      ],
      Relations: [
        'Cultiver les liens avec proches (appels, visites)',
        'Rejoindre un groupe/association',
        'Communiquer vos besoins et emotions',
      ],
      Alimentation: [
        'Augmenter fruits et legumes (5 portions/jour)',
        'Reduire produits ultra-transformes',
        'Manger en pleine conscience, sans ecrans',
      ],
    };

    return weakSpheres.slice(0, 3).map((sphere) => ({
      sphere,
      actions: recommendations[sphere] || [],
    }));
  }
}

/**
 * Service principal qui orchestre tous les scorings
 */
export class ScoringService {
  constructor() {
    this.dayFlowService = new DayFlowScoringService();
    this.lifeJourneyService = new LifeJourneyScoringService();
  }

  /**
   * Calcule tous les scores d'un patient
   */
  async calculatePatientScores(questionnaires) {
    const results = {
      dayFlow: null,
      lifeJourney: null,
      questionnaires: [],
    };

    for (const q of questionnaires) {
      if (q.id === 'dayflow-alim' && q.responses?.scores?.axes) {
        results.dayFlow = {
          scores: q.responses.scores.axes,
          interpretation: this.dayFlowService.interpretDayFlow(q.responses.scores.axes),
          completedAt: q.completedAt || q.submittedAt,
        };
      } else if (q.id === 'life-journey' && q.responses) {
        const scores = this.lifeJourneyService.calculateScores(q.responses);
        const globalScore = this.lifeJourneyService.calculateGlobalScore(scores);
        results.lifeJourney = {
          scores,
          globalScore,
          radarData: this.lifeJourneyService.getRadarData(scores),
          interpretation: this.lifeJourneyService.interpretResults(scores, globalScore),
          completedAt: q.completedAt || q.submittedAt,
        };
      } else {
        // Autres questionnaires : score simple base sur completion
        results.questionnaires.push({
          id: q.id,
          title: q.title,
          status: q.status,
          progress: this.calculateProgress(q.responses, q.questions),
        });
      }
    }

    return results;
  }

  /**
   * Calcul de progression simple
   */
  calculateProgress(responses, questions) {
    if (!responses || !questions) return 0;
    const answered = Object.values(responses).filter((v) => v !== null && v !== undefined).length;
    const total = Array.isArray(questions) ? questions.length : Object.keys(questions).length;
    return total > 0 ? Math.round((answered / total) * 100) : 0;
  }
}

export default ScoringService;
