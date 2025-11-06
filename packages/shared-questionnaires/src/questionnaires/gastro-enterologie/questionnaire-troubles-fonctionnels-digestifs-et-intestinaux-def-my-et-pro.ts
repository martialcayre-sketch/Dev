import type { Questionnaire } from '../../types';

export const questionnaire_troubles_fonctionnels_digestifs_et_intestinaux_def_my_et_pro: Questionnaire = {
  metadata: {
    id: 'questionnaire-troubles-fonctionnels-digestifs-et-intestinaux-def-my-et-pro',
    title: `Questionnaire :`,
    category: 'gastro-enterologie',
  },
  questions: [
  {
    id: 'q1',
    label: `Digestifs supérieurs (24)`,
    type: 'textarea',
  },
  {
    id: 'q2',
    label: `Moyen grêle (21)`,
    type: 'textarea',
  },
  {
    id: 'q3',
    label: `Transit (15)`,
    type: 'textarea',
  },
  {
    id: 'q4',
    label: `Selles (18)`,
    type: 'textarea',
  },
  {
    id: 'q5',
    label: `Douleurs intestinales (15)`,
    type: 'textarea',
  }
  ],
};
