import type { Questionnaire } from '../../types';

export const mesure_de_limpact_de_la_fibromyalgie_def_pro: Questionnaire = {
  metadata: {
    id: 'mesure-de-limpact-de-la-fibromyalgie-def-pro',
    title: `Questionnaire de mesure de l’impact de la`,
    category: 'rhumatologie',
  },
  questions: [
  {
    id: 'q1',
    label: `Etes-vous capable de : Toujours La plupart De temps Jamais`,
    type: 'textarea',
  },
  {
    id: 'q2',
    label: `Combien de jours vous êtes-vous senti(e) bien ?`,
    type: 'textarea',
  },
  {
    id: 'q3',
    label: `Combien de jours de travail avez-vous manqué à cause de la fibromyalgie ?`,
    type: 'textarea',
  },
  {
    id: 'q4',
    label: `Les jours où vous avez travaillé, les douleurs ou d’autres problèmes liés à votre fibromyalgie`,
    type: 'textarea',
  },
  {
    id: 'q5',
    label: `Avez-vous eu des douleurs ?`,
    type: 'textarea',
  },
  {
    id: 'q6',
    label: `Avez-vous été fatigué(e) ?`,
    type: 'textarea',
  },
  {
    id: 'q7',
    label: `Comment vous êtes-vous senti(e) au réveil ?`,
    type: 'textarea',
  },
  {
    id: 'q8',
    label: `Vous êtes-vous senti(e) raide ?`,
    type: 'textarea',
  },
  {
    id: 'q9',
    label: `Vous êtes-vous senti(e) tendu(e) ou inquiet(e) ?`,
    type: 'textarea',
  },
  {
    id: 'q10',
    label: `Vous êtes-vous senti(e) déprimé(e) ?`,
    type: 'textarea',
  }
  ],
};
