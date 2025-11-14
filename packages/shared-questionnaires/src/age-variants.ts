/**
 * 🧠 NeuroNutrition - Générateur de Variantes Questionnaires
 * 
 * Création automatique des variantes Teen et Kid à partir des templates Adult
 */

import type { Questionnaire, Question, AgeVariant } from '../types';

/**
 * Configuration des adaptations par variante d'âge
 */
export const AGE_ADAPTATIONS = {
  teen: {
    titlePrefix: '🧑 ',
    languageStyle: 'informal', // Langage plus familier
    simplification: 'moderate', // Questions légèrement simplifiées
    examples: true, // Ajout d'exemples concrets
    encouragement: true // Messages d'encouragement
  },
  kid: {
    titlePrefix: '🧒 ',
    languageStyle: 'simple', // Langage très simple
    simplification: 'high', // Questions très simplifiées
    examples: true, // Beaucoup d'exemples
    parentHelp: true, // Aide des parents requise
    visualAids: true // Pictogrammes et couleurs
  }
} as const;

/**
 * Dictionnaire de simplification du vocabulaire
 */
export const VOCABULARY_SIMPLIFICATION = {
  // Mots complexes → Mots simples
  'ressens': 'sens',
  'parfois': 'des fois',
  'souvent': 'beaucoup',
  'rarement': 'pas souvent',
  'concentrer': 'faire attention',
  'fatigue': 'fatigue',
  'anxieux': 'inquiet',
  'démotivé': 'pas envie',
  'stimulant': 'excitant',
  'palpitations': 'cœur qui bat fort',
  'digestif': 'ventre',
  'intestinaux': 'ventre',
  'musculaires': 'muscles',
  'essoufflé': 'qui respire vite'
} as const;

/**
 * Messages d'encouragement par âge
 */
export const ENCOURAGEMENT_MESSAGES = {
  teen: [
    "💪 Tu peux le faire !",
    "🌟 Tes réponses nous aident à mieux te comprendre",
    "⚡ Continue, tu y es presque !"
  ],
  kid: [
    "🎈 Super ! Tu réponds très bien !",
    "🌈 Chaque réponse nous aide à t'aider",
    "🦋 Bravo ! Continue comme ça !"
  ]
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
      title: `${adaptations.titlePrefix}${adaptQuestionnaireTitleForAge(baseQuestionnaire.metadata.title, targetVariant)}`,
      ageVariant: targetVariant,
      baseTemplateId: baseQuestionnaire.metadata.id,
      tags: [...(baseQuestionnaire.metadata.tags || []), `age-${targetVariant}`, 'auto-generated']
    },
    questions: baseQuestionnaire.questions?.map(question => 
      adaptQuestionForAge(question, targetVariant)
    ),
    sections: baseQuestionnaire.sections?.map(section => ({
      ...section,
      title: adaptTextForAge(section.title, targetVariant),
      description: section.description ? adaptTextForAge(section.description, targetVariant) : undefined,
      questions: section.questions.map(question => adaptQuestionForAge(question, targetVariant))
    }))
  };
}\n\n/**\n * Adapte le titre d'un questionnaire pour l'âge ciblé\n */\nfunction adaptQuestionnaireTitleForAge(title: string, variant: 'teen' | 'kid'): string {\n  const titleAdaptations = {\n    teen: {\n      'questionnaire de stress': 'Test de stress pour ados',\n      'questionnaire': 'Test',\n      'évaluation': 'Check-up',\n      'bilan': 'Point sur'\n    },\n    kid: {\n      'questionnaire de stress': 'Comment tu te sens ?',\n      'questionnaire': 'Questions rigolotes',\n      'évaluation': 'Petit test',\n      'bilan': 'On regarde ensemble'\n    }\n  };\n\n  let adaptedTitle = title;\n  Object.entries(titleAdaptations[variant]).forEach(([complex, simple]) => {\n    adaptedTitle = adaptedTitle.replace(new RegExp(complex, 'gi'), simple);\n  });\n\n  return adaptedTitle;\n}\n\n/**\n * Adapte une question individuelle pour l'âge ciblé\n */\nfunction adaptQuestionForAge(question: Question, variant: 'teen' | 'kid'): Question {\n  const adaptedQuestion: Question = {\n    ...question,\n    label: adaptTextForAge(question.label, variant),\n    description: question.description ? adaptTextForAge(question.description, variant) : undefined,\n    helpText: generateHelpTextForAge(question, variant)\n  };\n\n  // Adaptation des options de réponse pour les échelles\n  if (question.scale && question.scaleType) {\n    const scaleAdaptations = getScaleAdaptationsForAge(variant);\n    adaptedQuestion.minLabel = scaleAdaptations.minLabel;\n    adaptedQuestion.maxLabel = scaleAdaptations.maxLabel;\n  }\n\n  // Simplification des options de choix\n  if (question.options && Array.isArray(question.options)) {\n    adaptedQuestion.options = question.options.map(option => \n      typeof option === 'string' ? adaptTextForAge(option, variant) : {\n        ...option,\n        label: adaptTextForAge(option.label, variant)\n      }\n    );\n  }\n\n  return adaptedQuestion;\n}\n\n/**\n * Adapte un texte pour l'âge ciblé\n */\nfunction adaptTextForAge(text: string, variant: 'teen' | 'kid'): string {\n  let adaptedText = text;\n\n  // Simplification du vocabulaire\n  Object.entries(VOCABULARY_SIMPLIFICATION).forEach(([complex, simple]) => {\n    const regex = new RegExp(`\\\\b${complex}\\\\b`, 'gi');\n    adaptedText = adaptedText.replace(regex, simple);\n  });\n\n  // Adaptations spécifiques par âge\n  if (variant === 'teen') {\n    adaptedText = adaptTeenLanguage(adaptedText);\n  } else if (variant === 'kid') {\n    adaptedText = adaptKidLanguage(adaptedText);\n  }\n\n  return adaptedText;\n}\n\n/**\n * Adaptation langage adolescent\n */\nfunction adaptTeenLanguage(text: string): string {\n  return text\n    .replace(/Veuillez/g, 'Peux-tu')\n    .replace(/vous/g, 'tu')\n    .replace(/votre/g, 'ton/ta')\n    .replace(/Vous/g, 'Tu')\n    .replace(/êtes/g, 'es')\n    .replace(/Ces dernières semaines/g, 'Ces derniers temps');\n}\n\n/**\n * Adaptation langage enfant\n */\nfunction adaptKidLanguage(text: string): string {\n  return text\n    .replace(/Veuillez/g, 'Peux-tu')\n    .replace(/vous/g, 'tu')\n    .replace(/votre/g, 'ton/ta')\n    .replace(/Vous/g, 'Tu')\n    .replace(/êtes/g, 'es')\n    .replace(/Ces dernières semaines/g, 'Ces derniers jours')\n    .replace(/questionnaire/gi, 'questions')\n    .replace(/évaluation/gi, 'test');\n}\n\n/**\n * Génère un texte d'aide adapté à l'âge\n */\nfunction generateHelpTextForAge(question: Question, variant: 'teen' | 'kid'): string {\n  const baseHelp = question.helpText || '';\n  \n  if (variant === 'teen') {\n    return `${baseHelp} 💡 Réponds selon ce que tu ressens vraiment, il n'y a pas de bonne ou mauvaise réponse !`;\n  } else if (variant === 'kid') {\n    return `${baseHelp} 🌟 Tu peux demander de l'aide à tes parents pour répondre ! Dis-leur comment tu te sens.`;\n  }\n  \n  return baseHelp;\n}\n\n/**\n * Configuration des échelles pour chaque âge\n */\nfunction getScaleAdaptationsForAge(variant: 'teen' | 'kid'): { minLabel: string; maxLabel: string } {\n  if (variant === 'teen') {\n    return {\n      minLabel: 'Jamais du tout',\n      maxLabel: 'Tout le temps'\n    };\n  } else {\n    return {\n      minLabel: '😊 Non, jamais',\n      maxLabel: '😰 Oui, beaucoup'\n    };\n  }\n}\n\n/**\n * 🎯 Générateur batch pour tous les templates existants\n */\nexport function generateAllAgeVariants(baseQuestionnaires: Questionnaire[]): {\n  teen: Questionnaire[];\n  kid: Questionnaire[];\n} {\n  return {\n    teen: baseQuestionnaires.map(q => generateAgeVariant(q, 'teen')),\n    kid: baseQuestionnaires.map(q => generateAgeVariant(q, 'kid'))\n  };\n}\n\n/**\n * 🔍 Utilitaire: Obtient la variante appropriée d'un questionnaire\n */\nexport function getQuestionnaireVariant(\n  baseQuestionnaire: Questionnaire,\n  targetVariant: AgeVariant,\n  availableVariants: Questionnaire[]\n): Questionnaire {\n  if (targetVariant === 'adult') {\n    return baseQuestionnaire;\n  }\n  \n  // Chercher la variante générée\n  const variant = availableVariants.find(q => \n    q.metadata.baseTemplateId === baseQuestionnaire.metadata.id &&\n    q.metadata.ageVariant === targetVariant\n  );\n  \n  if (variant) {\n    return variant;\n  }\n  \n  // Génération à la volée si pas trouvée\n  return generateAgeVariant(baseQuestionnaire, targetVariant as 'teen' | 'kid');\n}