import type { Questionnaire } from '../../types';

export const questionnaire_echelle_devaluation_bms_burn_out_def_pro: Questionnaire = {
  metadata: {
    id: 'questionnaire-echelle-devaluation-bms-burn-out-def-pro',
    title: `Questionnaire :`,
    category: 'stress',
  },
  questions: [
  {
    id: 'q2',
    label: `5 – 3.4 Faible`,
    type: 'textarea',
  },
  {
    id: 'q3',
    label: `5 – 4.4 Modéré`,
    type: 'textarea',
  },
  {
    id: 'q4',
    label: `5 – 5.4 Elevé`,
    type: 'textarea',
  }
  ],
};
