import type { Questionnaire } from '../../types';

export const tinetti: Questionnaire = {
  metadata: {
    id: 'tinetti',
    title: `NOM : Date :`,
    category: 'gerontologie',
  },
  questions: [
  {
    id: 'q1',
    label: `équilibre en - penche ou s’affale 0 10. se mettre en - hésitation ou diverses 0`,
    type: 'select',
    options: [
      { label: ``, value: '' },
      { label: ``, value: '' }
    ],
  },
  {
    id: 'q2',
    label: `se mettre - impossible sans aide 0 - ne se détache pas du sol 0`,
    type: 'select',
    options: [
      { label: ``, value: '' },
      { label: ``, value: '' }
    ],
  },
  {
    id: 'q3',
    label: `tentatives pour - impossible sans aide 0 12. symétrie du - inégalité des pas G et D 0`,
    type: 'select',
    options: [
      { label: ``, value: '' }
    ],
  },
  {
    id: 'q4',
    label: `équilibre debout - instable (vacille, bouge les 0 13. continuité du - arrêts ou discontinuité des pas 0`,
    type: 'select',
    options: [
      { label: ``, value: '' },
      { label: ``, value: '' }
    ],
  },
  {
    id: 'q5',
    label: `équilibre debout - instable 0 14. marche - nette déviance 0`,
    type: 'select',
    options: [
      { label: ``, value: '' }
    ],
  },
  {
    id: 'q6',
    label: `poussée sur le - commence à vaciller 0 15. tronc - mouvement prononcé du tronc 0`,
    type: 'select',
    options: [
      { label: ``, value: '' },
      { label: ``, value: '' }
    ],
  },
  {
    id: 'q7',
    label: `yeux fermés - instable 0 16. écartement - talons séparés 0`,
    type: 'textarea',
  },
  {
    id: 'q8',
    label: `rotation de 360° - petits pas irréguliers 0`,
    type: 'select',
    options: [
      { label: ``, value: '' },
      { label: ``, value: '' },
      { label: ``, value: '' }
    ],
  },
  {
    id: 'q9',
    label: `s’asseoir - peu sûr (tombe, calcule mal la 0`,
    type: 'select',
    options: [
      { label: ``, value: '' },
      { label: ``, value: '' }
    ],
  }
  ],
};
