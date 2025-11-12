import type { Questionnaire } from '../../types';

/**
 * DNSM v2 - Questionnaire Dopamine, Noradrénaline, Sérotonine, Mélatonine
 * Format structuré avec 40 questions (10 par neurotransmetteur)
 * Échelle Likert 0-4 pour chaque item
 */
export const dnsm_v2: Questionnaire = {
  metadata: {
    id: 'dnsm',
    title: 'Questionnaire Dopamine-Noradrénaline-Sérotonine-Mélatonine',
    category: 'neuro-psychologie',
  },
  questions: [
    // ========== DOPAMINE (DA) - Motivation, énergie, initiative ==========
    {
      id: 'da-1',
      label: "J'ai des difficultés à me lever le matin",
      type: 'select',
      section: 'dopamine',
    },
    {
      id: 'da-2',
      label: "J'ai du mal à commencer une action",
      type: 'select',
      section: 'dopamine',
    },
    {
      id: 'da-3',
      label: "Je me sens moins créatif, moins imaginatif que je ne l'ai été",
      type: 'select',
      section: 'dopamine',
    },
    {
      id: 'da-4',
      label: 'Je ressens de la fatigue avant même de commencer à agir',
      type: 'select',
      section: 'dopamine',
    },
    {
      id: 'da-5',
      label: "Je porte moins d'intérêt à mes loisirs, mes activités",
      type: 'select',
      section: 'dopamine',
    },
    {
      id: 'da-6',
      label: "J'ai moins de désir sexuel et amoureux",
      type: 'select',
      section: 'dopamine',
    },
    {
      id: 'da-7',
      label: 'Mon sommeil est agité physiquement, je remue beaucoup',
      type: 'select',
      section: 'dopamine',
    },
    {
      id: 'da-8',
      label: "Je n'ai plus tellement de nouveaux projets",
      type: 'select',
      section: 'dopamine',
    },
    {
      id: 'da-9',
      label: "J'ai du mal à me concentrer, à suivre le fil de ma pensée",
      type: 'select',
      section: 'dopamine',
    },
    {
      id: 'da-10',
      label: 'Je cherche souvent mes mots',
      type: 'select',
      section: 'dopamine',
    },

    // ========== NORADRÉNALINE (NA) - Confiance, persévérance, plaisir ==========
    {
      id: 'na-1',
      label: "J'ai une mauvaise opinion de moi-même",
      type: 'select',
      section: 'noradrenaline',
    },
    {
      id: 'na-2',
      label: 'Je manque de confiance',
      type: 'select',
      section: 'noradrenaline',
    },
    {
      id: 'na-3',
      label: "J'ai souvent le sentiment de ne pas être à la hauteur",
      type: 'select',
      section: 'noradrenaline',
    },
    {
      id: 'na-4',
      label: "J'ai besoin de sentir l'approbation des autres",
      type: 'select',
      section: 'noradrenaline',
    },
    {
      id: 'na-5',
      label: "J'ai besoin d'être aimé, rassuré",
      type: 'select',
      section: 'noradrenaline',
    },
    {
      id: 'na-6',
      label: 'Je ne persévère pas, je suis vite découragé',
      type: 'select',
      section: 'noradrenaline',
    },
    {
      id: 'na-7',
      label: 'Je me sens moralement fatigué',
      type: 'select',
      section: 'noradrenaline',
    },
    {
      id: 'na-8',
      label: 'Je prends rarement plaisir à ce que je fais',
      type: 'select',
      section: 'noradrenaline',
    },
    {
      id: 'na-9',
      label: "Je ne suis pas digne d'être aimé",
      type: 'select',
      section: 'noradrenaline',
    },
    {
      id: 'na-10',
      label: 'Je me sens triste, sans joie, sans plaisir',
      type: 'select',
      section: 'noradrenaline',
    },

    // ========== SÉROTONINE (SE) - Irritabilité, impulsivité, dépendance ==========
    {
      id: 'se-1',
      label: 'Je suis irritable, impulsif, et vite en colère',
      type: 'select',
      section: 'serotonine',
    },
    {
      id: 'se-2',
      label: "Je suis impatient, je ne supporte pas d'attendre",
      type: 'select',
      section: 'serotonine',
    },
    {
      id: 'se-3',
      label: 'Je ne supporte pas les contraintes',
      type: 'select',
      section: 'serotonine',
    },
    {
      id: 'se-4',
      label: 'Je suis attiré vers le sucré, le chocolat en fin de journée',
      type: 'select',
      section: 'serotonine',
    },
    {
      id: 'se-5',
      label: 'Je me sens dépendant facilement : tabac, alcool, drogues, sports...',
      type: 'select',
      section: 'serotonine',
    },
    {
      id: 'se-6',
      label: "J'ai du mal à prendre du recul, à rester zen",
      type: 'select',
      section: 'serotonine',
    },
    {
      id: 'se-7',
      label: "J'ai du mal à trouver le sommeil, à me rendormir la nuit",
      type: 'select',
      section: 'serotonine',
    },
    {
      id: 'se-8',
      label: 'Je me sens vite vulnérable au stress, au bruit',
      type: 'select',
      section: 'serotonine',
    },
    {
      id: 'se-9',
      label: "Je suis susceptible, un rien m'agace",
      type: 'select',
      section: 'serotonine',
    },
    {
      id: 'se-10',
      label: "Je change très vite d'humeur",
      type: 'select',
      section: 'serotonine',
    },

    // ========== MÉLATONINE (ME) - Sommeil, rythme, retrait social ==========
    {
      id: 'me-1',
      label: "Je me sens marginal, exclus, mal à l'aise dans un groupe",
      type: 'select',
      section: 'melatonine',
    },
    {
      id: 'me-2',
      label: 'Je suis plutôt discret et en retrait en société',
      type: 'select',
      section: 'melatonine',
    },
    {
      id: 'me-3',
      label: "J'ai un sommeil « fragile »",
      type: 'select',
      section: 'melatonine',
    },
    {
      id: 'me-4',
      label: "J'ai du mal à aller me coucher le soir",
      type: 'select',
      section: 'melatonine',
    },
    {
      id: 'me-5',
      label: "Je n'aime pas partager de confidences, je suis discret, réservé",
      type: 'select',
      section: 'melatonine',
    },
    {
      id: 'me-6',
      label: 'Je ne suis pas très conciliant ni adaptable',
      type: 'select',
      section: 'melatonine',
    },
    {
      id: 'me-7',
      label: 'Mes rythmes de vie sont souvent irréguliers ou décalés',
      type: 'select',
      section: 'melatonine',
    },
    {
      id: 'me-8',
      label: "J'ai du mal à me mettre à la place des autres, à les comprendre",
      type: 'select',
      section: 'melatonine',
    },
    {
      id: 'me-9',
      label: "J'ai plutôt du mal à m'exprimer, à partager",
      type: 'select',
      section: 'melatonine',
    },
    {
      id: 'me-10',
      label: 'Je supporte mal les décalages horaires',
      type: 'select',
      section: 'melatonine',
    },
  ],
};
