export type Niveau = 'faible'|'moyen'|'fort'
export type Score = { activite_globale: Niveau, travail: Niveau, hors_travail: Niveau, age?: string, sexe?: string, kcal_estime?: number|null }
import { estimateKcal } from './kcalTable'
export function score(payload: Record<string, any>): Score {
  const t = (payload.travail ?? 'faible') as Niveau
  const h = (payload.hors_travail ?? 'faible') as Niveau
  const activite_globale: Niveau = (t === 'fort' || h === 'fort') ? 'fort' : ((t === 'moyen' || h === 'moyen') ? 'moyen' : 'faible')
  const age = String(payload.age||'')
  const sexe = String(payload.sexe||'')
  const kcal = estimateKcal(age, sexe, activite_globale)
  return { activite_globale, travail: t, hors_travail: h, age, sexe, kcal_estime: kcal }
}
