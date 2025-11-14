/**
 * Template DNSM pour enfants (6-12 ans)
 * Version avec pictogrammes et langage très simple
 */

export const dnsmKidTemplate = {
  id: 'dnsm-kid',
  title: 'Mes Humeurs (Enfant)',
  description: 'Questionnaire avec pictogrammes sur les émotions',
  category: 'Neuro-psychologie',
  estimatedMinutes: 4,
  ageVariant: 'kid' as const,

  questions: [
    {
      id: 'morning_feeling',
      type: 'emoji_scale',
      question: 'Le matin quand tu te réveilles, comment te sens-tu ?',
      emojis: [
        { value: '4', emoji: '😴', label: 'Très fatigué' },
        { value: '3', emoji: '😐', label: 'Un peu fatigué' },
        { value: '2', emoji: '🙂', label: 'Ça va' },
        { value: '1', emoji: '😄', label: 'Super en forme !' },
      ],
      neurotransmitter: 'dopamine',
    },
    {
      id: 'when_scared',
      type: 'emoji_scale',
      question: 'Quand tu as peur ou que tu es inquiet, que se passe-t-il ?',
      emojis: [
        { value: '1', emoji: '😌', label: 'Je reste calme' },
        { value: '2', emoji: '😰', label: 'Mon cœur bat un peu vite' },
        { value: '3', emoji: '😨', label: 'Mon cœur bat très vite' },
        { value: '4', emoji: '😱', label: "J'ai très très peur" },
      ],
      neurotransmitter: 'noradrenaline',
    },
    {
      id: 'mood_changes',
      type: 'emoji_scale',
      question: 'Est-ce que ton humeur change souvent dans la journée ?',
      emojis: [
        { value: '1', emoji: '😊', label: 'Non, je suis toujours pareil' },
        { value: '2', emoji: '🙂', label: 'Parfois ça change un peu' },
        { value: '3', emoji: '😕', label: 'Oui, ça change souvent' },
        { value: '4', emoji: '😢', label: 'Ça change tout le temps' },
      ],
      neurotransmitter: 'serotonine',
    },
    {
      id: 'sleep_easy',
      type: 'emoji_scale',
      question: "Est-ce que tu t'endors facilement le soir ?",
      emojis: [
        { value: '1', emoji: '😴', label: 'Oui, très facilement' },
        { value: '2', emoji: '🙂', label: 'Oui, assez facilement' },
        { value: '3', emoji: '😐', label: "Parfois c'est difficile" },
        { value: '4', emoji: '😟', label: "C'est toujours difficile" },
      ],
      neurotransmitter: 'melatonine',
    },
    {
      id: 'want_to_play',
      type: 'emoji_scale',
      question: 'As-tu envie de jouer et de faire des activités ?',
      emojis: [
        { value: '1', emoji: '🎉', label: 'Oui, tout le temps !' },
        { value: '2', emoji: '😊', label: 'Oui, souvent' },
        { value: '3', emoji: '😐', label: 'Parfois' },
        { value: '4', emoji: '😔', label: 'Pas souvent' },
      ],
      neurotransmitter: 'dopamine',
    },
    {
      id: 'happy_or_sad',
      type: 'emoji_scale',
      question: 'En général, es-tu plutôt content(e) ou triste ?',
      emojis: [
        { value: '1', emoji: '😄', label: 'Très content !' },
        { value: '2', emoji: '🙂', label: 'Content' },
        { value: '3', emoji: '😐', label: 'Ni content ni triste' },
        { value: '4', emoji: '😢', label: 'Souvent triste' },
      ],
      neurotransmitter: 'serotonine',
    },
  ],

  parentMode: {
    enabled: true,
    alternativeQuestions: [
      {
        id: 'morning_feeling_parent',
        question: 'Le matin, comment observez-vous votre enfant au réveil ?',
        options: [
          'En pleine forme, se lève facilement',
          'Plutôt en forme après quelques minutes',
          "Difficultés à se lever, a besoin d'encouragements",
          'Très difficile de le/la faire sortir du lit',
        ],
      },
    ],
  },

  scoring: {
    dopamine: {
      questions: ['morning_feeling', 'want_to_play'],
      max: 8,
      colors: ['🟢', '🟡', '🟠', '🔴'],
      interpretation: {
        1: { status: 'optimal', label: "Plein d'énergie ! 🌟", color: '🟢' },
        2: { status: 'good', label: 'Bonne énergie 👍', color: '🟡' },
        3: { status: 'low', label: 'Un peu fatigué 😴', color: '🟠' },
        4: { status: 'very_low', label: "Manque d'énergie 🔋", color: '🔴' },
      },
    },
    noradrenaline: {
      questions: ['when_scared'],
      max: 4,
      interpretation: {
        1: { status: 'optimal', label: 'Très calme 😌', color: '🟢' },
        2: { status: 'good', label: 'Plutôt calme 🙂', color: '🟡' },
        3: { status: 'medium', label: 'Parfois inquiet 😰', color: '🟠' },
        4: { status: 'high', label: 'Souvent stressé 😨', color: '🔴' },
      },
    },
    serotonine: {
      questions: ['mood_changes', 'happy_or_sad'],
      max: 8,
      interpretation: {
        1: { status: 'optimal', label: 'Humeur stable et joyeuse 😊', color: '🟢' },
        2: { status: 'good', label: 'Plutôt content 🙂', color: '🟡' },
        3: { status: 'unstable', label: 'Humeur qui change 😐', color: '🟠' },
        4: { status: 'very_unstable', label: 'Souvent triste 😢', color: '🔴' },
      },
    },
    melatonine: {
      questions: ['sleep_easy'],
      max: 4,
      interpretation: {
        1: { status: 'optimal', label: 'Très bon sommeil 😴', color: '🟢' },
        2: { status: 'good', label: 'Bon sommeil 🌙', color: '🟡' },
        3: { status: 'poor', label: 'Sommeil difficile 😐', color: '🟠' },
        4: { status: 'very_poor', label: 'Sommeil très difficile 😟', color: '🔴' },
      },
    },
  },

  advice: {
    for_parents: {
      dopamine_low: [
        'Encouragez les activités physiques ludiques',
        'Établissez des routines de jeux actifs',
        "Limitez le temps d'écran passif",
        'Proposez des activités créatives stimulantes',
      ],
      noradrenaline_high: [
        'Créez un environnement calme et prévisible',
        'Enseignez des techniques de respiration simple (ex: souffler comme un ballon)',
        'Utilisez des histoires relaxantes avant le coucher',
        "Consultez si l'anxiété persiste",
      ],
      serotonine_unstable: [
        'Maintenez des routines régulières',
        "Assurez-vous d'une exposition à la lumière naturelle",
        'Favorisez les activités sociales positives',
        "Soyez attentif aux changements d'humeur",
      ],
      melatonine_poor: [
        'Établissez une routine de coucher fixe',
        "Réduisez l'exposition aux écrans le soir",
        'Créez une atmosphère calme dans la chambre',
        'Évitez les activités stimulantes avant le coucher',
      ],
    },
  },
};

export default dnsmKidTemplate;
