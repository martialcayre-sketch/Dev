// TODO: Implémenter le calcul du score d'après la notice du questionnaire.
export function score(payload: Record<string, any>): Record<string, number> {
  const ids = Array.from({ length: 10 }, (_, i) => `q${i + 1}`)
  let total = 0
  for (const id of ids) total += Number(payload[id] || 0)
  // Interprétation (du PDF): <21 bonne gestion; 21–26 adaptation inconstante; >27 élevé
  return { total }
}
