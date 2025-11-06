import type { Questionnaire } from '../../types';

export const echelle_de_somnolence_depsworth_my_et_pro_ok: Questionnaire = {
  metadata: {
    id: 'echelle-de-somnolence-depsworth-my-et-pro-ok',
    title: `Questionnaire`,
    category: 'sommeil',
  },
  questions: [
  {
    id: 'q1',
    label: `Pendant que vous êtes occupé à lire un 0 1 2 3`,
    type: 'textarea',
  },
  {
    id: 'q2',
    label: `Devant la télévision ou au cinéma 0 1 2 3`,
    type: 'textarea',
  },
  {
    id: 'q3',
    label: `Assis inactif dans un lieu public (salle 0 1 2 3`,
    type: 'textarea',
  },
  {
    id: 'q4',
    label: `Passager, depuis au moins une heure sans 0 1 2 3`,
    type: 'textarea',
  },
  {
    id: 'q5',
    label: `Allongé pour une sieste, lorsque les 0 1 2 3`,
    type: 'textarea',
  },
  {
    id: 'q6',
    label: `En position assise au cours d’une 0 1 2 3`,
    type: 'textarea',
  },
  {
    id: 'q7',
    label: `Tranquillement assis à table à la fin d’un 0 1 2 3`,
    type: 'textarea',
  },
  {
    id: 'q8',
    label: `Au volant d’une voiture immobilisée 0 1 2 3`,
    type: 'textarea',
  }
  ],
};
