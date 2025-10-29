export type QField = { type: 'likert'; id: string; label: string; min: number; max: number }
export type QSchema = { id: string; title: string; fields: QField[] }

const L = (id: string, label: string): QField => ({ type: 'likert', id, label, min: 0, max: 3 })

export const schema: QSchema = {
  id: 'questionnaire-troubles-fonctionnels-digestifs-et-intestinaux-def-my-et-pro',
  title: 'Troubles fonctionnels digestifs et intestinaux (v2021)',
  fields: [
    L('c1_bouche_seche','Bouche sèche, manque de salive'),
    L('c1_aphtes','Aphtes/douleurs dans la bouche'),
    L('c1_haleine','Mauvaise haleine, langue chargée'),
    L('c1_brulures_estomac','Douleurs/brûlures d’estomac'),
    L('c1_rgo','Reflux/brûlures acides'),
    L('c1_toux_postprandiale','Toux fréquente après repas'),
    L('c1_medic_acidite','Médicament pour acidité d’estomac'),
    L('c1_ulcere_hp','Antécédent ulcère / Helicobacter pylori'),
    L('c2_digestion_lente','Digestion lente'),
    L('c2_gaz_ballonnements','Gaz, ballonnements après repas'),
    L('c2_gaz_odorants','Gaz/pets malodorants'),
    L('c2_nausees','Nausées après repas'),
    L('c2_excès','Intolérance aux excès, alcool, gras'),
    L('c2_lactose','Intolérance produits laitiers/lactose'),
    L('c2_migraine_postprandiale','Migraines après certains repas/aliments'),
    L('c3_constipation','Constipation fréquente'),
    L('c3_diarrhee','Transit accéléré, diarrhées'),
    L('c3_alternance','Alternance constipation/diarrhée'),
    L('c3_besoin_pressant','Besoin pressant d’aller à la selle'),
    L('c3_incomplete','Sensation de défécation incomplète'),
    L('c4_molles','Selles molles, mal liées'),
    L('c4_liquides','Selles liquides'),
    L('c4_dures','Selles très dures'),
    L('c4_grasses','Selles grasses/collantes/pâteuses'),
    L('c4_mucus','Glaires/mucus dans les selles'),
    L('c4_odeur','Selles très malodorantes'),
    L('c5_gene','Gêne ventre/intestin'),
    L('c5_sensibilite','Ventre/intestin sensibles'),
    L('c5_crampes','Crampes intestinales douloureuses'),
    L('c5_coliques','Crises de coliques (heures à jours)'),
    L('c5_douleur_selle','Douleur à la selle'),
  ],
}

