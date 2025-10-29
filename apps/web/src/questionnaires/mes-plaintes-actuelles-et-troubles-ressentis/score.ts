export type Score = { total: number } & Record<string, number>
export function score(payload: Record<string, any>): Score {
  const keys = ['fatigue','douleurs','digestion','surpoids','insomnie','moral','mobilite']
  const perItem: Record<string, number> = {}
  let total = 0
  for (const k of keys) {
    const v = Number(payload[k] ?? 0)
    perItem[k] = v
    total += v
  }
  return { total, ...perItem }
}
