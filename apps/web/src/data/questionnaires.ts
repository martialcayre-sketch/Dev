export type QuestionnaireItem = { id: string; label: string; href: string }
export type QuestionnaireCategory = { id: string; label: string; items: QuestionnaireItem[] }

// Catégories par défaut (modifiables).
export const defaultCategories: QuestionnaireCategory[] = [
  { id: 'alimentaire', label: 'Alimentaire', items: [] },
  { id: 'cancerologie', label: 'Cancerologie', items: [] },
  { id: 'cardiologie', label: 'Cardiologie', items: [] },
  { id: 'gastro-enterologie', label: 'Gastro-enterologie', items: [] },
  { id: 'mode-de-vie', label: 'Mode de vie', items: [
    { id: 'questionnaire-contextuel-mode-de-vie', label: 'questionnaire contextuel mode de vie', href: '/questionnaires/questionnaire-contextuel-mode-de-vie' },
    { id: 'questionnaire-dactivite-et-de-depense-energetique-globale-siin', label: "questionnaire d’activité et de dépense énergétique globale SIIN", href: '/questionnaires/questionnaire-dactivite-et-de-depense-energetique-globale-siin' },
    { id: 'mes-plaintes-actuelles-et-troubles-ressentis', label: 'Mes plaintes actuelles et troubles ressentis', href: '/questionnaires/mes-plaintes-actuelles-et-troubles-ressentis' },
  ] },
  { id: 'neuro-psychologie', label: 'Neuro-psychologie', items: [
    { id: 'had', label: 'HAD', href: '/questionnaires/had' },
    { id: 'dnsm', label: 'DNSM', href: '/questionnaires/dnsm' },
  ]},
  { id: 'pediatrie', label: 'Pédiatrie', items: [] },
  { id: 'gerontologie', label: 'Gerontologie', items: [] },
  { id: 'pneumologie', label: 'Pneumologie', items: [] },
  { id: 'rhumatologie', label: 'Rhumatologie', items: [] },
  { id: 'sommeil', label: 'Sommeil', items: [
    { id: 'psqi', label: 'PSQI', href: '/questionnaires/psqi' },
  ]},
  { id: 'stress', label: 'Stress', items: [] },
  { id: 'tabacologie', label: 'Tabacologie', items: [] },
  { id: 'urologie', label: 'Urologie', items: [] },
]
