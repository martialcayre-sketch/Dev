/**
 * 🧠 NeuroNutrition - Générateur de Variantes Questionnaires
 *
 * Création automatique des variantes Teen et Kid à partir des templates Adult
 */

import type { AgeVariant, Question, Questionnaire } from './types';

/**
 * Configuration des adaptations par variante d'âge
 */
export const AGE_ADAPTATIONS = {
  teen: {
    titlePrefix: '🧑 ',
    languageStyle: 'informal', // Langage plus familier
    simplification: 'moderate', // Questions légèrement simplifiées
    examples: true, // Ajout d'exemples concrets
    encouragement: true, // Messages d'encouragement
  },
  kid: {
    titlePrefix: '🧒 ',
    languageStyle: 'simple', // Langage très simple
    simplification: 'high', // Questions très simplifiées
    examples: true, // Beaucoup d'exemples
    parentHelp: true, // Aide des parents requise
    visualAids: true, // Pictogrammes et couleurs
  },
} as const;

/**
 * Dictionnaire de simplification du vocabulaire
 */
export const VOCABULARY_SIMPLIFICATION = {
  // Mots complexes → Mots simples
  ressens: 'sens',
  parfois: 'des fois',
  souvent: 'beaucoup',
  rarement: 'pas souvent',
  concentrer: 'faire attention',
  fatigue: 'fatigue',
  anxieux: 'inquiet',
  démotivé: 'pas envie',
  stimulant: 'excitant',
  palpitations: 'cœur qui bat fort',
  digestif: 'ventre',
  intestinaux: 'ventre',
  musculaires: 'muscles',
  essoufflé: 'qui respire vite',
} as const;

/**
 * Messages d'encouragement par âge
 */
export const ENCOURAGEMENT_MESSAGES = {
  teen: [
    '💪 Tu peux le faire !',
    '🌟 Tes réponses nous aident à mieux te comprendre',
    '⚡ Continue, tu y es presque !',
  ],
  kid: [
    '🎈 Super ! Tu réponds très bien !',
    "🌈 Chaque réponse nous aide à t'aider",
    '🦋 Bravo ! Continue comme ça !',
  ],
} as const;

/**
 * 🎯 FONCTION PRINCIPALE - Génération des variantes questionnaires
 */
export function generateAgeVariant(
  baseQuestionnaire: Questionnaire,
  targetVariant: 'teen' | 'kid'
): Questionnaire {
  const adaptations = AGE_ADAPTATIONS[targetVariant];

  return {
    metadata: {
      ...baseQuestionnaire.metadata,
      id: `${baseQuestionnaire.metadata.id}-${targetVariant}`,
      title: `${adaptations.titlePrefix}${adaptQuestionnaireTitleForAge(
        baseQuestionnaire.metadata.title,
        targetVariant
      )}`,
      ageVariant: targetVariant,
      baseTemplateId: baseQuestionnaire.metadata.id,
      tags: [...(baseQuestionnaire.metadata.tags || []), `age-${targetVariant}`, 'auto-generated'],
    },
    questions: baseQuestionnaire.questions?.map((question) =>
      adaptQuestionForAge(question, targetVariant)
    ),
    sections: baseQuestionnaire.sections?.map((section) => ({
      ...section,
      title: adaptTextForAge(section.title, targetVariant),
      description: section.description
        ? adaptTextForAge(section.description, targetVariant)
        : undefined,
      questions: section.questions.map((question) => adaptQuestionForAge(question, targetVariant)),
    })),
  };
}

/**
 * Adapte le titre d'un questionnaire pour l'âge ciblé
 */
function adaptQuestionnaireTitleForAge(title: string, variant: 'teen' | 'kid'): string {
  const titleAdaptations = {
    teen: {
      'questionnaire de stress': 'Test de stress pour ados',
      questionnaire: 'Test',
      évaluation: 'Check-up',
      bilan: 'Point sur',
    },
    kid: {
      'questionnaire de stress': 'Comment tu te sens ?',
      questionnaire: 'Questions rigolotes',
      évaluation: 'Petit test',
      bilan: 'On regarde ensemble',
    },
  };

  let adaptedTitle = title;
  Object.entries(titleAdaptations[variant]).forEach(([complex, simple]) => {
    adaptedTitle = adaptedTitle.replace(new RegExp(complex, 'gi'), simple);
  });

  return adaptedTitle;
}

/**
 * Adapte une question individuelle pour l'âge ciblé
 */
function adaptQuestionForAge(question: Question, variant: 'teen' | 'kid'): Question {
  const adaptedQuestion: Question = {
    ...question,
    label: adaptTextForAge(question.label, variant),
    description: question.description ? adaptTextForAge(question.description, variant) : undefined,
    helpText: generateHelpTextForAge(question, variant),
  };

  // Adaptation des options de réponse pour les échelles
  if (question.scale && question.scaleType) {
    const scaleAdaptations = getScaleAdaptationsForAge(variant);
    adaptedQuestion.minLabel = scaleAdaptations.minLabel;
    adaptedQuestion.maxLabel = scaleAdaptations.maxLabel;
  }

  // Simplification des options de choix
  if (question.options && Array.isArray(question.options)) {
    adaptedQuestion.options = question.options.map((option) =>
      typeof option === 'string'
        ? adaptTextForAge(option, variant)
        : {
            ...option,
            label: adaptTextForAge(option.label, variant),
          }
    ) as typeof question.options;
  }

  return adaptedQuestion;
}

/**
 * Adapte un texte pour l'âge ciblé
 */
function adaptTextForAge(text: string, variant: 'teen' | 'kid'): string {
  let adaptedText = text;

  // Simplification du vocabulaire
  Object.entries(VOCABULARY_SIMPLIFICATION).forEach(([complex, simple]) => {
    const regex = new RegExp(`\\b${complex}\\b`, 'gi');
    adaptedText = adaptedText.replace(regex, simple);
  });

  // Adaptations spécifiques par âge
  if (variant === 'teen') {
    adaptedText = adaptTeenLanguage(adaptedText);
  } else if (variant === 'kid') {
    adaptedText = adaptKidLanguage(adaptedText);
  }

  return adaptedText;
}

/**
 * Adaptation langage adolescent
 */
function adaptTeenLanguage(text: string): string {
  return text
    .replace(/Veuillez/g, 'Peux-tu')
    .replace(/vous/g, 'tu')
    .replace(/votre/g, 'ton/ta')
    .replace(/Vous/g, 'Tu')
    .replace(/êtes/g, 'es')
    .replace(/Ces dernières semaines/g, 'Ces derniers temps');
}

/**
 * Adaptation langage enfant
 */
function adaptKidLanguage(text: string): string {
  return text
    .replace(/Veuillez/g, 'Peux-tu')
    .replace(/vous/g, 'tu')
    .replace(/votre/g, 'ton/ta')
    .replace(/Vous/g, 'Tu')
    .replace(/êtes/g, 'es')
    .replace(/Ces dernières semaines/g, 'Ces derniers jours')
    .replace(/questionnaire/gi, 'questions')
    .replace(/évaluation/gi, 'test');
}

/**
 * Génère un texte d'aide adapté à l'âge
 */
function generateHelpTextForAge(question: Question, variant: 'teen' | 'kid'): string {
  const baseHelp = question.helpText || '';

  if (variant === 'teen') {
    return `${baseHelp} 💡 Réponds selon ce que tu ressens vraiment, il n'y a pas de bonne ou mauvaise réponse !`;
  } else if (variant === 'kid') {
    return `${baseHelp} 🌟 Tu peux demander de l'aide à tes parents pour répondre ! Dis-leur comment tu te sens.`;
  }

  return baseHelp;
}

/**
 * Configuration des échelles pour chaque âge
 */
function getScaleAdaptationsForAge(variant: 'teen' | 'kid'): {
  minLabel: string;
  maxLabel: string;
} {
  if (variant === 'teen') {
    return {
      minLabel: 'Jamais du tout',
      maxLabel: 'Tout le temps',
    };
  } else {
    return {
      minLabel: '😊 Non, jamais',
      maxLabel: '😰 Oui, beaucoup',
    };
  }
}

/**
 * 🎯 Générateur batch pour tous les templates existants
 */
export function generateAllAgeVariants(baseQuestionnaires: Questionnaire[]): {
  teen: Questionnaire[];
  kid: Questionnaire[];
} {
  return {
    teen: baseQuestionnaires.map((q) => generateAgeVariant(q, 'teen')),
    kid: baseQuestionnaires.map((q) => generateAgeVariant(q, 'kid')),
  };
}

/**
 * 🔍 Utilitaire: Obtient la variante appropriée d'un questionnaire
 */
export function getQuestionnaireVariant(
  baseQuestionnaire: Questionnaire,
  targetVariant: AgeVariant,
  availableVariants: Questionnaire[]
): Questionnaire {
  if (targetVariant === 'adult') {
    return baseQuestionnaire;
  }

  // Chercher la variante générée
  const variant = availableVariants.find(
    (q) =>
      q.metadata.baseTemplateId === baseQuestionnaire.metadata.id &&
      q.metadata.ageVariant === targetVariant
  );

  if (variant) {
    return variant;
  }

  // Génération à la volée si pas trouvée
  return generateAgeVariant(baseQuestionnaire, targetVariant as 'teen' | 'kid');
}
