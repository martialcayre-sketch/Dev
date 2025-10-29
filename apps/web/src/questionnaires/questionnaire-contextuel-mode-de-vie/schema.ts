export type QOption = { value: string; label: string }
export type QField =
  | { type: 'radio'; id: string; label: string; options: QOption[] }
  | { type: 'likert'; id: string; label: string; min: number; max: number; left?: string; right?: string }
  | { type: 'multi'; id: string; label: string; options: QOption[] }

export type QSchema = { id: string; title: string; fields: QField[] }

export const schema: QSchema = {
  id: 'questionnaire-contextuel-mode-de-vie',
  title: 'Questionnaire contextuel mode de vie',
  fields: [
    // Domaines principaux (échelles 0–10) pour limiter la saisie clavier
    { type: 'likert', id: 'sommeil', label: 'Votre sommeil', min: 0, max: 10, left: 'Mauvais', right: 'Très bon' },
    { type: 'likert', id: 'rythme_biologique', label: 'Votre rythme biologique', min: 0, max: 10, left: 'Désynchronisé', right: 'Très régulier' },
    { type: 'likert', id: 'adaptation_stress', label: 'Votre adaptation et le stress', min: 0, max: 10, left: 'Stress élevé', right: 'Stress faible' },
    { type: 'likert', id: 'activite_physique', label: 'Votre activité physique', min: 0, max: 10, left: 'Faible', right: 'Élevée' },
    { type: 'likert', id: 'exposition_toxiques', label: 'Votre exposition aux toxiques', min: 0, max: 10, left: 'Élevée', right: 'Faible' },
    { type: 'likert', id: 'relations', label: 'Votre relation aux autres', min: 0, max: 10, left: 'Peu soutenant', right: 'Très soutenant' },
    { type: 'likert', id: 'mode_alimentaire', label: 'Votre mode alimentaire', min: 0, max: 10, left: 'Peu équilibré', right: 'Très équilibré' },
    // Contraintes (boutons multi-sélections)
    { type: 'multi', id: 'contraintes', label: 'Contraintes principales', options: [
      { value: 'horaires', label: 'Horaires' },
      { value: 'deplacements', label: 'Déplacements' },
      { value: 'familiales', label: 'Familiales' },
      { value: 'autres', label: 'Autres' },
    ]},
  ],
}
