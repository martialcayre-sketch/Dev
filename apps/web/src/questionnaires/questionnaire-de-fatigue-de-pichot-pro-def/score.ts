// TODO: Implémenter le calcul du score d'après la notice du questionnaire.
export function score(payload: Record<string, any>): Record<string, number> {
  const keys = ['energie','effort','faiblesse','lourdeur','fatigue_sans_raison','envie_repos','concentration','lourd_raide']
  let total = 0
  for (const k of keys) total += Number(payload[k] || 0)
  // Interprétation selon le PDF: >22 = signe de fatigue
  return { total }
}
