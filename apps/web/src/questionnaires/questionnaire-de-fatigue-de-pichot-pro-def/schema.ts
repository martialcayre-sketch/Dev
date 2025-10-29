export type QField = { type: 'likert'; id: string; label: string; min: number; max: number; left?: string; right?: string }
export type QSchema = { id: string; title: string; fields: QField[] }

export const schema: QSchema = {
  id: 'questionnaire-de-fatigue-de-pichot-pro-def',
  title: 'Questionnaire de fatigue de Pichot',
  fields: [
    { type: 'likert', id: 'energie', label: "Je manque d’énergie", min: 0, max: 4, left: '0 = pas du tout', right: '4 = extrêmement' },
    { type: 'likert', id: 'effort', label: 'Tout me demande un effort', min: 0, max: 4 },
    { type: 'likert', id: 'faiblesse', label: 'Je me sens faible à certains endroits du corps', min: 0, max: 4 },
    { type: 'likert', id: 'lourdeur', label: 'J’ai les bras ou les jambes lourdes', min: 0, max: 4 },
    { type: 'likert', id: 'fatigue_sans_raison', label: 'Je me sens fatigué(e) sans raison', min: 0, max: 4 },
    { type: 'likert', id: 'envie_repos', label: 'J’ai envie de m’allonger pour me reposer', min: 0, max: 4 },
    { type: 'likert', id: 'concentration', label: 'J’ai du mal à me concentrer', min: 0, max: 4 },
    { type: 'likert', id: 'lourd_raide', label: 'Je me sens fatigué(e), lourd(e) et raide', min: 0, max: 4 },
  ],
}

