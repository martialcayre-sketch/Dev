// TODO: Implémenter le calcul du score d'après la notice du questionnaire.
export function score(payload: Record<string, any>): Record<string, number> {
  const sum = (ids: string[]) => ids.reduce((a, k) => a + Number(payload[k] || 0), 0)
  const d = sum(['d1','d2','d3','d4','d5','d6','d7','d8','d9','d10'])
  const n = sum(['n1','n2','n3','n4','n5','n6','n7','n8','n9','n10'])
  const s = sum(['s1','s2','s3','s4','s5','s6','s7','s8','s9','s10'])
  const m = sum(['m1','m2','m3','m4','m5','m6','m7','m8','m9','m10'])
  const total = d + n + s + m
  return { d, n, s, m, total }
}
