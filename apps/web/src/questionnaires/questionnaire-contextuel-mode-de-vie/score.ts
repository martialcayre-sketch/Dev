export type Score = {
  total: number
  sommeil: number
  rythme_biologique: number
  adaptation_stress: number
  activite_physique: number
  exposition_toxiques: number
  relations: number
  mode_alimentaire: number
}
export function score(payload: Record<string, any>): Score {
  const keys = ['sommeil','rythme_biologique','adaptation_stress','activite_physique','exposition_toxiques','relations','mode_alimentaire'] as const
  const result: any = {}
  let total = 0
  for (const k of keys) {
    const v = Number(payload[k] ?? 0)
    result[k] = v
    total += v
  }
  result.total = total
  return result as Score
}
