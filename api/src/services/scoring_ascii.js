/**
 * Scoring Service - Logique m?tier centralis?e
 * Calcule les scores et g?n?re les interpr?tations pour tous les questionnaires
 */

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

    const summary = `Profil actuel: axes ? renforcer -> ${
      advices
        .filter((a) => a.priority !== 'basse')
        .map((a) => a.label)
        .join(', ') || '?quilibr?'
    }`;

    const plan7d = this.build7DayPlan(advices);

    return { summary, priorities: advices, plan7d };
  }

  toAdvice(axis, value) {
    const label = this.axisLabel(axis);
    const priority = value < 40 ? 'haute' : value < 70 ? 'moyenne' : 'basse';

    const base = {
      AIA: [
        'Ajoutez quotidiennement des polyph?nols: th? vert, fruits rouges, agrumes',
        'Cuisinez ? basse temp?rature; privil?giez vapeur, mijot?s, ?viter fritures',
        'Augmentez om?ga-3: poissons gras 2x/sem. + huile de colza/lin quotidienne',
      ],
      SER: [
        'Petit-d?jeuner riche en prot?ines (oeufs, yaourt grec, fromages frais)',
        'Collation << s?rotonine >> en fin de journ?e: fruits + ol?agineux',
        'R?duisez les ?crans apr?s 21h; rituel de d?connexion et tisane',
      ],
      DOP: [
        'Exposez-vous ? la lumi?re du matin; 15-30 min d'activit? dynamique',
        'Structurer la journ?e: 3 priorit?s + micro-r?compenses sans sucre',
        'Augmentez tyrosine naturelle: volailles, l?gumineuses, graines',
      ],
      NEU: [
        'L?gumes verts quotidiens + crucif?res 3x/sem. (brocoli, chou, roquette)',
        'Assaisonnez avec ail, oignon, curcuma + poivre, gingembre',
        'Hydratation 1.5-2L/j; limite alcool et exc?s de sel',
      ],
      CON: [
        'Lisez les ?tiquettes; remplacez produits ultra-transform?s par frais',
        'Organisation repas: plan hebdo simple + batch cooking 2x/sem.',
        'D?finissez un << 80/20 >>: plaisir cadr?, grignotage hors maison',
      ],
    };

    // Affine selon la s?v?rit?
    if (priority === 'haute') {
      const enhancements = {
        AIA: 'Ajoutez quotidiennement: ?pices anti-oxydantes (curcuma, cannelle), cacao 85%',
        SER: 'Stabilisez la glyc?mie: d?ner t?t, f?culents complets, ?viter sucres rapides',
        DOP: 'Caf?ine strat?gique le matin, pas apr?s 14h; sieste courte possible',
        NEU: 'Augmentez om?ga-3 et noix; r?duire charcuteries et fritures',
        CON: 'Courses intelligentes: 1/5 max de produits transform?s dans le caddy',
      };
      base[axis] = [base[axis][0], base[axis][1], enhancements[axis]];
    }

    return { axis, label, priority, tips: base[axis] || [] };
  }

  axisLabel(axis) {
    const labels = {
      AIA: 'Anti-inflammatoire/antioxydant',
      SER: 'S?rotonine',
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
            'March?/Batch cooking',
            'Assaisonnements riches en polyph?nols',
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
 * Life Journey (7 Sph?res SIIN) Scoring Service
 */
export class LifeJourneyScoringService {
  constructor() {
    // D?finition des sph?res avec leurs scores max
    this.spheres = {
      sommeil: { maxScore: 28, name: 'Sommeil' },
      rythme: { maxScore: 28, name: 'Rythme' },
      stress: { maxScore: 28, name: 'Stress' },
      activite: { maxScore: 20, name: 'Activit? physique' },
      toxiques: { maxScore: 28, name: 'Toxiques' },
      relations: { maxScore: 20, name: 'Relations' },
      alimentation: { maxScore: 28, name: 'Alimentation' },
    };
  }

  /**
   * Calcule les scores par sph?re
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
   * G?n?re les donn?es pour le radar chart
   */
  getRadarData(scores) {
    return Object.entries(this.spheres).map(([key, config]) => ({
      sphere: config.name,
      score: scores[key]?.percent || 0,
      fullMark: 100,
    }));
  }

  /**
   * Interpr?tation des r?sultats
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
      summary = 'Excellent ?quilibre de vie ! Maintenez vos bonnes habitudes.';
    } else if (globalScore >= 50) {
      summary = `Bon niveau g?n?ral (${globalScore}/100). ${weak.length > 0 ? `? am?liorer : ${weak.slice(0, 2).join(', ')}` : ''}`;
    } else {
      summary = `Plusieurs sph?res n?cessitent attention (${globalScore}/100). Priorit?s : ${weak.slice(0, 3).join(', ')}`;
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
   * Recommandations bas?es sur les sph?res faibles
   */
  getRecommendations(weakSpheres) {
    const recommendations = {
      Sommeil: [
        '?tablir un horaire r?gulier de coucher/lever',
        '?viter les ?crans 1h avant le coucher',
        'Cr?er un environnement propice (obscurit?, fra?cheur)',
      ],
      Rythme: [
        'Structurer vos journ?es avec des rituels',
        'Planifier les repas ? heures fixes',
        'Alterner activit?s et temps de repos',
      ],
      Stress: [
        'Pratiquer la coh?rence cardiaque (3x5min/jour)',
        'Identifier et limiter les sources de stress',
        'Activit?s de d?tente quotidiennes (m?ditation, lecture)',
      ],
      'Activit? physique': [
        'Marche quotidienne 30 min minimum',
        'Trouver une activit? plaisir (danse, v?lo, natation)',
        'R?duire la s?dentarit? (pauses actives toutes les 2h)',
      ],
      Toxiques: [
        'R?duire progressivement alcool et tabac',
        'Limiter exposition aux polluants (a?ration, produits naturels)',
        'Hydratation r?guli?re (1.5-2L eau/jour)',
      ],
      Relations: [
        'Cultiver les liens avec proches (appels, visites)',
        'Rejoindre un groupe/association',
        'Communiquer vos besoins et ?motions',
      ],
      Alimentation: [
        'Augmenter fruits et l?gumes (5 portions/jour)',
        'R?duire produits ultra-transform?s',
        'Manger en pleine conscience, sans ?crans',
      ],
    };

    return weakSpheres
      .slice(0, 3)
      .map((sphere) => ({
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
        // Autres questionnaires : score simple bas? sur compl?tion
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
