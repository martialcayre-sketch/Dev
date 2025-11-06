export type Question = {
  id: string;
  label: string;
  scale?: boolean;
  scaleType?: '0-4';
  section?: string;
  type?: 'select' | 'number' | 'textarea';
  options?: string[];
  colorScheme?:
    | 'fatigue'
    | 'douleurs'
    | 'digestion'
    | 'surpoids'
    | 'insomnie'
    | 'moral'
    | 'mobilite';
  description?: string;
  minLabel?: string;
  maxLabel?: string;
};

export const THEMES = [
  { prefix: 'd', label: 'Dopamine' },
  { prefix: 'n', label: 'Noradrénaline' },
  { prefix: 's', label: 'Sérotonine' },
  { prefix: 'm', label: 'Mélatonine' },
] as const;

export function getQuestions(questionnaireId: string): Question[] {
  switch (questionnaireId) {
    case 'plaintes-et-douleurs':
      return [
        {
          id: 'fatigue',
          label: 'Fatigue',
          scale: true,
          colorScheme: 'fatigue',
          description:
            "Des valeurs élevées représentent l'intensité des troubles actuellement ressentis.",
          minLabel: "J'ai une bonne vitalité",
          maxLabel: 'Je suis très fatigué(e), épuisé(e)',
        },
        {
          id: 'douleurs',
          label: 'Douleurs',
          scale: true,
          colorScheme: 'douleurs',
          description:
            "Des valeurs élevées représentent l'intensité des troubles actuellement ressentis.",
          minLabel: 'Je ne ressens aucune douleur',
          maxLabel: 'Je ressens des douleurs intenses ou chroniques',
        },
        {
          id: 'digestion',
          label: 'Digestion',
          scale: true,
          colorScheme: 'digestion',
          description:
            "Des valeurs élevées représentent l'intensité des troubles actuellement ressentis.",
          minLabel: "Je n'ai aucun problème de digestion, ni troubles intestinaux",
          maxLabel: 'Je souffre de beaucoup de troubles digestifs et intestinaux',
        },
        {
          id: 'surpoids',
          label: 'Surpoids',
          scale: true,
          colorScheme: 'surpoids',
          description:
            "Des valeurs élevées représentent l'intensité des troubles actuellement ressentis.",
          minLabel: "Je n'ai aucun problème de poids",
          maxLabel: "J'ai des problèmes de surpoids importants",
        },
        {
          id: 'insomnie',
          label: 'Insomnie',
          scale: true,
          colorScheme: 'insomnie',
          description:
            "Des valeurs élevées représentent l'intensité des troubles actuellement ressentis.",
          minLabel: "Je n'ai aucun problème de sommeil",
          maxLabel: "Je souffre d'insomnie ou de troubles du sommeil",
        },
        {
          id: 'moral',
          label: 'Moral',
          scale: true,
          colorScheme: 'moral',
          description:
            "Des valeurs élevées représentent l'intensité des troubles actuellement ressentis.",
          minLabel: "J'ai un bon moral, je suis serein(e)",
          maxLabel: "Je souffre de beaucoup de troubles dépressifs ou d'anxiété ou d'angoisse",
        },
        {
          id: 'mobilite',
          label: 'Mobilité',
          scale: true,
          colorScheme: 'mobilite',
          description:
            "Des valeurs élevées représentent l'intensité des troubles actuellement ressentis.",
          minLabel: "Je n'ai aucun problème de mobilité",
          maxLabel: 'Je souffre de beaucoup de troubles de mobilité',
        },
      ];
    case 'mode-de-vie':
      return [
        // SECTION 1: SOMMEIL (5 questions)
        {
          id: 'qualite_sommeil',
          label: 'Comment évaluez-vous la qualité de votre sommeil ?',
          section: 'Votre sommeil',
          type: 'select',
          options: [
            'Je dors très bien (10 pts)',
            'Je dors bien (8 pts)',
            'Je dors moyennement (5 pts)',
            'Je dors mal (2 pts)',
            'Je dors très mal (0 pts)',
          ],
        },
        {
          id: 'duree_sommeil',
          label: "Combien d'heures dormez-vous par nuit en moyenne ?",
          section: 'Votre sommeil',
          type: 'select',
          options: [
            'Plus de 8h par nuit (10 pts)',
            '7-8h par nuit (8 pts)',
            '6-7h par nuit (5 pts)',
            '5-6h par nuit (2 pts)',
            'Moins de 5h par nuit (0 pts)',
          ],
        },
        {
          id: 'endormissement',
          label: 'Combien de temps mettez-vous pour vous endormir ?',
          section: 'Votre sommeil',
          type: 'select',
          options: [
            "Je m'endors facilement (< 15 min) (10 pts)",
            "Je m'endors assez facilement (15-30 min) (7 pts)",
            "J'ai des difficultés d'endormissement (30-60 min) (3 pts)",
            "J'ai beaucoup de difficultés (> 60 min) (0 pts)",
          ],
        },
        {
          id: 'reveils_nocturnes',
          label: 'À quelle fréquence vous réveillez-vous la nuit ?',
          section: 'Votre sommeil',
          type: 'select',
          options: [
            'Jamais ou rarement (10 pts)',
            'Parfois (1-2 fois par semaine) (7 pts)',
            'Souvent (3-5 fois par semaine) (3 pts)',
            'Toutes les nuits (0 pts)',
          ],
        },
        {
          id: 'reveil_matinal',
          label: 'Comment vous sentez-vous au réveil ?',
          section: 'Votre sommeil',
          type: 'select',
          options: [
            'Je me réveille frais et reposé (10 pts)',
            'Je me réveille assez reposé (7 pts)',
            'Je me réveille fatigué (3 pts)',
            'Je me réveille très fatigué (0 pts)',
          ],
        },
        // SECTION 2: RYTHME BIOLOGIQUE (5 questions)
        {
          id: 'horaires_coucher',
          label: 'Vos horaires de coucher sont-ils réguliers ?',
          section: 'Votre rythme biologique',
          type: 'select',
          options: [
            'Réguliers (tous les jours à la même heure ±30min) (10 pts)',
            'Assez réguliers (±1h) (7 pts)',
            'Irréguliers (±2h) (3 pts)',
            'Très irréguliers (> 2h de variation) (0 pts)',
          ],
        },
        {
          id: 'horaires_lever',
          label: 'Vos horaires de lever sont-ils réguliers ?',
          section: 'Votre rythme biologique',
          type: 'select',
          options: [
            'Réguliers (tous les jours ±30min) (10 pts)',
            'Assez réguliers (±1h) (7 pts)',
            'Irréguliers (±2h) (3 pts)',
            'Très irréguliers (> 2h) (0 pts)',
          ],
        },
        {
          id: 'exposition_lumiere',
          label: "Combien de temps passez-vous à l'extérieur en lumière naturelle ?",
          section: 'Votre rythme biologique',
          type: 'select',
          options: [
            'Plus de 2h par jour en extérieur (10 pts)',
            '1-2h par jour (7 pts)',
            '30min-1h par jour (3 pts)',
            'Moins de 30min par jour (0 pts)',
          ],
        },
        {
          id: 'ecrans_soir',
          label: "Jusqu'à quelle heure utilisez-vous des écrans le soir ?",
          section: 'Votre rythme biologique',
          type: 'select',
          options: [
            'Jamais après 20h (10 pts)',
            "Rarement (jusqu'à 21h) (7 pts)",
            "Souvent (jusqu'à 22h) (3 pts)",
            'Très souvent (après 22h) (0 pts)',
          ],
        },
        {
          id: 'heure_repas_soir',
          label: 'À quelle heure prenez-vous votre repas du soir ?',
          section: 'Votre rythme biologique',
          type: 'select',
          options: [
            'Avant 19h30 (10 pts)',
            'Entre 19h30 et 20h30 (7 pts)',
            'Entre 20h30 et 21h30 (3 pts)',
            'Après 21h30 (0 pts)',
          ],
        },
        // SECTION 3: ADAPTATION ET STRESS (5 questions)
        {
          id: 'niveau_stress',
          label: 'Quel est votre niveau de stress ressenti au quotidien ?',
          section: 'Votre adaptation et le stress',
          type: 'select',
          options: [
            'Très faible ou absent (10 pts)',
            'Faible (7 pts)',
            'Modéré (5 pts)',
            'Élevé (2 pts)',
            'Très élevé (0 pts)',
          ],
        },
        {
          id: 'gestion_stress',
          label: 'Comment gérez-vous le stress ?',
          section: 'Votre adaptation et le stress',
          type: 'select',
          options: [
            'Très bonne (techniques de relaxation régulières) (10 pts)',
            'Bonne (je gère bien) (7 pts)',
            'Moyenne (difficultés occasionnelles) (3 pts)',
            'Mauvaise (je suis souvent dépassé) (0 pts)',
          ],
        },
        {
          id: 'anxiete',
          label: "À quelle fréquence ressentez-vous de l'anxiété ?",
          section: 'Votre adaptation et le stress',
          type: 'select',
          options: [
            'Jamais ou rarement anxieux (10 pts)',
            'Parfois anxieux (7 pts)',
            'Souvent anxieux (3 pts)',
            'Toujours ou presque toujours anxieux (0 pts)',
          ],
        },
        {
          id: 'situations_stressantes',
          label: 'À quelle fréquence vivez-vous des situations stressantes ?',
          section: 'Votre adaptation et le stress',
          type: 'select',
          options: [
            'Rares (< 1 fois par semaine) (10 pts)',
            'Occasionnelles (1-2 fois par semaine) (7 pts)',
            'Fréquentes (3-5 fois par semaine) (3 pts)',
            'Quotidiennes ou plus (0 pts)',
          ],
        },
        {
          id: 'recuperation_stress',
          label: 'Combien de temps vous faut-il pour récupérer après un événement stressant ?',
          section: 'Votre adaptation et le stress',
          type: 'select',
          options: [
            'Rapide (< 1h) (10 pts)',
            'Moyenne (1-3h) (7 pts)',
            'Lente (plusieurs heures) (3 pts)',
            'Très lente (plusieurs jours) (0 pts)',
          ],
        },
        // SECTION 4: ACTIVITÉ PHYSIQUE (5 questions)
        {
          id: 'frequence_activite',
          label: 'À quelle fréquence pratiquez-vous une activité physique ?',
          section: 'Votre activité physique',
          type: 'select',
          options: [
            '5 fois ou plus par semaine (10 pts)',
            '3-4 fois par semaine (7 pts)',
            '1-2 fois par semaine (3 pts)',
            'Jamais ou presque jamais (0 pts)',
          ],
        },
        {
          id: 'duree_activite',
          label: "Quelle est la durée moyenne de vos séances d'activité physique ?",
          section: 'Votre activité physique',
          type: 'select',
          options: [
            'Plus de 60 minutes (10 pts)',
            '30-60 minutes (7 pts)',
            '15-30 minutes (3 pts)',
            'Moins de 15 minutes (0 pts)',
          ],
        },
        {
          id: 'intensite_effort',
          label: "Quelle est l'intensité de vos efforts physiques ?",
          section: 'Votre activité physique',
          type: 'select',
          options: [
            'Intensive (essoufflement, transpiration) (10 pts)',
            'Modérée (effort soutenu) (7 pts)',
            'Légère (marche tranquille) (3 pts)',
            'Très légère (0 pts)',
          ],
        },
        {
          id: 'activite_quotidienne',
          label: "Quel est votre niveau d'activité quotidien (nombre de pas) ?",
          section: 'Votre activité physique',
          type: 'select',
          options: [
            'Très actif (> 10000 pas/jour) (10 pts)',
            'Actif (7000-10000 pas/jour) (7 pts)',
            'Peu actif (5000-7000 pas/jour) (3 pts)',
            'Sédentaire (< 5000 pas/jour) (0 pts)',
          ],
        },
        {
          id: 'position_assise',
          label: 'Combien de temps passez-vous assis(e) par jour ?',
          section: 'Votre activité physique',
          type: 'select',
          options: [
            'Moins de 4h par jour (10 pts)',
            '4-6h par jour (7 pts)',
            '6-8h par jour (3 pts)',
            'Plus de 8h par jour (0 pts)',
          ],
        },
        // SECTION 5: EXPOSITION AUX TOXIQUES (5 questions)
        {
          id: 'tabac',
          label: 'Quelle est votre consommation de tabac ?',
          section: 'Votre exposition aux toxiques',
          type: 'select',
          options: [
            'Non-fumeur (10 pts)',
            'Ex-fumeur (> 1 an) (7 pts)',
            'Fumeur occasionnel (< 5 cig/jour) (2 pts)',
            'Fumeur régulier (≥ 5 cig/jour) (0 pts)',
          ],
        },
        {
          id: 'alcool',
          label: "Quelle est votre consommation d'alcool par semaine ?",
          section: 'Votre exposition aux toxiques',
          type: 'select',
          options: [
            'Jamais ou très occasionnel (10 pts)',
            'Modéré (1-2 verres/semaine) (7 pts)',
            'Régulier (3-7 verres/semaine) (3 pts)',
            'Important (> 7 verres/semaine) (0 pts)',
          ],
        },
        {
          id: 'exposition_professionnelle',
          label: 'Êtes-vous exposé(e) à des toxiques dans votre environnement professionnel ?',
          section: 'Votre exposition aux toxiques',
          type: 'select',
          options: [
            'Aucune exposition (10 pts)',
            'Exposition faible (7 pts)',
            'Exposition modérée (3 pts)',
            'Exposition importante (produits chimiques, pesticides...) (0 pts)',
          ],
        },
        {
          id: 'produits_menagers',
          label: 'Quels types de produits ménagers utilisez-vous ?',
          section: 'Votre exposition aux toxiques',
          type: 'select',
          options: [
            'Produits naturels/bio uniquement (10 pts)',
            'Mélange naturel et conventionnel (7 pts)',
            'Produits conventionnels (3 pts)',
            'Produits chimiques puissants (0 pts)',
          ],
        },
        {
          id: 'pollution_air',
          label: 'Dans quel environnement vivez-vous ?',
          section: 'Votre exposition aux toxiques',
          type: 'select',
          options: [
            'Campagne/air pur (10 pts)',
            'Petite ville (7 pts)',
            'Grande ville (3 pts)',
            'Zone très polluée/industrielle (0 pts)',
          ],
        },
        // SECTION 6: RELATION AUX AUTRES (5 questions)
        {
          id: 'vie_sociale',
          label: 'Comment évaluez-vous votre vie sociale ?',
          section: 'Votre relation aux autres',
          type: 'select',
          options: [
            'Très riche (sorties/activités régulières) (10 pts)',
            'Riche (plusieurs fois par semaine) (7 pts)',
            'Modérée (1 fois par semaine) (3 pts)',
            'Pauvre ou isolement (0 pts)',
          ],
        },
        {
          id: 'qualite_relations',
          label: 'Comment évaluez-vous la qualité de vos relations ?',
          section: 'Votre relation aux autres',
          type: 'select',
          options: [
            'Excellentes relations (soutien, écoute) (10 pts)',
            'Bonnes relations (7 pts)',
            'Relations moyennes (quelques conflits) (3 pts)',
            'Relations difficiles (conflits fréquents) (0 pts)',
          ],
        },
        {
          id: 'vie_couple_famille',
          label: 'Comment évaluez-vous votre vie de couple/famille ?',
          section: 'Votre relation aux autres',
          type: 'select',
          options: [
            'Très épanouissante (10 pts)',
            'Épanouissante (7 pts)',
            'Correcte (3 pts)',
            'Difficile ou seul(e) (0 pts)',
          ],
        },
        {
          id: 'activites_sociales',
          label: 'Participez-vous à des activités sociales (associations, clubs, bénévolat) ?',
          section: 'Votre relation aux autres',
          type: 'select',
          options: [
            'Associations, clubs, bénévolat régulier (10 pts)',
            'Activités occasionnelles (7 pts)',
            'Rares activités sociales (3 pts)',
            'Aucune activité sociale (0 pts)',
          ],
        },
        {
          id: 'communication',
          label: 'Comment communiquez-vous avec les autres ?',
          section: 'Votre relation aux autres',
          type: 'select',
          options: [
            'Je communique facilement et ouvertement (10 pts)',
            'Je communique assez bien (7 pts)',
            "J'ai des difficultés à communiquer (3 pts)",
            'Je ne communique pas ou très peu (0 pts)',
          ],
        },
        // SECTION 7: MODE ALIMENTAIRE (5 questions)
        {
          id: 'regularite_repas',
          label: 'Quelle est la régularité de vos repas ?',
          section: 'Votre mode alimentaire',
          type: 'select',
          options: [
            '3 repas réguliers par jour (10 pts)',
            '3 repas avec horaires variables (7 pts)',
            '2 repas par jour (3 pts)',
            'Repas irréguliers ou grignotage (0 pts)',
          ],
        },
        {
          id: 'petit_dejeuner',
          label: 'Prenez-vous un petit-déjeuner ?',
          section: 'Votre mode alimentaire',
          type: 'select',
          options: [
            'Complet et équilibré tous les jours (10 pts)',
            'Complet la plupart du temps (7 pts)',
            'Léger ou occasionnel (3 pts)',
            'Pas de petit-déjeuner (0 pts)',
          ],
        },
        {
          id: 'cuisine_maison',
          label: 'À quelle fréquence cuisinez-vous vous-même vos repas ?',
          section: 'Votre mode alimentaire',
          type: 'select',
          options: [
            'Tous les jours (10 pts)',
            '5-6 fois par semaine (7 pts)',
            '2-4 fois par semaine (3 pts)',
            'Rarement ou jamais (0 pts)',
          ],
        },
        {
          id: 'produits_frais',
          label: 'Consommez-vous des produits frais et de saison ?',
          section: 'Votre mode alimentaire',
          type: 'select',
          options: [
            'Toujours ou presque (10 pts)',
            'Souvent (7 pts)',
            'Parfois (3 pts)',
            'Rarement (0 pts)',
          ],
        },
        {
          id: 'grignotage',
          label: 'À quelle fréquence grignotez-vous entre les repas ?',
          section: 'Votre mode alimentaire',
          type: 'select',
          options: [
            'Jamais (10 pts)',
            'Rarement (< 1 fois/semaine) (7 pts)',
            'Occasionnel (2-3 fois/semaine) (3 pts)',
            'Fréquent (quotidien) (0 pts)',
          ],
        },
      ];
    case 'alimentaire':
      return [
        // Questionnaire alimentaire SIIN - Enquête alimentaire
        {
          id: 'eau_jour',
          label:
            "Combien de verres d'eau ou de litres d'eau buvez-vous chaque jour ? (en incluant thé, tisanes, café…)",
          type: 'select',
          options: [
            '<6 verres ou <0,75l (0 pt)',
            '6-12 verres ou 0,75-1,5l (0 pt)',
            '>12 verres ou >1,5l (1 pt)',
          ],
        },
        {
          id: 'cafe_jour',
          label: 'Combien de tasses de café buvez-vous chaque jour ?',
          type: 'select',
          options: ['0 (0 pt)', '1 à 5 (1 pt)', '>5 (0 pt)'],
        },
        {
          id: 'the_jour',
          label: 'Combien de tasses de thé buvez-vous chaque jour ?',
          type: 'select',
          options: ['0 (0 pt)', '1 à 5 (1 pt)', '>5 (0 pt)'],
        },
        {
          id: 'jus_fruits',
          label: 'Combien de jus de fruits, sans sucre rajouté, buvez-vous chaque jour ?',
          type: 'select',
          options: ['0 à 1 (1 pt)', '2 à 3 (0 pt)', '>3 (0 pt)'],
        },
        {
          id: 'boissons_sucrees',
          label: 'Combien de boissons sucrées (sodas, cola, limonade…) buvez-vous chaque jour ?',
          type: 'select',
          options: ['0 ou <1 (1 pt)', '1 à 2 (0 pt)', '>2 (0 pt)'],
        },
        {
          id: 'vin_jour',
          label: 'Combien de verres de vin buvez-vous en moyenne chaque jour ?',
          type: 'select',
          options: ['0, 1 ou <2 (1 pt)', '2 à 3 (0 pt)', '>3 (0 pt)'],
        },
        {
          id: 'alcool_semaine',
          label: 'Combien de verres de vin ou boissons alcoolisées buvez-vous chaque semaine ?',
          type: 'select',
          options: ['<10 (2 pt)', '10-15 (1 pt)', '>15 (0 pt)'],
        },
        {
          id: 'legumes_jour',
          label: "Combien de portions d'environ 80 g de légumes consommez-vous chaque jour ?",
          type: 'select',
          options: ['<3 (0 pt)', '3-5 (1 pt)', '>5 (2 pt)'],
        },
        {
          id: 'fruits_jour',
          label: 'Combien de fruits entiers consommez-vous chaque jour ?',
          type: 'select',
          options: ['0 (0 pt)', '1, 2 ou 3 (2 pt)', '>3 (1 pt)'],
        },
        {
          id: 'cereales_completes',
          label:
            'Combien de portions de céréales complètes ou semi complètes consommez-vous chaque jour ? (80-100 g de riz complet, quinoa, flocons…)',
          type: 'select',
          options: ['0 (0 pt)', '1 ou 2 (1 pt)', '>2 (2 pt)'],
        },
        {
          id: 'pref_cereales_completes',
          label:
            'Consommez-vous préférentiellement, au moins une fois sur 2, des céréales complètes plutôt que raffinées ?',
          type: 'select',
          options: ['Non (0 pt)', 'Parfois (1 pt)', 'Oui (2 pt)'],
        },
        {
          id: 'pain_complet',
          label: 'Consommez-vous préférentiellement du pain complet plutôt que du pain blanc ?',
          type: 'select',
          options: ['Non (0 pt)', 'Parfois (1 pt)', 'Oui (2 pt)'],
        },
        {
          id: 'legumes_secs',
          label: 'Combien de portions de légumes secs consommez-vous chaque semaine ? (150 g)',
          type: 'select',
          options: ['<1 (0 pt)', '1-2 (1 pt)', '3 ou + (2 pt)'],
        },
        {
          id: 'noix_grenoble',
          label:
            'Combien de portions de noix « de Grenoble » consommez-vous chaque semaine ? (30 g)',
          type: 'select',
          options: ['<1 (0 pt)', '1-2 (1 pt)', '3 ou + (2 pt)'],
        },
        {
          id: 'fruits_secs',
          label:
            'Combien de portions de fruits secs non sucrés/salés (amandes, noisettes, pistaches…) consommez-vous par semaine ?',
          type: 'select',
          options: ['<1 (0 pt)', '1-2 (1 pt)', '3 ou + (2 pt)'],
        },
        {
          id: 'huile_colza',
          label:
            "Utilisez-vous de l'huile de colza comme huile principale de cuisine ou d'assaisonnement ?",
          type: 'select',
          options: ['Non (0 pt)', 'Parfois (1 pt)', 'Oui (2 pt)'],
        },
        {
          id: 'quantite_colza',
          label: "Combien de cuillères à soupe d'huile de colza consommez-vous chaque jour ?",
          type: 'select',
          options: ['<1 (0 pt)', '1-2 (1 pt)', '>2 (2 pt)'],
        },
        {
          id: 'graisses_saturees',
          label:
            'Combien de portions de beurre, margarine, crème fraîche, graisses de coco consommez-vous quotidiennement ? (12 g)',
          type: 'select',
          options: ['<1 (2 pt)', '1-2 (1 pt)', '>2 (0 pt)'],
        },
        {
          id: 'huiles_omega6',
          label:
            'Utilisez-vous des huiles de tournesol, maïs ou pépin de raisin comme huile principale ?',
          type: 'select',
          options: ['Non (2 pt)', 'Parfois (1 pt)', 'Oui (0 pt)'],
        },
        {
          id: 'sauces_industrielles',
          label:
            'Combien de sauces industrielles (mayonnaise, sauce salade, barbecue…) consommez-vous par jour ?',
          type: 'select',
          options: ['0 ou <1 (2 pt)', '1 (1 pt)', '>1 (0 pt)'],
        },
        {
          id: 'laitages_frais',
          label:
            'Combien de produits laitiers frais, non sucrés consommez-vous chaque jour ? (Yaourt, fromage blanc…)',
          type: 'select',
          options: ['0 (0 pt)', '1 ou 2 (1 pt)', '>2 (0 pt)'],
        },
        {
          id: 'laitages_sucres',
          label:
            'Combien de produits laitiers frais et sucrés consommez-vous chaque jour ? (Yaourt aux fruits, desserts lactés…)',
          type: 'select',
          options: ['<1 (1 pt)', '1-2 (0 pt)', '>2 (0 pt)'],
        },
        {
          id: 'fromage_jour',
          label: 'Combien de portions de fromage consommez-vous chaque jour ?',
          type: 'select',
          options: ['0 ou 1 (1 pt)', '2 (0 pt)', '>2 (0 pt)'],
        },
        {
          id: 'fromage_gras',
          label: 'Combien de portions de fromage « gras » consommez-vous par semaine ?',
          type: 'select',
          options: ['<4 (1 pt)', '4-7 (0 pt)', '>7 (0 pt)'],
        },
        {
          id: 'oeufs_omega3',
          label: "Combien d'œufs issus de la filière oméga 3 consommez-vous chaque semaine ?",
          type: 'select',
          options: ['<4 (0 pt)', '4 à 14 (2 pt)', '>14 (1 pt)'],
        },
        {
          id: 'oeufs_standard',
          label:
            "Combien d'œufs issus de filières conventionnelles/bio/plein air (non oméga 3) consommez-vous par semaine ?",
          type: 'select',
          options: ['<5 (1 pt)', '5-10 (0 pt)', '>10 (0 pt)'],
        },
        {
          id: 'poissons_gras',
          label:
            'Combien de portions de poissons gras (sardine, maquereau, hareng, saumon, thon…) consommez-vous par semaine ? (100 g)',
          type: 'select',
          options: ['<1 (0 pt)', '1 (1 pt)', '2 ou plus (2 pt)'],
        },
        {
          id: 'poissons_total',
          label:
            'Combien de portions de 100 g de poisson, tout-venant (y compris poissons gras), consommez-vous chaque semaine ?',
          type: 'select',
          options: ['<2 (0 pt)', '2-3 (0 pt)', '4 (1 pt)', '>4 (0 pt)'],
        },
        {
          id: 'coquillages',
          label:
            'Combien de portions de coquillages ou crustacés consommez-vous par semaine ? (4-5 coquillages)',
          type: 'select',
          options: ['0 (0 pt)', '>1 (1 pt)', '>2 (2 pt)'],
        },
        {
          id: 'viande_blanche',
          label:
            'Combien de portions de viande blanche ou volaille consommez-vous chaque semaine ? (Poulet, dinde, canard, lapin, porc…)',
          type: 'select',
          options: ['<1 (0 pt)', '2 à 3 (1 pt)', '>3 (0 pt)'],
        },
        {
          id: 'viande_rouge',
          label:
            'Combien de portions de viande rouge, hamburger consommez-vous chaque semaine ? (100-150 g)',
          type: 'select',
          options: ['<3 fois ou <350g (2 pt)', '3-5 fois (1 pt)', '>5 fois ou >500g (0 pt)'],
        },
        {
          id: 'preference_volaille',
          label:
            'Consommez-vous préférentiellement des volailles plutôt que du veau, bœuf, saucisses, hamburgers… ?',
          type: 'select',
          options: ['Non (0 pt)', 'Parfois (0 pt)', 'Oui (1 pt)'],
        },
        {
          id: 'charcuteries',
          label: 'Combien de portions de charcuteries consommez-vous chaque semaine ?',
          type: 'select',
          options: ['<3 fois ou <140g (2 pt)', '3-5 fois (1 pt)', '>5 fois ou >200g (0 pt)'],
        },
        {
          id: 'pommes_terre',
          label:
            'Combien de pommes de terre consommez-vous chaque semaine ? (Frites, purée, pommes vapeur…)',
          type: 'select',
          options: ['<3 (1 pt)', '3-5 (0 pt)', '>5 (0 pt)'],
        },
        {
          id: 'cereales_raffinées',
          label:
            'Combien de portions de pâtes blanches/riz blanc/pain blanc consommez-vous chaque semaine ?',
          type: 'select',
          options: ['<3 (1 pt)', '3-7 (0 pt)', '>7 (0 pt)'],
        },
        {
          id: 'produits_sucres',
          label:
            'Consommez-vous régulièrement des produits sucrés industrialisés (confitures, pâte à tartiner, céréales sucrées…) ?',
          type: 'select',
          options: ['Non (2 pt)', 'Parfois (1 pt)', 'Oui quotidiennement (0 pt)'],
        },
        {
          id: 'patisseries',
          label:
            'Combien de fois par semaine consommez-vous des pâtisseries industrielles, cookies, biscuits… ?',
          type: 'select',
          options: ['<2 (2 pt)', '2-4 (1 pt)', '>4 (0 pt)'],
        },
        {
          id: 'boissons_sucrees_achat',
          label:
            "L'achat ou consommation de boissons sucrées (limonades, jus industriels, sodas, même Light) sont pour moi occasionnelles, jamais quotidiennes.",
          type: 'select',
          options: ['Non (0 pt)', 'Parfois (1 pt)', 'Oui (2 pt)'],
        },
        {
          id: 'produits_transformes_caddy',
          label:
            "Lors de mes achats, la part de produits transformés, industrialisés, « prêts à consommer » représente moins d'un cinquième de mon caddy…",
          type: 'select',
          options: ['Non (0 pt)', 'Parfois (1 pt)', 'Oui (2 pt)'],
        },
        {
          id: 'ajout_sucre',
          label:
            "J'achète parfois du sucre mais j'en utilise très peu, moins d'une cuillère à soupe par jour (café, thé…)",
          type: 'select',
          options: ['Non (0 pt)', 'Parfois (1 pt)', 'Oui (2 pt)'],
        },
        {
          id: 'ajout_sel',
          label: 'Je rajoute du sel fréquemment dans ma cuisson ou dans mon assiette.',
          type: 'select',
          options: ['Oui (0 pt)', 'Parfois (0 pt)', 'Non (1 pt)'],
        },
        {
          id: 'produits_sales',
          label:
            "J'achète et consomme assez souvent des produits industrialisés salés (chips, fruits secs apéritifs salés, cacahuètes salées…)",
          type: 'select',
          options: ['Oui (0 pt)', 'Parfois (1 pt)', 'Non (2 pt)'],
        },
        {
          id: 'plats_assaisonnes',
          label:
            'Combien de fois par semaine consommez-vous des plats assaisonnés naturellement avec sauce tomate, oignon, ail, curry, curcuma, gingembre, moutarde… ?',
          type: 'select',
          options: ['<1 (0 pt)', '1-2 (1 pt)', '>2 (2 pt)'],
        },
        {
          id: 'epices_quotidien',
          label:
            'Consommez-vous chaque jour des épices, aromates, herbes aromatiques, condiments… dans vos préparations ?',
          type: 'select',
          options: ['Non (0 pt)', 'Parfois (1 pt)', 'Oui (2 pt)'],
        },
        {
          id: 'aliments_protecteurs_jour',
          label:
            'Consommez-vous chaque jour un ou plusieurs de ces aliments : chocolat noir (>70% cacao), agrumes, petits fruits rouges, thé vert ?',
          type: 'select',
          options: ['Non (0 pt)', 'Parfois (1 pt)', 'Oui (2 pt)'],
        },
        {
          id: 'aliments_protecteurs_semaine',
          label: 'Consommez-vous chaque semaine : brocolis, choux, champignons, algues, soja ?',
          type: 'select',
          options: ['Non (0 pt)', 'Parfois (1 pt)', 'Oui (2 pt)'],
        },
        {
          id: 'temperatures_cuisson',
          label:
            "Je suis attentif aux températures de cuisson, j'évite les cuissons à haute température, les barbecues, l'excès de brunissement, les fritures…",
          type: 'select',
          options: ['Non (0 pt)', 'Parfois (1 pt)', 'Oui (2 pt)'],
        },
        {
          id: 'produits_bio',
          label:
            "Je m'oriente vers des produits bio (légumes, fruits, céréales complètes, pain complet…) à chaque fois que possible.",
          type: 'select',
          options: ['Non (0 pt)', 'Parfois (0 pt)', 'Oui (1 pt)'],
        },
        {
          id: 'filiere_omega3',
          label:
            "Je suis attentif aux filières de production et j'achète des produits issus de la filière oméga 3 quand possible.",
          type: 'select',
          options: ['Non (0 pt)', 'Parfois (0 pt)', 'Oui (1 pt)'],
        },
        {
          id: 'regularite_repas',
          label: "Je mange régulièrement et j'évite les grignotages entre les repas.",
          type: 'select',
          options: ['Non (0 pt)', 'Parfois (1 pt)', 'Oui (2 pt)'],
        },
        {
          id: 'restauration_rapide',
          label:
            'Je mange régulièrement au restaurant, « sur le pouce » ou des plats de « restauration rapide » ou « tout prêts à réchauffer ».',
          type: 'select',
          options: ['Oui (0 pt)', 'Parfois (0 pt)', 'Non (1 pt)'],
        },
        {
          id: 'petit_dejeuner',
          label:
            'Je prends chaque jour un petit déjeuner complet, copieux, riche en protéines (œufs, jambon, poissons, fromages, yaourts, amandes…) et pauvre en aliments sucrés.',
          type: 'select',
          options: ['Non (0 pt)', 'Parfois (1 pt)', 'Oui (2 pt)'],
        },
        {
          id: 'proteines_matin',
          label:
            'Je consomme régulièrement au cours de mon petit déjeuner des aliments source de protéines…',
          type: 'select',
          options: ['Non (0 pt)', 'Parfois (1 pt)', 'Oui (2 pt)'],
        },
        {
          id: 'jeune_nocturne',
          label:
            "Habituellement, entre la fin de mon repas du soir et mon petit-déjeuner il s'écoule environ au moins 10 heures (ex: 21h → 7h).",
          type: 'select',
          options: ['Non (0 pt)', 'Parfois (1 pt)', 'Oui (2 pt)'],
        },
        {
          id: 'repartition_repas',
          label:
            'Je privilégie un petit déjeuner et un déjeuner copieux avec un repas du soir léger et digeste.',
          type: 'select',
          options: ['Non (0 pt)', 'Parfois (0 pt)', 'Oui (1 pt)'],
        },
        {
          id: 'lecture_etiquettes',
          label:
            "Je lis les étiquettes, le Nutri score, je fais attention à la composition et provenance des produits que j'achète.",
          type: 'select',
          options: ['Non (0 pt)', 'Parfois (0 pt)', 'Oui (1 pt)'],
        },
        {
          id: 'edulcorants',
          label:
            "J'évite la consommation régulière ou quotidienne d'édulcorants intenses (aspartame, acésulfame K, sucrettes…).",
          type: 'select',
          options: ['Non (0 pt)', 'Parfois (1 pt)', 'Oui (2 pt)'],
        },
      ];
    case 'dnsm':
      return [
        // DOPAMINE (D1-D10)
        {
          id: 'd1',
          label: 'Difficultés à me lever le matin',
          scale: true,
          scaleType: '0-4',
          section: 'Dopamine',
        },
        {
          id: 'd2',
          label: 'Mal à commencer une action',
          scale: true,
          scaleType: '0-4',
          section: 'Dopamine',
        },
        {
          id: 'd3',
          label: "Moins créatif / imaginatif qu'avant",
          scale: true,
          scaleType: '0-4',
          section: 'Dopamine',
        },
        {
          id: 'd4',
          label: "Fatigue avant même d'agir",
          scale: true,
          scaleType: '0-4',
          section: 'Dopamine',
        },
        {
          id: 'd5',
          label: "Moins d'intérêt pour loisirs / activités",
          scale: true,
          scaleType: '0-4',
          section: 'Dopamine',
        },
        {
          id: 'd6',
          label: 'Moins de désir sexuel et amoureux',
          scale: true,
          scaleType: '0-4',
          section: 'Dopamine',
        },
        {
          id: 'd7',
          label: 'Sommeil agité physiquement (je remue)',
          scale: true,
          scaleType: '0-4',
          section: 'Dopamine',
        },
        {
          id: 'd8',
          label: 'Moins de nouveaux projets',
          scale: true,
          scaleType: '0-4',
          section: 'Dopamine',
        },
        {
          id: 'd9',
          label: 'Difficultés de concentration / fil de pensée',
          scale: true,
          scaleType: '0-4',
          section: 'Dopamine',
        },
        {
          id: 'd10',
          label: 'Je cherche souvent mes mots',
          scale: true,
          scaleType: '0-4',
          section: 'Dopamine',
        },
        // NORADRÉNALINE (N1-N10)
        {
          id: 'n1',
          label: 'Mauvaise opinion de moi-même',
          scale: true,
          scaleType: '0-4',
          section: 'Noradrénaline',
        },
        {
          id: 'n2',
          label: 'Manque de confiance',
          scale: true,
          scaleType: '0-4',
          section: 'Noradrénaline',
        },
        {
          id: 'n3',
          label: 'Sentiment de ne pas être à la hauteur',
          scale: true,
          scaleType: '0-4',
          section: 'Noradrénaline',
        },
        {
          id: 'n4',
          label: "Besoin d'approbation des autres",
          scale: true,
          scaleType: '0-4',
          section: 'Noradrénaline',
        },
        {
          id: 'n5',
          label: "Besoin d'être aimé, rassuré",
          scale: true,
          scaleType: '0-4',
          section: 'Noradrénaline',
        },
        {
          id: 'n6',
          label: 'Peu persévérant, vite découragé',
          scale: true,
          scaleType: '0-4',
          section: 'Noradrénaline',
        },
        {
          id: 'n7',
          label: 'Fatigue morale',
          scale: true,
          scaleType: '0-4',
          section: 'Noradrénaline',
        },
        {
          id: 'n8',
          label: 'Plaisir rare à ce que je fais',
          scale: true,
          scaleType: '0-4',
          section: 'Noradrénaline',
        },
        {
          id: 'n9',
          label: "Je ne me sens pas digne d'être aimé",
          scale: true,
          scaleType: '0-4',
          section: 'Noradrénaline',
        },
        {
          id: 'n10',
          label: 'Tristesse, sans joie, sans plaisir',
          scale: true,
          scaleType: '0-4',
          section: 'Noradrénaline',
        },
        // SÉROTONINE (S1-S10)
        {
          id: 's1',
          label: 'Irritable, impulsif, vite en colère',
          scale: true,
          scaleType: '0-4',
          section: 'Sérotonine',
        },
        {
          id: 's2',
          label: "Impatient, supporte mal d'attendre",
          scale: true,
          scaleType: '0-4',
          section: 'Sérotonine',
        },
        {
          id: 's3',
          label: 'Supporte mal les contraintes',
          scale: true,
          scaleType: '0-4',
          section: 'Sérotonine',
        },
        {
          id: 's4',
          label: 'Attiré vers le sucre/chocolat en fin de journée',
          scale: true,
          scaleType: '0-4',
          section: 'Sérotonine',
        },
        {
          id: 's5',
          label: 'Dépendances (tabac, alcool, drogues, sports…)',
          scale: true,
          scaleType: '0-4',
          section: 'Sérotonine',
        },
        {
          id: 's6',
          label: 'Difficulté à prendre du recul, à rester zen',
          scale: true,
          scaleType: '0-4',
          section: 'Sérotonine',
        },
        {
          id: 's7',
          label: "Difficulté d'endormissement / rendormissement",
          scale: true,
          scaleType: '0-4',
          section: 'Sérotonine',
        },
        {
          id: 's8',
          label: 'Vulnérable au stress, au bruit',
          scale: true,
          scaleType: '0-4',
          section: 'Sérotonine',
        },
        {
          id: 's9',
          label: "Susceptible, un rien m'agace",
          scale: true,
          scaleType: '0-4',
          section: 'Sérotonine',
        },
        {
          id: 's10',
          label: "Changements d'humeur rapides",
          scale: true,
          scaleType: '0-4',
          section: 'Sérotonine',
        },
        // MÉLATONINE (M1-M10)
        {
          id: 'm1',
          label: "Sensation d'être marginal/exclu",
          scale: true,
          scaleType: '0-4',
          section: 'Mélatonine',
        },
        {
          id: 'm2',
          label: 'Discret/retrait en société',
          scale: true,
          scaleType: '0-4',
          section: 'Mélatonine',
        },
        {
          id: 'm3',
          label: 'Sommeil « fragile »',
          scale: true,
          scaleType: '0-4',
          section: 'Mélatonine',
        },
        {
          id: 'm4',
          label: 'Difficulté à aller me coucher',
          scale: true,
          scaleType: '0-4',
          section: 'Mélatonine',
        },
        {
          id: 'm5',
          label: 'Discret, réservé pour confidences',
          scale: true,
          scaleType: '0-4',
          section: 'Mélatonine',
        },
        {
          id: 'm6',
          label: 'Peu conciliant / peu adaptable',
          scale: true,
          scaleType: '0-4',
          section: 'Mélatonine',
        },
        {
          id: 'm7',
          label: 'Rythmes de vie irréguliers ou décalés',
          scale: true,
          scaleType: '0-4',
          section: 'Mélatonine',
        },
        {
          id: 'm8',
          label: 'Difficulté à se mettre à la place des autres',
          scale: true,
          scaleType: '0-4',
          section: 'Mélatonine',
        },
        {
          id: 'm9',
          label: "Difficultés à m'exprimer / partager",
          scale: true,
          scaleType: '0-4',
          section: 'Mélatonine',
        },
        {
          id: 'm10',
          label: 'Supporte mal les décalages horaires',
          scale: true,
          scaleType: '0-4',
          section: 'Mélatonine',
        },
      ];
    default:
      return [  ];
  }
}
