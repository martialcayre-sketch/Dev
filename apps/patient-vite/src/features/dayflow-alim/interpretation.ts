import type { AxisScores, DayFlowPayload } from './types';

export type AxisAdvice = {
  axis: keyof AxisScores;
  label: string;
  priority: 'haute' | 'moyenne' | 'basse';
  tips: string[]; // 3 conseils synthétiques
};

export type SevenDayPlan = {
  day: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  focus: Array<keyof AxisScores>;
  actions: string[];
};

export interface Interpretation {
  summary: string;
  priorities: AxisAdvice[]; // triées par déficit décroissant
  plan7d: SevenDayPlan[];
}

export function interpretDayFlow(scores: AxisScores): Interpretation {
  const ordered = Object.entries(scores)
    .map(([k, v]) => [k as keyof AxisScores, v] as const)
    .sort((a, b) => a[1] - b[1]); // plus faible en premier

  const advices = ordered.map(([axis, value]) => toAdvice(axis, value));

  const summary = `Profil actuel: axes à renforcer → ${
    advices
      .filter((a) => a.priority !== 'basse')
      .map((a) => a.label)
      .join(', ') || 'équilibré'
  }`;

  const plan7d = build7DayPlan(advices);

  return { summary, priorities: advices, plan7d };
}

function toAdvice(axis: keyof AxisScores, value: number): AxisAdvice {
  const label = axisLabel(axis);
  const priority = value < 40 ? 'haute' : value < 70 ? 'moyenne' : 'basse';

  const base: Record<keyof AxisScores, string[]> = {
    AIA: [
      'Ajoutez quotidiennement des polyphénols: thé vert, fruits rouges, agrumes',
      'Cuisinez à basse température; privilégiez vapeur, mijotés, éviter fritures',
      'Augmentez oméga‑3: poissons gras 2×/sem. + huile de colza/lin quotidienne',
    ],
    SER: [
      'Petit-déjeuner riche en protéines (œufs, yaourt grec, fromages frais)',
      'Collation « sérotonine » en fin de journée: fruits + oléagineux',
      'Réduisez les écrans après 21h; rituel de déconnexion et tisane',
    ],
    DOP: [
      'Exposez-vous à la lumière du matin; 15–30 min d’activité dynamique',
      'Structurer la journée: 3 priorités + micro‑récompenses sans sucre',
      'Augmentez tyrosine naturelle: volailles, légumineuses, graines',
    ],
    NEU: [
      'Légumes verts quotidiens + crucifères 3×/sem. (brocoli, chou, roquette)',
      'Assaisonnez avec ail, oignon, curcuma + poivre, gingembre',
      'Hydratation 1.5–2L/j; limite alcool et excès de sel',
    ],
    CON: [
      'Lisez les étiquettes; remplacez produits ultra‑transformés par frais',
      'Organisation repas: plan hebdo simple + batch cooking 2×/sem.',
      'Définissez un « 80/20 »: plaisir cadré, grignotage hors maison',
    ],
  };

  // Affine selon la sévérité
  if (priority === 'haute') {
    base[axis] = [
      base[axis][0],
      base[axis][1],
      axis === 'AIA'
        ? 'Ajoutez quotidiennement: épices anti‑oxydantes (curcuma, cannelle), cacao 85%'
        : axis === 'SER'
          ? 'Stabilisez la glycémie: dîner tôt, féculents complets, éviter sucres rapides'
          : axis === 'DOP'
            ? 'Caféine stratégique le matin, pas après 14h; sieste courte possible'
            : axis === 'NEU'
              ? 'Augmentez oméga‑3 et noix; réduire charcuteries et fritures'
              : 'Courses intelligentes: 1/5 max de produits transformés dans le caddy',
    ];
  }

  const tips = base[axis];
  return { axis, label, priority, tips };
}

function axisLabel(axis: keyof AxisScores): string {
  switch (axis) {
    case 'AIA':
      return 'Anti‑inflammatoire/antioxydant';
    case 'SER':
      return 'Sérotonine';
    case 'DOP':
      return 'Dopamine';
    case 'NEU':
      return 'Neurovasculaire';
    case 'CON':
      return 'Conscience/Environnement';
  }
}

function build7DayPlan(advices: AxisAdvice[]): SevenDayPlan[] {
  // 2 jours axe prioritaire, 2 jours second, 2 jours troisième, 1 mix entretien
  const focusOrder = advices
    .filter((a) => a.priority !== 'basse')
    .map((a) => a.axis)
    .slice(0, 3);

  const seq: (keyof AxisScores | 'mix')[] = [
    focusOrder[0] ?? 'mix',
    focusOrder[0] ?? 'mix',
    focusOrder[1] ?? 'mix',
    focusOrder[1] ?? 'mix',
    focusOrder[2] ?? 'mix',
    focusOrder[2] ?? 'mix',
    'mix',
  ];

  return seq.map((s, i) => {
    if (s === 'mix') {
      return {
        day: (i + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7,
        focus: advices
          .filter((a) => a.priority !== 'basse')
          .slice(0, 3)
          .map((a) => a.axis),
        actions: [
          'Marché/Batch cooking',
          'Assaisonnements riches en polyphénols',
          'Hydratation 2L',
        ],
      };
    }
    const a = advices.find((x) => x.axis === s)!;
    return {
      day: (i + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7,
      focus: [s],
      actions: a.tips,
    };
  });
}

export function buildPayloadWithInterpretation(payload: DayFlowPayload) {
  const interpretation = interpretDayFlow(payload.scores.axes);
  return { ...payload, interpretation } as DayFlowPayload & {
    interpretation: ReturnType<typeof interpretDayFlow>;
  };
}
