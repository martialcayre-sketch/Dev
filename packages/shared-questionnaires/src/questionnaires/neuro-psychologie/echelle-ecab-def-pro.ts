import type { Questionnaire } from '../../types';

export const echelle_ecab_def_pro: Questionnaire = {
  metadata: {
    id: 'echelle-ecab-def-pro',
    title: `Questionnaire`,
    category: 'neuro-psychologie',
  },
  questions: [
  {
    id: 'q1',
    label: `Où que j’aille, j’ai besoin d’avoir ce médicament avec moi Vrai Faux`,
    type: 'textarea',
  },
  {
    id: 'q2',
    label: `Ce médicament est pour moi comme une drogue Vrai Faux`,
    type: 'textarea',
  },
  {
    id: 'q3',
    label: `Je pense souvent que je ne pourrai jamais arrêter ce Vrai Faux`,
    type: 'textarea',
  },
  {
    id: 'q4',
    label: `J’évite de dire à mes proches que je prends ce médicament Vrai Faux`,
    type: 'textarea',
  },
  {
    id: 'q5',
    label: `J’ai l’impression de prendre beaucoup trop ce médicament Vrai Faux`,
    type: 'textarea',
  },
  {
    id: 'q6',
    label: `J’ai parfois peur à l’idée de manquer de ce médicament Vrai Faux`,
    type: 'textarea',
  },
  {
    id: 'q7',
    label: `Lorsque j’arrête ce médicament, je me sens très malade Vrai Faux`,
    type: 'textarea',
  },
  {
    id: 'q8',
    label: `Je prends ce médicament parce que je ne peux plus m’en Vrai Faux`,
    type: 'textarea',
  },
  {
    id: 'q9',
    label: `Je prends ce médicament parce que je vais mal quand Vrai Faux`,
    type: 'textarea',
  },
  {
    id: 'q10',
    label: `Je ne prends ce médicament que lorsque j’en ressens le Vrai Faux`,
    type: 'textarea',
  }
  ],
};
