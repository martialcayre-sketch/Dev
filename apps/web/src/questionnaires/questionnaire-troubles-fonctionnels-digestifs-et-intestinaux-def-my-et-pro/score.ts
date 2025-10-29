// TODO: Implémenter le calcul du score d'après la notice du questionnaire.
export function score(payload: Record<string, any>): Record<string, number> {
  const sum = (ids: string[]) => ids.reduce((a, k) => a + Number(payload[k] || 0), 0)
  const c1 = sum(['c1_bouche_seche','c1_aphtes','c1_haleine','c1_brulures_estomac','c1_rgo','c1_toux_postprandiale','c1_medic_acidite','c1_ulcere_hp']) // /24
  const c2 = sum(['c2_digestion_lente','c2_gaz_ballonnements','c2_gaz_odorants','c2_nausees','c2_excès','c2_lactose','c2_migraine_postprandiale']) // /21
  const c3 = sum(['c3_constipation','c3_diarrhee','c3_alternance','c3_besoin_pressant','c3_incomplete']) // /15
  const c4 = sum(['c4_molles','c4_liquides','c4_dures','c4_grasses','c4_mucus','c4_odeur']) // /18
  const c5 = sum(['c5_gene','c5_sensibilite','c5_crampes','c5_coliques','c5_douleur_selle']) // /15
  const total = c1 + c2 + c3 + c4 + c5 // /93
  return { c1, c2, c3, c4, c5, total }
}
