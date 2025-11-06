import type { Questionnaire } from '../../types';

export const questionnaire_de_stress_de_cungi_def_pro: Questionnaire = {
  metadata: {
    id: 'questionnaire-de-stress-de-cungi-def-pro',
    title: `Questionnaire :`,
    category: 'stress',
  },
  questions: [
  {
    id: 'q1',
    label: `Comment le remplir ?`,
    type: 'select',
    options: [
      { label: ``, value: '' },
      { label: ``, value: '' }
    ],
  },
  {
    id: 'q2',
    label: `Comment l’interpréter ?`,
    type: 'select',
    options: [
      { label: ``, value: '' },
      { label: ``, value: '' },
      { label: ``, value: '' },
      { label: ``, value: '' },
      { label: ``, value: '' },
      { label: ``, value: '' }
    ],
  }
  ],
};
