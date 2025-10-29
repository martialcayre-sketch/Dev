export type QOption = { value: string; label: string }
export type QField = { type: 'radio'; id: string; label: string; options: QOption[] }
export type QSchema = { id: string; title: string; fields: QField[] }

export const schema: QSchema = {
  id: 'questionnaire-dactivite-et-de-depense-energetique-globale-siin',
  title: 'Activité et dépense énergétique (SIIN)',
  fields: [
    { type: 'radio', id: 'travail', label: 'Que faites-vous lors de votre travail ?', options: [
      { value: 'faible', label: 'Je reste assis en permanence' },
      { value: 'moyen',  label: 'Je me lève et marche fréquemment' },
      { value: 'fort',   label: 'J’exerce un travail manuel' },
    ]},
    { type: 'radio', id: 'hors_travail', label: 'Que faites-vous en dehors de votre travail ?', options: [
      { value: 'faible', label: 'Je reste assis' },
      { value: 'moyen',  label: 'J’ai une activité sportive de loisirs' },
      { value: 'fort',   label: 'J’ai une activité sportive de compétition' },
    ]},
    { type: 'radio', id: 'age', label: 'Âge', options: [
      { value: '<45', label: '< 45 ans' },
      { value: '45-64', label: '45–64 ans' },
      { value: '>=65', label: '≥ 65 ans' },
    ]},
    { type: 'radio', id: 'sexe', label: 'Sexe', options: [
      { value: 'masculin', label: 'Masculin' },
      { value: 'feminin', label: 'Féminin' },
    ]},
  ],
}
