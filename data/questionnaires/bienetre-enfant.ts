/**
 * Questionnaire bien-être adapté pour les enfants (≤12 ans)
 */

export const QUESTIONNAIRE_BIENETRE_ENFANT = {
  id: 'bienetre-enfant',
  title: 'Comment je me sens',
  description: 'Raconte-nous comment tu te sens !',
  estimatedDuration: 6,
  ageRange: { min: 6, max: 12 },
  sections: [
    {
      id: 'humeur-enfant',
      title: 'Mon humeur',
      questions: [
        {
          id: 'humeur-aujourd-hui',
          title: "Comment te sens-tu aujourd'hui ?",
          type: 'single-choice',
          options: ['Très content(e) 😄', 'Content(e)', 'Ça va', 'Un peu triste', 'Triste'],
          required: true,
        },
        {
          id: 'inquietude',
          title: "Est-ce que tu t'inquiètes parfois ?",
          type: 'single-choice',
          options: ['Jamais', 'Rarement', 'Parfois 😟', 'Souvent'],
          required: true,
        },
      ],
    },
    {
      id: 'copains-famille',
      title: 'Mes copains et ma famille',
      questions: [
        {
          id: 'copains-ecole',
          title: "As-tu des copains à l'école ?",
          type: 'single-choice',
          options: ['Oui, beaucoup 👫', 'Oui, quelques-uns', 'Oui, un peu', 'Non, pas vraiment'],
          required: true,
        },
        {
          id: 'famille-bonheur',
          title: 'Es-tu heureux/heureuse avec ta famille ?',
          type: 'single-choice',
          options: [
            'Oui, très heureux/heureuse 👨‍👩‍👧',
            'Oui, heureux/heureuse',
            'Ça va',
            'Pas très heureux/heureuse',
          ],
          required: true,
        },
      ],
    },
    {
      id: 'jeux-plaisirs',
      title: "Ce que j'aime",
      questions: [
        {
          id: 'activites-preferees',
          title: "Qu'est-ce que tu aimes faire ? (tu peux choisir plusieurs réponses)",
          type: 'multiple-choice',
          options: [
            'Jouer avec mes jouets 🧸',
            'Jouer dehors',
            'Dessiner ou colorier 🎨',
            'Regarder des dessins animés',
            "Lire ou qu'on me lise des histoires 📚",
            'Jouer avec mes copains',
            'Faire de la musique ou chanter 🎵',
            'Aider papa et maman',
          ],
          required: true,
        },
      ],
    },
  ],
};
