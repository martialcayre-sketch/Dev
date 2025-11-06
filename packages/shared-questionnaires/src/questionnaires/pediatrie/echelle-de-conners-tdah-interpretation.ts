import type { Questionnaire } from '../../types';

export const echelle_de_conners_tdah_interpretation: Questionnaire = {
  metadata: {
    id: 'echelle-de-conners-tdah-interpretation',
    title: `Conners 3 Update`,
    category: 'pediatrie',
  },
  questions: [
  {
    id: 'q1',
    label: `Validity Scale It is recommended that clinical judgment be used in the`,
    type: 'textarea',
  },
  {
    id: 'q2',
    label: `T-Score Interpretation Note that these guidelines are approximations and should`,
    type: 'textarea',
  },
  {
    id: 'q3',
    label: `Defiance/Aggression`,
    type: 'textarea',
  }
  ],
};
