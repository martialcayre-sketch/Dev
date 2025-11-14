/**
 * Template DNSM pour adolescents (13-18 ans)
 * Version simplifiée avec langage adapté ("tu", "tes")
 */

export const dnsmTeenTemplate = {
  id: 'dnsm-teen',
  title: 'Mes Émotions (Ado)',
  description: 'Comprendre tes émotions et ton équilibre psychologique',
  category: 'Neuro-psychologie',
  estimatedMinutes: 5,
  ageVariant: 'teen' as const,

  questions: [
    {
      id: 'mood_morning',
      type: 'radio',
      question: 'Comment te sens-tu généralement le matin au réveil ?',
      options: [
        { value: '1', label: 'Super motivé(e), prêt(e) à conquérir le monde ! 🚀' },
        { value: '2', label: 'Plutôt en forme, ça va 👍' },
        { value: '3', label: "Moyen, j'ai besoin de temps pour émerger 😴" },
        { value: '4', label: 'Difficile, je préférerais rester au lit 😩' },
      ],
      neurotransmitter: 'dopamine',
    },
    {
      id: 'stress_handling',
      type: 'radio',
      question: 'Quand tu es stressé(e) (contrôles, disputes...), que se passe-t-il ?',
      options: [
        { value: '1', label: 'Je gère plutôt bien, ça ne me déstabilise pas trop 💪' },
        { value: '2', label: 'Je sens une petite tension mais ça passe vite ⚡' },
        { value: '3', label: 'Je suis assez perturbé(e), ça me suit plusieurs heures 😰' },
        { value: '4', label: "Je panique, mon cœur s'emballe, je n'arrive plus à réfléchir 😱" },
      ],
      neurotransmitter: 'noradrenaline',
    },
    {
      id: 'mood_swings',
      type: 'radio',
      question: "Tes changements d'humeur, c'est comment ?",
      options: [
        { value: '1', label: 'Je suis plutôt stable dans mes humeurs 🌅' },
        { value: '2', label: 'Parfois des hauts et des bas, mais ça reste gérable 🎢' },
        { value: '3', label: 'Ça change assez souvent, mes proches le remarquent 🌪️' },
        { value: '4', label: "C'est le grand huit émotionnel, j'ai du mal à me comprendre 🎭" },
      ],
      neurotransmitter: 'serotonine',
    },
    {
      id: 'sleep_quality',
      type: 'radio',
      question: 'Niveau sommeil, ça donne quoi ?',
      options: [
        { value: '1', label: 'Je dors comme un bébé, réveil en pleine forme 😴💤' },
        { value: '2', label: 'Globalement ça va, quelques nuits difficiles parfois 🌙' },
        { value: '3', label: "Souvent du mal à m'endormir ou je me réveille la nuit 🌃" },
        { value: '4', label: "C'est compliqué, fatigue chronique, insomnies fréquentes 😵‍💫" },
      ],
      neurotransmitter: 'melatonine',
    },
    {
      id: 'motivation_school',
      type: 'radio',
      question: 'Ta motivation pour les études/projets ?',
      options: [
        { value: '1', label: "À fond ! J'ai plein d'objectifs et j'y vais 🎯" },
        { value: '2', label: "Ça va, je fais ce qu'il faut faire 📚" },
        { value: '3', label: 'Difficile de me motiver, ça me demande des efforts 😮‍💨' },
        { value: '4', label: "Je procrastine tout le temps, plus rien ne m'intéresse 😑" },
      ],
      neurotransmitter: 'dopamine',
    },
  ],

  scoring: {
    dopamine: {
      questions: ['mood_morning', 'motivation_school'],
      max: 8,
      interpretation: {
        1: { status: 'optimal', label: 'Énergie et motivation au top !' },
        2: { status: 'good', label: 'Belle énergie, tu assures !' },
        3: { status: 'low', label: 'Un peu de fatigue, on peut améliorer' },
        4: { status: 'very_low', label: "Niveau d'énergie à booster" },
      },
    },
    noradrenaline: {
      questions: ['stress_handling'],
      max: 4,
      interpretation: {
        1: { status: 'optimal', label: 'Gestion du stress excellente' },
        2: { status: 'good', label: 'Tu gères bien le stress' },
        3: { status: 'medium', label: 'Le stress te touche un peu' },
        4: { status: 'high', label: "Stress élevé, on peut t'aider" },
      },
    },
    serotonine: {
      questions: ['mood_swings'],
      max: 4,
      interpretation: {
        1: { status: 'optimal', label: 'Humeur stable et équilibrée' },
        2: { status: 'good', label: 'Plutôt équilibré(e)' },
        3: { status: 'unstable', label: 'Quelques turbulences émotionnelles' },
        4: { status: 'very_unstable', label: 'Humeur très changeante' },
      },
    },
    melatonine: {
      questions: ['sleep_quality'],
      max: 4,
      interpretation: {
        1: { status: 'optimal', label: 'Sommeil de qualité' },
        2: { status: 'good', label: 'Globalement bon sommeil' },
        3: { status: 'poor', label: 'Quelques difficultés de sommeil' },
        4: { status: 'very_poor', label: 'Sommeil perturbé' },
      },
    },
  },

  advice: {
    dopamine_low: [
      'Fixe-toi des petits objectifs quotidiens réalisables',
      'Pratique une activité physique que tu aimes (sport, danse, etc.)',
      'Écoute de la musique qui te motive',
      'Entoure-toi de personnes positives',
    ],
    noradrenaline_high: [
      'Essaie des techniques de respiration (4-7-8)',
      'Prends des pauses régulières dans tes révisions',
      'Teste la méditation ou des apps de relaxation',
      'Parles-en avec tes proches ou un professionnel',
    ],
    serotonine_unstable: [
      'Garde un rythme de sommeil régulier',
      'Expose-toi à la lumière naturelle le matin',
      'Pratique une activité créative qui te plaît',
      'Maintiens des liens sociaux de qualité',
    ],
    melatonine_poor: [
      'Évite les écrans 1h avant le coucher',
      'Crée une routine relaxante le soir',
      'Garde ta chambre fraîche et sombre',
      'Évite la caféine après 16h',
    ],
  },
};

export default dnsmTeenTemplate;
