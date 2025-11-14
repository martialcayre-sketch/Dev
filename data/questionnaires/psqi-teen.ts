/**
 * Questionnaire PSQI adapté pour les adolescents (13-18 ans)
 */

export const QUESTIONNAIRE_PSQI_TEEN = {
  id: 'psqi-teen',
  title: 'Mon sommeil',
  description: 'Parle-nous de tes habitudes de sommeil !',
  estimatedDuration: 7,
  ageRange: { min: 13, max: 18 },
  sections: [
    {
      id: 'horaires-sommeil',
      title: 'Mes horaires',
      questions: [
        {
          id: 'heure-coucher',
          title: 'En général, à quelle heure te couches-tu en semaine ?',
          type: 'single-choice',
          options: [
            'Avant 21h',
            'Entre 21h et 22h',
            'Entre 22h et 23h 🕐',
            'Entre 23h et minuit',
            'Après minuit',
          ],
          required: true,
        },
        {
          id: 'heure-lever',
          title: 'Et à quelle heure te lèves-tu pour aller au collège/lycée ?',
          type: 'single-choice',
          options: [
            'Avant 6h',
            'Entre 6h et 6h30',
            'Entre 6h30 et 7h ⏰',
            'Entre 7h et 7h30',
            'Après 7h30',
          ],
          required: true,
        },
      ],
    },
    {
      id: 'qualite-sommeil',
      title: 'Comment je dors',
      questions: [
        {
          id: 'endormissement',
          title: "Combien de temps mets-tu pour t'endormir ?",
          type: 'single-choice',
          options: ['Moins de 15 minutes 😴', '15-30 minutes', '30-60 minutes', "Plus d'1 heure"],
          required: true,
        },
        {
          id: 'reveils-nuit',
          title: 'Est-ce que tu te réveilles pendant la nuit ?',
          type: 'single-choice',
          options: ['Jamais', 'Rarement', 'Parfois 😕', 'Souvent'],
          required: true,
        },
      ],
    },
    {
      id: 'habitudes-ecrans',
      title: 'Écrans et sommeil',
      questions: [
        {
          id: 'ecrans-avant-dodo',
          title: 'Utilises-tu ton téléphone/tablette avant de dormir ?',
          type: 'single-choice',
          options: ['Jamais', 'Rarement', 'Parfois', 'Souvent 📱', 'Toujours'],
          required: true,
        },
      ],
    },
  ],
};
