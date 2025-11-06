import type { Questionnaire } from '../../types';

export const questionnaire_di_franza_nicotine_def_pro: Questionnaire = {
  metadata: {
    id: 'questionnaire-di-franza-nicotine-def-pro',
    title: `Questionnaire : Test de Di Franza`,
    category: 'tabacologie',
  },
  questions: [
  {
    id: 'q1',
    label: `As-tu déjà essayé d’arrêter de fumer sans y parvenir ? Cochez`,
    type: 'textarea',
  },
  {
    id: 'q2',
    label: `Fumes-tu parce qu’il t’est très difficile d’arrêter de fumer ?`,
    type: 'textarea',
  },
  {
    id: 'q3',
    label: `T’es-tu déjà senti accroc à la cigarette ?`,
    type: 'textarea',
  },
  {
    id: 'q4',
    label: `As-tu déjà eu de très fortes envies incontrôlables de cigarette ?`,
    type: 'textarea',
  },
  {
    id: 'q5',
    label: `As-tu déjà ressenti un fort besoin de cigarette ?`,
    type: 'textarea',
  },
  {
    id: 'q6',
    label: `Est-ce qu’il t’est difficile de ne pas fumer dans les endroits où il est interdit de`,
    type: 'textarea',
  },
  {
    id: 'q7',
    label: `Trouvais-tu qu’il t’était difficile de te concentrer sur quelque chose parce que`,
    type: 'textarea',
  },
  {
    id: 'q8',
    label: `Te sentais-tu plus irritable parce que tu ne pouvais pas fumer ?`,
    type: 'textarea',
  },
  {
    id: 'q9',
    label: `Ressentais-tu des envies irrésistibles et urgentes de fumer ?`,
    type: 'textarea',
  },
  {
    id: 'q10',
    label: `Te sentais-tu nerveux, agité ou anxieux parce que tu ne pouvais pas fumer ?`,
    type: 'textarea',
  }
  ],
};
