export type Niveau = 'faible'|'moyen'|'fort'

// Table d'estimation kcal/j selon l'âge, le sexe et le niveau d'activité globale.
// NOTE: valeurs par défaut indicatives, à ajuster selon votre référentiel SIIN.
// Modifiez librement ces nombres pour refléter votre table officielle.

const table: Record<'masculin'|'feminin', Record<'<45'|'45-64'|'>=65', Record<Niveau, number>>> = {
  masculin: {
    '<45':   { faible: 2000, moyen: 2400, fort: 2600 },
    '45-64': { faible: 1900, moyen: 2300, fort: 2500 },
    '>=65':  { faible: 1800, moyen: 2200, fort: 2400 },
  },
  feminin: {
    '<45':   { faible: 1800, moyen: 2100, fort: 2300 },
    '45-64': { faible: 1700, moyen: 2000, fort: 2200 },
    '>=65':  { faible: 1600, moyen: 1900, fort: 2100 },
  },
}

export function estimateKcal(age: string|undefined, sexe: string|undefined, niveau: Niveau): number | null {
  const sexKey = (sexe === 'masculin' || sexe === 'feminin') ? sexe : undefined
  const ageKey = (age === '<45' || age === '45-64' || age === '>=65') ? age : undefined
  if (!sexKey || !ageKey) return null
  return table[sexKey][ageKey][niveau]
}

