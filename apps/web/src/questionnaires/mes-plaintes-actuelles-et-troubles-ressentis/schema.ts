export type QOption = { value: string; label: string }
export type QField =
  | { type: 'multi'; id: string; label: string; options: QOption[] }
  | { type: 'likert'; id: string; label: string; min: number; max: number; left?: string; right?: string }
  | { type: 'text'; id: string; label: string; placeholder?: string }

export type QSchema = { id: string; title: string; fields: QField[] }

export const schema: QSchema = {
  id: 'mes-plaintes-actuelles-et-troubles-ressentis',
  title: 'Mes plaintes actuelles et troubles ressentis',
  fields: [
    { type: 'likert', id: 'fatigue', label: 'Fatigue (1 = bonne vitalité, 10 = très fatigué·e/épuisé·e)', min: 1, max: 10 },
    { type: 'likert', id: 'douleurs', label: 'Douleurs (1 = aucune douleur, 10 = douleurs intenses ou chroniques)', min: 1, max: 10 },
    { type: 'likert', id: 'digestion', label: 'Digestion (1 = aucun problème digestif/intestinal, 10 = beaucoup de troubles)', min: 1, max: 10 },
    { type: 'likert', id: 'surpoids', label: 'Surpoids (1 = aucun problème de poids, 10 = problèmes importants)', min: 1, max: 10 },
    { type: 'likert', id: 'insomnie', label: 'Insomnie (1 = aucun problème de sommeil, 10 = insomnie ou troubles du sommeil)', min: 1, max: 10 },
    { type: 'likert', id: 'moral', label: 'Moral (1 = bon moral/serein·e, 10 = troubles dépressifs/anxiété/angoisse)', min: 1, max: 10 },
    { type: 'likert', id: 'mobilite', label: 'Mobilité (1 = aucun problème de mobilité, 10 = troubles importants de mobilité)', min: 1, max: 10 },
  ],
}
