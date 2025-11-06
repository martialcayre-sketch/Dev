import type { Questionnaire } from '../../types';

export const first_def_pro: Questionnaire = {
  metadata: {
    id: 'first-def-pro',
    title: `Questionnaire FiRST`,
    category: 'rhumatologie',
  },
  questions: [
  {
    id: 'q1',
    label: `Mes douleurs sont localisées partout dans tout mon corps`,
    type: 'textarea',
  },
  {
    id: 'q2',
    label: `Mes douleurs s’accompagnent d’une fatigue générale`,
    type: 'textarea',
  },
  {
    id: 'q3',
    label: `Mes douleurs sont comme des brûlures, des décharges`,
    type: 'textarea',
  },
  {
    id: 'q4',
    label: `Mes douleurs s’accompagnent d’autres sensations anormales,`,
    type: 'textarea',
  },
  {
    id: 'q5',
    label: `Mes douleurs s’accompagnent d’autres problèmes de santé`,
    type: 'textarea',
  },
  {
    id: 'q6',
    label: `Mes douleurs ont un retentissement important dans ma vie, en`,
    type: 'textarea',
  }
  ],
};
