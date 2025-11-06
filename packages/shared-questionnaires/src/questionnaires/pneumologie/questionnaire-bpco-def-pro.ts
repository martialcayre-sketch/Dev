import type { Questionnaire } from '../../types';

export const questionnaire_bpco_def_pro: Questionnaire = {
  metadata: {
    id: 'questionnaire-bpco-def-pro',
    title: `Questionnaire BPCO`,
    category: 'pneumologie',
  },
  questions: [
  {
    id: 'q1',
    label: `Je souffre de mon essoufflement`,
    type: 'textarea',
  },
  {
    id: 'q2',
    label: `Je me fais du souci pour mon état`,
    type: 'textarea',
  },
  {
    id: 'q3',
    label: `Je me sens incompris(e) par mon`,
    type: 'textarea',
  },
  {
    id: 'q4',
    label: `Mon état respiratoire m’empêche de me`,
    type: 'textarea',
  },
  {
    id: 'q5',
    label: `Je suis somnolent(e) dans la journée`,
    type: 'textarea',
  },
  {
    id: 'q6',
    label: `Je me sens incapable de réaliser mes`,
    type: 'textarea',
  },
  {
    id: 'q7',
    label: `Je me fatigue rapidement dans les`,
    type: 'textarea',
  },
  {
    id: 'q8',
    label: `Physiquement, je suis insatisfait(e) de ce`,
    type: 'textarea',
  },
  {
    id: 'q9',
    label: `Ma maladie respiratoire perturbe ma vie`,
    type: 'textarea',
  },
  {
    id: 'q10',
    label: `Je me sens triste`,
    type: 'textarea',
  },
  {
    id: 'q11',
    label: `Mon état respiratoire limite ma vie`,
    type: 'textarea',
  }
  ],
};
