export type QOption = { value: string; label: string }
export type QField =
  | { type: 'radio'; id: string; label: string; options: QOption[] }
  | { type: 'likert'; id: string; label: string; min: number; max: number; left?: string; right?: string }
  | { type: 'multi'; id: string; label: string; options: QOption[] }
  | { type: 'text'; id: string; label: string; placeholder?: string }

export type QSchema = { id: string; title: string; fields: QField[] }

// TODO: Compléter le schéma d'après le PDF original (items, options, échelles).
export const schema: QSchema = {
  id: 'score-de-francis-des-troubles-fonctionnels-intestinaux-def-pro',
  title: "Score de Francis des troubles fonctionnels intestinaux",
  fields: [
    // Exemple minimal (à remplacer):
    // { type: 'likert', id: 'q1', label: 'Échelle 1–10', min: 1, max: 10, left: 'Min', right: 'Max' },
    // { type: 'radio', id: 'q2', label: 'Choix unique', options: [ { value: 'a', label: 'A' }, { value:'b', label:'B' } ] },
  ],
}
