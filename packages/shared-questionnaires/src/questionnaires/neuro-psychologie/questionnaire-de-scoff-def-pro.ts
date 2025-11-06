import type { Questionnaire } from '../../types';

export const questionnaire_de_scoff_def_pro: Questionnaire = {
  metadata: {
    id: 'questionnaire-de-scoff-def-pro',
    title: `Questionnaire :`,
    category: 'neuro-psychologie',
  },
  questions: [
  {
    id: 'q1',
    label: `Vous êtes-vous déjà fait vomir parce que vous ne vous sentiez pas bien Cochez`,
    type: 'textarea',
  },
  {
    id: 'q2',
    label: `Craignez-vous d’avoir perdu le contrôle des quantités que vous mangez ?`,
    type: 'textarea',
  },
  {
    id: 'q3',
    label: `Avez-vous perdu plus de 6 kilos en moins de trois mois ?`,
    type: 'textarea',
  },
  {
    id: 'q4',
    label: `Pensez-vous que vous êtes trop gros(se) alors que les autres vous considèrent`,
    type: 'textarea',
  },
  {
    id: 'q5',
    label: `Diriez-vous que la nourriture est quelque chose qui occupe une place`,
    type: 'textarea',
  }
  ],
};
