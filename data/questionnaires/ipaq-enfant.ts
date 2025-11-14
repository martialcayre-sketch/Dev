/**
 * Questionnaire IPAQ adapté pour les enfants (≤12 ans)
 */

export const QUESTIONNAIRE_IPAQ_ENFANT = {
  id: 'ipaq-enfant',
  title: 'Mes activités et jeux',
  description: 'Raconte-nous comment tu bouges et joues !',
  estimatedDuration: 6,
  ageRange: { min: 6, max: 12 },
  sections: [
    {
      id: 'jeux-actifs',
      title: 'Mes jeux actifs',
      questions: [
        {
          id: 'jeux-dehors',
          title: 'Est-ce que tu joues dehors ?',
          type: 'single-choice',
          options: ['Tous les jours 🌳', 'Presque tous les jours', 'Parfois', 'Rarement', 'Jamais'],
          required: true,
        },
        {
          id: 'sports-preferes',
          title: 'Quels sont tes jeux et sports préférés ? (tu peux en choisir plusieurs)',
          type: 'multiple-choice',
          options: [
            'Courir et faire la course 🏃',
            'Jouer au ballon ⚽',
            'Faire du vélo 🚲',
            'Nager 🏊',
            'Danser 💃',
            'Grimper aux arbres 🌳',
            'Jouer à chat',
            'Autre chose',
          ],
          required: true,
        },
      ],
    },
    {
      id: 'temps-actif',
      title: 'Mon temps actif',
      questions: [
        {
          id: 'recreation-activite',
          title: 'Que fais-tu pendant la récréation ?',
          type: 'single-choice',
          options: [
            'Je cours et joue beaucoup 🏃',
            'Je bouge un peu',
            'Je reste plutôt assis',
            'Je ne sors pas',
          ],
          required: true,
        },
        {
          id: 'weekend-jeux',
          title: 'Le weekend, combien de temps joues-tu dehors ?',
          type: 'single-choice',
          options: [
            'Pas du tout',
            "Un peu (moins d'1 heure)",
            'Pas mal (1-2 heures) 🌞',
            'Beaucoup (plus de 2 heures)',
          ],
          required: true,
        },
      ],
    },
    {
      id: 'ecrans-repos',
      title: 'Mes moments calmes',
      questions: [
        {
          id: 'tele-duree',
          title: 'Combien de temps regardes-tu la télé ou joues-tu sur tablette/téléphone ?',
          type: 'single-choice',
          options: [
            'Pas du tout',
            'Un peu chaque jour',
            'Quelques heures par jour 📺',
            "Beaucoup d'heures par jour",
          ],
          required: true,
        },
      ],
    },
  ],
};
