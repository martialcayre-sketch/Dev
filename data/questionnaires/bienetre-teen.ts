/**
 * Questionnaire bien-être adapté pour les adolescents (13-18 ans)
 */

export const QUESTIONNAIRE_BIENETRE_TEEN = {
  id: 'bienetre-teen',
  title: 'Comment je me sens',
  description: 'Parle-nous de ton bien-être et de tes émotions',
  estimatedDuration: 8,
  ageRange: { min: 13, max: 18 },
  sections: [
    {
      id: 'humeur-generale',
      title: 'Mon humeur',
      questions: [
        {
          id: 'humeur-semaine',
          title: "Cette semaine, comment t'es-tu senti(e) en général ?",
          type: 'single-choice',
          options: [
            'Très bien 😊',
            'Plutôt bien',
            'Ni bien ni mal',
            'Pas très bien',
            'Pas bien du tout',
          ],
          required: true,
        },
        {
          id: 'stress-niveau',
          title: 'Te sens-tu stressé(e) ?',
          type: 'single-choice',
          options: ['Jamais', 'Rarement', 'Parfois 😰', 'Souvent', 'Tout le temps'],
          required: true,
        },
      ],
    },
    {
      id: 'relations-sociales',
      title: 'Mes relations',
      questions: [
        {
          id: 'amis-soutien',
          title: 'As-tu des amis sur qui tu peux compter ?',
          type: 'single-choice',
          options: [
            'Oui, plusieurs 👥',
            'Oui, quelques-uns',
            'Oui, un(e) ou deux',
            'Non, pas vraiment',
          ],
          required: true,
        },
        {
          id: 'famille-relation',
          title: 'Comment ça se passe avec ta famille ?',
          type: 'single-choice',
          options: ['Très bien 👨‍👩‍👧‍👦', 'Plutôt bien', 'Ça va', 'Pas terrible', 'Difficile'],
          required: true,
        },
      ],
    },
    {
      id: 'activites-plaisir',
      title: "Ce que j'aime faire",
      questions: [
        {
          id: 'loisirs-plaisir',
          title: 'Quelles activités te font du bien ? (tu peux en choisir plusieurs)',
          type: 'multiple-choice',
          options: [
            'Écouter de la musique 🎵',
            'Faire du sport',
            'Voir mes amis',
            'Jouer aux jeux vidéo',
            'Lire',
            'Regarder des séries/films',
            'Dessiner/créer',
            'Sortir dehors',
          ],
          required: true,
        },
      ],
    },
  ],
};
