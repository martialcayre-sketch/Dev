/**
 * Questionnaire sommeil adapté pour les enfants (≤12 ans)
 */

export const QUESTIONNAIRE_SOMMEIL_ENFANT = {
  id: 'sommeil-enfant',
  title: 'Mon dodo',
  description: 'Raconte-nous comment tu dors !',
  estimatedDuration: 5,
  ageRange: { min: 6, max: 12 },
  sections: [
    {
      id: 'heure-dodo',
      title: "L'heure du dodo",
      questions: [
        {
          id: 'coucher-semaine',
          title: 'À quelle heure vas-tu te coucher en semaine ?',
          type: 'single-choice',
          options: [
            'Avant 20h',
            'Entre 20h et 20h30 🌙',
            'Entre 20h30 et 21h',
            'Entre 21h et 21h30',
            'Après 21h30',
          ],
          required: true,
        },
        {
          id: 'lever-semaine',
          title: "Et à quelle heure te réveilles-tu pour aller à l'école ?",
          type: 'single-choice',
          options: ['Avant 7h', 'Entre 7h et 7h30 ☀️', 'Entre 7h30 et 8h', 'Après 8h'],
          required: true,
        },
      ],
    },
    {
      id: 'rituel-dodo',
      title: 'Avant de dormir',
      questions: [
        {
          id: 'rituel-coucher',
          title: "Que fais-tu avant d'aller dormir ? (tu peux choisir plusieurs réponses)",
          type: 'multiple-choice',
          options: [
            'Je me lave les dents 🦷',
            'Papa ou maman me lit une histoire 📚',
            'Je regarde un dessin animé',
            'Je joue un peu',
            'Je fais un câlin à mon doudou 🧸',
            "Je bois un verre d'eau",
            'Autre chose',
          ],
          required: true,
        },
      ],
    },
    {
      id: 'qualite-dodo',
      title: 'Comment je dors',
      questions: [
        {
          id: 'facilite-endormissement',
          title: "Est-ce que tu t'endors facilement ?",
          type: 'single-choice',
          options: [
            'Oui, très facilement 😴',
            'Oui, assez facilement',
            "Parfois c'est difficile",
            "C'est souvent difficile",
          ],
          required: true,
        },
        {
          id: 'reveils-nuit-enfant',
          title: 'Est-ce que tu te réveilles pendant la nuit ?',
          type: 'single-choice',
          options: ['Non, jamais 💤', 'Rarement', 'Parfois', 'Souvent'],
          required: true,
        },
      ],
    },
  ],
};
