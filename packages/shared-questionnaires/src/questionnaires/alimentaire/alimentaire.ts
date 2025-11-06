import type { Questionnaire, QuestionOption } from '../../types';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function parseOption(raw: string): QuestionOption {
  const pointsMatch = raw.match(/\((\d+)\s*pt[s]?\)\s*$/i);
  const points = pointsMatch ? parseInt(pointsMatch[1], 10) : undefined;
  const label = raw.replace(/\s*\(\d+\s*pt[s]?\)\s*$/i, '').trim();
  return {
    label,
    value: slugify(label) || label,
    points,
  };
}

function mapOptions(options: string[]): QuestionOption[] {
  return options.map(parseOption);
}

export const alimentaire: Questionnaire = {
  metadata: {
    id: 'alimentaire',
    title: 'Questionnaire Alimentaire (SIIN)',
    category: 'alimentaire',
    description: 'Enquête des habitudes et choix alimentaires (inspirée SIIN)',
    estimatedDuration: 12,
    version: '1.0',
    tags: ['alimentation', 'nutrition', 'habitudes'],
  },
  questions: [
    {
      id: 'eau_jour',
      label:
        "Combien de verres d'eau ou de litres d'eau buvez-vous chaque jour ? (en incluant thé, tisanes, café…)",
      type: 'select',
      options: mapOptions([
        '<6 verres ou <0,75l (0 pt)',
        '6-12 verres ou 0,75-1,5l (0 pt)',
        '>12 verres ou >1,5l (1 pt)',
      ]),
    },
    {
      id: 'cafe_jour',
      label: 'Combien de tasses de café buvez-vous chaque jour ?',
      type: 'select',
      options: mapOptions(['0 (0 pt)', '1 à 5 (1 pt)', '>5 (0 pt)']),
    },
    {
      id: 'the_jour',
      label: 'Combien de tasses de thé buvez-vous chaque jour ?',
      type: 'select',
      options: mapOptions(['0 (0 pt)', '1 à 5 (1 pt)', '>5 (0 pt)']),
    },
    {
      id: 'jus_fruits',
      label: 'Combien de jus de fruits, sans sucre rajouté, buvez-vous chaque jour ?',
      type: 'select',
      options: mapOptions(['0 à 1 (1 pt)', '2 à 3 (0 pt)', '>3 (0 pt)']),
    },
    {
      id: 'boissons_sucrees',
      label: 'Combien de boissons sucrées (sodas, cola, limonade…) buvez-vous chaque jour ?',
      type: 'select',
      options: mapOptions(['0 ou <1 (1 pt)', '1 à 2 (0 pt)', '>2 (0 pt)']),
    },
    {
      id: 'vin_jour',
      label: 'Combien de verres de vin buvez-vous en moyenne chaque jour ?',
      type: 'select',
      options: mapOptions(['0, 1 ou <2 (1 pt)', '2 à 3 (0 pt)', '>3 (0 pt)']),
    },
    {
      id: 'alcool_semaine',
      label: 'Combien de verres de vin ou boissons alcoolisées buvez-vous chaque semaine ?',
      type: 'select',
      options: mapOptions(['<10 (2 pt)', '10-15 (1 pt)', '>15 (0 pt)']),
    },
    {
      id: 'legumes_jour',
      label: "Combien de portions d'environ 80 g de légumes consommez-vous chaque jour ?",
      type: 'select',
      options: mapOptions(['<3 (0 pt)', '3-5 (1 pt)', '>5 (2 pt)']),
    },
    {
      id: 'fruits_jour',
      label: 'Combien de fruits entiers consommez-vous chaque jour ?',
      type: 'select',
      options: mapOptions(['0 (0 pt)', '1, 2 ou 3 (2 pt)', '>3 (1 pt)']),
    },
    {
      id: 'cereales_completes',
      label:
        'Combien de portions de céréales complètes ou semi complètes consommez-vous chaque jour ? (80-100 g de riz complet, quinoa, flocons…)',
      type: 'select',
      options: mapOptions(['0 (0 pt)', '1 ou 2 (1 pt)', '>2 (2 pt)']),
    },
    {
      id: 'pref_cereales_completes',
      label:
        'Consommez-vous préférentiellement, au moins une fois sur 2, des céréales complètes plutôt que raffinées ?',
      type: 'select',
      options: mapOptions(['Non (0 pt)', 'Parfois (1 pt)', 'Oui (2 pt)']),
    },
    {
      id: 'pain_complet',
      label: 'Consommez-vous préférentiellement du pain complet plutôt que du pain blanc ?',
      type: 'select',
      options: mapOptions(['Non (0 pt)', 'Parfois (1 pt)', 'Oui (2 pt)']),
    },
    {
      id: 'legumes_secs',
      label: 'Combien de portions de légumes secs consommez-vous chaque semaine ? (150 g)',
      type: 'select',
      options: mapOptions(['<1 (0 pt)', '1-2 (1 pt)', '3 ou + (2 pt)']),
    },
    {
      id: 'noix_grenoble',
      label: 'Combien de portions de noix « de Grenoble » consommez-vous chaque semaine ? (30 g)',
      type: 'select',
      options: mapOptions(['<1 (0 pt)', '1-2 (1 pt)', '3 ou + (2 pt)']),
    },
    {
      id: 'fruits_secs',
      label:
        'Combien de portions de fruits secs non sucrés/salés (amandes, noisettes, pistaches…) consommez-vous par semaine ?',
      type: 'select',
      options: mapOptions(['<1 (0 pt)', '1-2 (1 pt)', '3 ou + (2 pt)']),
    },
    {
      id: 'huile_colza',
      label:
        "Utilisez-vous de l'huile de colza comme huile principale de cuisine ou d'assaisonnement ?",
      type: 'select',
      options: mapOptions(['Non (0 pt)', 'Parfois (1 pt)', 'Oui (2 pt)']),
    },
    {
      id: 'quantite_colza',
      label: "Combien de cuillères à soupe d'huile de colza consommez-vous chaque jour ?",
      type: 'select',
      options: mapOptions(['<1 (0 pt)', '1-2 (1 pt)', '>2 (2 pt)']),
    },
    {
      id: 'graisses_saturees',
      label:
        'Combien de portions de beurre, margarine, crème fraîche, graisses de coco consommez-vous quotidiennement ? (12 g)',
      type: 'select',
      options: mapOptions(['<1 (2 pt)', '1-2 (1 pt)', '>2 (0 pt)']),
    },
    {
      id: 'huiles_omega6',
      label:
        'Utilisez-vous des huiles de tournesol, maïs ou pépin de raisin comme huile principale ?',
      type: 'select',
      options: mapOptions(['Non (2 pt)', 'Parfois (1 pt)', 'Oui (0 pt)']),
    },
    {
      id: 'sauces_industrielles',
      label:
        'Combien de sauces industrielles (mayonnaise, sauce salade, barbecue…) consommez-vous par jour ?',
      type: 'select',
      options: mapOptions(['0 ou <1 (2 pt)', '1 (1 pt)', '>1 (0 pt)']),
    },
    {
      id: 'laitages_frais',
      label:
        'Combien de produits laitiers frais, non sucrés consommez-vous chaque jour ? (Yaourt, fromage blanc…)',
      type: 'select',
      options: mapOptions(['0 (0 pt)', '1 ou 2 (1 pt)', '>2 (0 pt)']),
    },
    {
      id: 'laitages_sucres',
      label:
        'Combien de produits laitiers frais et sucrés consommez-vous chaque jour ? (Yaourt aux fruits, desserts lactés…)',
      type: 'select',
      options: mapOptions(['<1 (1 pt)', '1-2 (0 pt)', '>2 (0 pt)']),
    },
    {
      id: 'fromage_jour',
      label: 'Combien de portions de fromage consommez-vous chaque jour ?',
      type: 'select',
      options: mapOptions(['0 ou 1 (1 pt)', '2 (0 pt)', '>2 (0 pt)']),
    },
    {
      id: 'fromage_gras',
      label: 'Combien de portions de fromage « gras » consommez-vous par semaine ?',
      type: 'select',
      options: mapOptions(['<4 (1 pt)', '4-7 (0 pt)', '>7 (0 pt)']),
    },
    {
      id: 'oeufs_omega3',
      label: "Combien d'œufs issus de la filière oméga 3 consommez-vous chaque semaine ?",
      type: 'select',
      options: mapOptions(['<4 (0 pt)', '4 à 14 (2 pt)', '>14 (1 pt)']),
    },
    {
      id: 'oeufs_standard',
      label:
        "Combien d'œufs issus de filières conventionnelles/bio/plein air (non oméga 3) consommez-vous par semaine ?",
      type: 'select',
      options: mapOptions(['<5 (1 pt)', '5-10 (0 pt)', '>10 (0 pt)']),
    },
    {
      id: 'poissons_gras',
      label:
        'Combien de portions de poissons gras (sardine, maquereau, hareng, saumon, thon…) consommez-vous par semaine ? (100 g)',
      type: 'select',
      options: mapOptions(['<1 (0 pt)', '1 (1 pt)', '2 ou plus (2 pt)']),
    },
    {
      id: 'poissons_total',
      label:
        'Combien de portions de 100 g de poisson, tout-venant (y compris poissons gras), consommez-vous chaque semaine ?',
      type: 'select',
      options: mapOptions(['<2 (0 pt)', '2-3 (0 pt)', '4 (1 pt)', '>4 (0 pt)']),
    },
    {
      id: 'coquillages',
      label:
        'Combien de portions de coquillages ou crustacés consommez-vous par semaine ? (4-5 coquillages)',
      type: 'select',
      options: mapOptions(['0 (0 pt)', '>1 (1 pt)', '>2 (2 pt)']),
    },
    {
      id: 'viande_blanche',
      label:
        'Combien de portions de viande blanche ou volaille consommez-vous chaque semaine ? (Poulet, dinde, canard, lapin, porc…)',
      type: 'select',
      options: mapOptions(['<1 (0 pt)', '2 à 3 (1 pt)', '>3 (0 pt)']),
    },
    {
      id: 'viande_rouge',
      label:
        'Combien de portions de viande rouge, hamburger consommez-vous chaque semaine ? (100-150 g)',
      type: 'select',
      options: mapOptions([
        '<3 fois ou <350g (2 pt)',
        '3-5 fois (1 pt)',
        '>5 fois ou >500g (0 pt)',
      ]),
    },
    {
      id: 'preference_volaille',
      label:
        'Consommez-vous préférentiellement des volailles plutôt que du veau, bœuf, saucisses, hamburgers… ?',
      type: 'select',
      options: mapOptions(['Non (0 pt)', 'Parfois (0 pt)', 'Oui (1 pt)']),
    },
    {
      id: 'charcuteries',
      label: 'Combien de portions de charcuteries consommez-vous chaque semaine ?',
      type: 'select',
      options: mapOptions([
        '<3 fois ou <140g (2 pt)',
        '3-5 fois (1 pt)',
        '>5 fois ou >200g (0 pt)',
      ]),
    },
    {
      id: 'pommes_terre',
      label:
        'Combien de pommes de terre consommez-vous chaque semaine ? (Frites, purée, pommes vapeur…)',
      type: 'select',
      options: mapOptions(['<3 (1 pt)', '3-5 (0 pt)', '>5 (0 pt)']),
    },
    {
      id: 'cereales_raffinees',
      label:
        'Combien de portions de pâtes blanches/riz blanc/pain blanc consommez-vous chaque semaine ?',
      type: 'select',
      options: mapOptions(['<3 (1 pt)', '3-7 (0 pt)', '>7 (0 pt)']),
    },
    {
      id: 'produits_sucres',
      label:
        'Consommez-vous régulièrement des produits sucrés industrialisés (confitures, pâte à tartiner, céréales sucrées…) ?',
      type: 'select',
      options: mapOptions(['Non (2 pt)', 'Parfois (1 pt)', 'Oui quotidiennement (0 pt)']),
    },
    {
      id: 'patisseries',
      label:
        'Combien de fois par semaine consommez-vous des pâtisseries industrielles, cookies, biscuits… ?',
      type: 'select',
      options: mapOptions(['<2 (2 pt)', '2-4 (1 pt)', '>4 (0 pt)']),
    },
    {
      id: 'boissons_sucrees_achat',
      label:
        "L'achat ou consommation de boissons sucrées (limonades, jus industriels, sodas, même Light) sont pour moi occasionnelles, jamais quotidiennes.",
      type: 'select',
      options: mapOptions(['Non (0 pt)', 'Parfois (1 pt)', 'Oui (2 pt)']),
    },
    {
      id: 'produits_transformes_caddy',
      label:
        "Lors de mes achats, la part de produits transformés, industrialisés, « prêts à consommer » représente moins d'un cinquième de mon caddy…",
      type: 'select',
      options: mapOptions(['Non (0 pt)', 'Parfois (1 pt)', 'Oui (2 pt)']),
    },
    {
      id: 'ajout_sucre',
      label:
        "J'achète parfois du sucre mais j'en utilise très peu, moins d'une cuillère à soupe par jour (café, thé…)",
      type: 'select',
      options: mapOptions(['Non (0 pt)', 'Parfois (1 pt)', 'Oui (2 pt)']),
    },
    {
      id: 'ajout_sel',
      label: 'Je rajoute du sel fréquemment dans ma cuisson ou dans mon assiette.',
      type: 'select',
      options: mapOptions(['Oui (0 pt)', 'Parfois (0 pt)', 'Non (1 pt)']),
    },
    {
      id: 'produits_sales',
      label:
        "J'achète et consomme assez souvent des produits industrialisés salés (chips, fruits secs apéritifs salés, cacahuètes salées…)",
      type: 'select',
      options: mapOptions(['Oui (0 pt)', 'Parfois (1 pt)', 'Non (2 pt)']),
    },
    {
      id: 'plats_assaisonnes',
      label:
        'Combien de fois par semaine consommez-vous des plats assaisonnés naturellement avec sauce tomate, oignon, ail, curry, curcuma, gingembre, moutarde… ?',
      type: 'select',
      options: mapOptions(['<1 (0 pt)', '1-2 (1 pt)', '>2 (2 pt)']),
    },
    {
      id: 'epices_quotidien',
      label:
        'Consommez-vous chaque jour des épices, aromates, herbes aromatiques, condiments… dans vos préparations ?',
      type: 'select',
      options: mapOptions(['Non (0 pt)', 'Parfois (1 pt)', 'Oui (2 pt)']),
    },
    {
      id: 'aliments_protecteurs_jour',
      label:
        'Consommez-vous chaque jour un ou plusieurs de ces aliments : chocolat noir (>70% cacao), agrumes, petits fruits rouges, thé vert ?',
      type: 'select',
      options: mapOptions(['Non (0 pt)', 'Parfois (1 pt)', 'Oui (2 pt)']),
    },
    {
      id: 'aliments_protecteurs_semaine',
      label: 'Consommez-vous chaque semaine : brocolis, choux, champignons, algues, soja ?',
      type: 'select',
      options: mapOptions(['Non (0 pt)', 'Parfois (1 pt)', 'Oui (2 pt)']),
    },
    {
      id: 'temperatures_cuisson',
      label:
        "Je suis attentif aux températures de cuisson, j'évite les cuissons à haute température, les barbecues, l'excès de brunissement, les fritures…",
      type: 'select',
      options: mapOptions(['Non (0 pt)', 'Parfois (1 pt)', 'Oui (2 pt)']),
    },
    {
      id: 'produits_bio',
      label:
        "Je m'oriente vers des produits bio (légumes, fruits, céréales complètes, pain complet…) à chaque fois que possible.",
      type: 'select',
      options: mapOptions(['Non (0 pt)', 'Parfois (0 pt)', 'Oui (1 pt)']),
    },
    {
      id: 'filiere_omega3',
      label:
        "Je suis attentif aux filières de production et j'achète des produits issus de la filière oméga 3 quand possible.",
      type: 'select',
      options: mapOptions(['Non (0 pt)', 'Parfois (0 pt)', 'Oui (1 pt)']),
    },
    {
      id: 'regularite_repas',
      label: "Je mange régulièrement et j'évite les grignotages entre les repas.",
      type: 'select',
      options: mapOptions(['Non (0 pt)', 'Parfois (1 pt)', 'Oui (2 pt)']),
    },
    {
      id: 'restauration_rapide',
      label:
        'Je mange régulièrement au restaurant, « sur le pouce » ou des plats de « restauration rapide » ou « tout prêts à réchauffer ».',
      type: 'select',
      options: mapOptions(['Oui (0 pt)', 'Parfois (0 pt)', 'Non (1 pt)']),
    },
    {
      id: 'petit_dejeuner',
      label:
        'Je prends chaque jour un petit déjeuner complet, copieux, riche en protéines (œufs, jambon, poissons, fromages, yaourts, amandes…) et pauvre en aliments sucrés.',
      type: 'select',
      options: mapOptions(['Non (0 pt)', 'Parfois (1 pt)', 'Oui (2 pt)']),
    },
    {
      id: 'proteines_matin',
      label:
        'Je consomme régulièrement au cours de mon petit déjeuner des aliments source de protéines…',
      type: 'select',
      options: mapOptions(['Non (0 pt)', 'Parfois (1 pt)', 'Oui (2 pt)']),
    },
    {
      id: 'jeune_nocturne',
      label:
        "Habituellement, entre la fin de mon repas du soir et mon petit-déjeuner il s'écoule environ au moins 10 heures (ex: 21h → 7h).",
      type: 'select',
      options: mapOptions(['Non (0 pt)', 'Parfois (1 pt)', 'Oui (2 pt)']),
    },
    {
      id: 'repartition_repas',
      label:
        'Je privilégie un petit déjeuner et un déjeuner copieux avec un repas du soir léger et digeste.',
      type: 'select',
      options: mapOptions(['Non (0 pt)', 'Parfois (0 pt)', 'Oui (1 pt)']),
    },
    {
      id: 'lecture_etiquettes',
      label:
        "Je lis les étiquettes, le Nutri score, je fais attention à la composition et provenance des produits que j'achète.",
      type: 'select',
      options: mapOptions(['Non (0 pt)', 'Parfois (0 pt)', 'Oui (1 pt)']),
    },
    {
      id: 'edulcorants',
      label:
        "J'évite la consommation régulière ou quotidienne d'édulcorants intenses (aspartame, acésulfame K, sucrettes…).",
      type: 'select',
      options: mapOptions(['Non (0 pt)', 'Parfois (1 pt)', 'Oui (2 pt)']),
    },
  ],
};
