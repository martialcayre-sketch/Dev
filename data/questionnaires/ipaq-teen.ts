/**
 * Questionnaire IPAQ adapté pour les adolescents (13-18 ans)
 */

export const QUESTIONNAIRE_IPAQ_TEEN = {
  id: 'ipaq-teen',
  title: 'Mon activité physique',
  description: 'Parle-nous de tes activités sportives et de loisir !',
  estimatedDuration: 8,
  ageRange: { min: 13, max: 18 },
  sections: [
    {
      id: 'activite-intense',
      title: 'Activités sportives intenses',
      questions: [
        {
          id: 'sport-intense-freq',
          title: 'Fais-tu du sport intensif (course, foot, basket, natation rapide...) ?',
          type: 'single-choice',
          options: [
            'Jamais',
            '1 fois par semaine',
            '2-3 fois par semaine 💪',
            '4-5 fois par semaine',
            'Tous les jours',
          ],
          required: true,
        },
        {
          id: 'sport-intense-duree',
          title: 'Quand tu fais du sport intensif, combien de temps ?',
          type: 'single-choice',
          options: [
            "Je n'en fais pas",
            'Moins de 30 minutes',
            '30-60 minutes ⚽',
            '1-2 heures',
            'Plus de 2 heures',
          ],
          required: true,
        },
      ],
    },
    {
      id: 'activite-moderee',
      title: 'Activités modérées',
      questions: [
        {
          id: 'activite-mod-freq',
          title: 'Fais-tu des activités comme la marche rapide, vélo tranquille, danse ?',
          type: 'single-choice',
          options: [
            'Jamais',
            '1-2 fois par semaine',
            '3-4 fois par semaine 🚴',
            '5-6 fois par semaine',
            'Tous les jours',
          ],
          required: true,
        },
      ],
    },
    {
      id: 'temps-assis',
      title: 'Temps assis',
      questions: [
        {
          id: 'ecrans-duree',
          title: "Combien d'heures passes-tu devant les écrans par jour (hors cours) ?",
          type: 'single-choice',
          options: [
            "Moins d'1 heure",
            '1-2 heures',
            '3-4 heures',
            '5-6 heures',
            'Plus de 6 heures 📱',
          ],
          required: true,
        },
        {
          id: 'devoirs-duree',
          title: 'Combien de temps restes-tu assis pour les devoirs/études ?',
          type: 'single-choice',
          options: ["Moins d'1 heure", '1-2 heures 📚', '3-4 heures', '5 heures ou plus'],
          required: true,
        },
      ],
    },
  ],
};
