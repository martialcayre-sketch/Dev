import type { Questionnaire } from '../../types';

export const hit_de_patients_migraineux_def_pro: Questionnaire = {
  metadata: {
    id: 'hit-de-patients-migraineux-def-pro',
    title: `Questionnaire HIT de patients migraineux`,
    category: 'neuro-psychologie',
  },
  questions: [
  {
    id: 'q1',
    label: `Lorsque vous avez des maux de tête, la 6 8 10 11 13`,
    type: 'textarea',
  },
  {
    id: 'q2',
    label: `Votre capacité à effectuer vos activités 6 8 10 11 13`,
    type: 'textarea',
  },
  {
    id: 'q3',
    label: `Lorsque vous avez des maux de tête, 6 8 10 11 13`,
    type: 'textarea',
  },
  {
    id: 'q4',
    label: `Au cours de ces 4 dernières semaines, 6 8 10 11 13`,
    type: 'textarea',
  },
  {
    id: 'q5',
    label: `Au cours de ces 4 dernières semaines, 6 8 10 11 13`,
    type: 'textarea',
  },
  {
    id: 'q6',
    label: `Au cours de ces 4 dernières semaines, 6 8 10 11 13`,
    type: 'textarea',
  }
  ],
};
