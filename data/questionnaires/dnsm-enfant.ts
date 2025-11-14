/**
 * Questionnaire DNSM adapté pour les enfants (≤12 ans)
 */

export const QUESTIONNAIRE_DNSM_ENFANT = {
  id: 'dnsm-enfant',
  title: 'Mes habitudes alimentaires',
  description: 'Un questionnaire sur tes goûts et habitudes pour mieux grandir !',
  estimatedDuration: 10,
  ageRange: { min: 6, max: 12 },
  sections: [
    {
      id: 'petit-dejeuner',
      title: 'Le petit-déjeuner',
      questions: [
        {
          id: 'pdj-freq',
          title: 'Est-ce que tu prends un petit-déjeuner ?',
          type: 'single-choice',
          options: ['Tous les jours 😊', 'Presque tous les jours', 'Parfois', 'Rarement', 'Jamais'],
          required: true,
        },
        {
          id: 'pdj-contenu',
          title: "Qu'est-ce que tu manges au petit-déjeuner ? (tu peux choisir plusieurs réponses)",
          type: 'multiple-choice',
          options: [
            'Céréales avec du lait 🥛',
            'Tartines avec confiture ou beurre 🍞',
            'Fruits 🍎',
            'Yaourt 🥄',
            'Jus de fruits 🧃',
            'Chocolat chaud ☕',
            'Autre chose',
          ],
          required: true,
        },
      ],
    },
    {
      id: 'fruits-legumes',
      title: 'Les fruits et légumes',
      questions: [
        {
          id: 'fruits-freq',
          title: 'Combien de fois manges-tu des fruits dans une journée ?',
          type: 'single-choice',
          options: [
            'Jamais ou presque jamais',
            '1 fois par jour',
            '2-3 fois par jour 👍',
            '4 fois ou plus par jour',
          ],
          required: true,
        },
        {
          id: 'legumes-freq',
          title: 'Et les légumes, combien de fois par jour ?',
          type: 'single-choice',
          options: [
            'Jamais ou presque jamais',
            '1 fois par jour',
            '2-3 fois par jour 👍',
            '4 fois ou plus par jour',
          ],
          required: true,
        },
      ],
    },
    {
      id: 'boissons',
      title: 'Ce que tu bois',
      questions: [
        {
          id: 'eau-freq',
          title: "Combien de verres d'eau bois-tu par jour ?",
          type: 'single-choice',
          options: ['Moins de 3 verres', '3-5 verres', '6-8 verres 💧', 'Plus de 8 verres'],
          required: true,
        },
        {
          id: 'sodas-freq',
          title: 'Est-ce que tu bois des sodas ou boissons sucrées ?',
          type: 'single-choice',
          options: [
            'Tous les jours',
            'Plusieurs fois par semaine',
            'Une fois par semaine',
            'Rarement',
            'Jamais 👍',
          ],
          required: true,
        },
      ],
    },
  ],
};
