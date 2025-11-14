/**
 * 🧒 NeuroNutrition - Hook d'adaptation UX selon l'âge patient
 *
 * Logique centralisée pour adapter l'interface selon l'âge détecté
 */

import type { AgeVariant } from '@neuronutrition/shared-questionnaires';
import { useEffect, useState } from 'react';

export interface PatientAgeData {
  birthDate?: string | Date;
  uid: string;
  ageVariant?: AgeVariant;
  patientAge?: number;
}

export interface UXAdaptation {
  variant: AgeVariant;
  age: number | null;
  needsParentHelp: boolean;
  encouragementLevel: 'low' | 'medium' | 'high';
  visualStyle: {
    colors: string;
    fontSize: string;
    spacing: string;
    animations: boolean;
  };
  language: {
    formality: 'formal' | 'informal' | 'simple';
    encouragement: string[];
    helpTexts: string;
  };
}

const UX_ADAPTATIONS: Record<AgeVariant, Omit<UXAdaptation, 'age'>> = {
  kid: {
    variant: 'kid',
    needsParentHelp: true,
    encouragementLevel: 'high',
    visualStyle: {
      colors: 'from-yellow-400 to-orange-400',
      fontSize: 'text-lg',
      spacing: 'space-y-6',
      animations: true,
    },
    language: {
      formality: 'simple',
      encouragement: [
        '🌟 Super ! Tu réponds très bien !',
        '🎈 Bravo ! Continue comme ça !',
        '🦋 Tu es formidable !',
        '🌈 Excellent travail !',
        '⭐ Tu y arrives très bien !',
      ],
      helpTexts: "🌟 Tu peux demander de l'aide à tes parents pour répondre !",
    },
  },
  teen: {
    variant: 'teen',
    needsParentHelp: false,
    encouragementLevel: 'medium',
    visualStyle: {
      colors: 'from-blue-400 to-purple-400',
      fontSize: 'text-base',
      spacing: 'space-y-4',
      animations: true,
    },
    language: {
      formality: 'informal',
      encouragement: [
        '💪 Très bien ! Continue !',
        '🌟 Tu gères parfaitement !',
        '⚡ Super boulot !',
        "🎯 Parfait ! Plus qu'un peu !",
      ],
      helpTexts:
        "💡 Réponds selon ce que tu ressens vraiment, il n'y a pas de bonne ou mauvaise réponse !",
    },
  },
  adult: {
    variant: 'adult',
    needsParentHelp: false,
    encouragementLevel: 'low',
    visualStyle: {
      colors: 'from-gray-400 to-gray-600',
      fontSize: 'text-base',
      spacing: 'space-y-4',
      animations: false,
    },
    language: {
      formality: 'formal',
      encouragement: ['Très bien, continuez !'],
      helpTexts: 'Répondez selon votre situation actuelle.',
    },
  },
};

/**
 * 🎯 Hook principal pour l'adaptation UX selon l'âge
 */
export function usePatientUX(patientData?: PatientAgeData): UXAdaptation {
  const [uxConfig, setUXConfig] = useState<UXAdaptation>({
    ...UX_ADAPTATIONS.adult,
    age: null,
  });

  useEffect(() => {
    if (!patientData) {
      setUXConfig({ ...UX_ADAPTATIONS.adult, age: null });
      return;
    }

    // Utilisation des données pré-calculées si disponibles
    if (patientData.ageVariant && patientData.patientAge !== undefined) {
      const adaptation = UX_ADAPTATIONS[patientData.ageVariant];
      setUXConfig({
        ...adaptation,
        age: patientData.patientAge,
      });
      return;
    }

    // Calcul à partir de la date de naissance si nécessaire
    if (patientData.birthDate) {
      const age = calculateAge(patientData.birthDate);
      const variant = getAgeVariant(age);
      const adaptation = UX_ADAPTATIONS[variant];

      setUXConfig({
        ...adaptation,
        age,
      });
    }
  }, [patientData]);

  return uxConfig;
}

/**
 * 🧮 Calcul de l'âge à partir de la date de naissance
 */
function calculateAge(birthDate: string | Date): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * 🎯 Détermination de la variante d'âge
 */
function getAgeVariant(age: number): AgeVariant {
  if (age >= 18) return 'adult';
  if (age >= 13) return 'teen';
  return 'kid';
}

/**
 * 🎨 Hook pour les styles visuels adaptatifs
 */
export function useAdaptiveStyles(variant: AgeVariant) {
  const config = UX_ADAPTATIONS[variant];

  return {
    containerClass: `bg-gradient-to-r ${config.visualStyle.colors} text-white`,
    textClass: config.visualStyle.fontSize,
    spacingClass: config.visualStyle.spacing,
    shouldAnimate: config.visualStyle.animations,

    // Classes Tailwind pré-construites
    cardClass:
      variant === 'kid'
        ? 'border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50'
        : variant === 'teen'
        ? 'border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50'
        : 'border-gray-200',

    buttonClass:
      variant === 'kid'
        ? 'text-lg h-14 px-8'
        : variant === 'teen'
        ? 'text-base h-12 px-6'
        : 'text-sm h-10 px-4',
  };
}

/**
 * 💬 Hook pour les messages adaptatifs
 */
export function useAdaptiveLanguage(variant: AgeVariant) {
  const config = UX_ADAPTATIONS[variant];

  const getRandomEncouragement = () => {
    const messages = config.language.encouragement;
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getNavigationText = (isNext: boolean, isLast: boolean) => {
    if (variant === 'kid') {
      if (isNext) {
        return isLast ? '🎉 Terminer !' : 'Question suivante →';
      } else {
        return "← Question d'avant";
      }
    } else if (variant === 'teen') {
      if (isNext) {
        return isLast ? '🎯 Terminer' : 'Suivant →';
      } else {
        return '← Précédent';
      }
    } else {
      return isNext ? (isLast ? 'Terminer' : 'Suivant') : 'Précédent';
    }
  };

  const getProgressText = (current: number, total: number) => {
    const progress = Math.round((current / total) * 100);

    switch (variant) {
      case 'kid':
        return `🎈 Tu as répondu à ${current} questions sur ${total} !`;
      case 'teen':
        return `${progress}% terminé - Plus que ${total - current} questions !`;
      default:
        return `${current} sur ${total} questions`;
    }
  };

  return {
    formality: config.language.formality,
    helpText: config.language.helpTexts,
    getRandomEncouragement,
    getNavigationText,
    getProgressText,
  };
}

/**
 * 🔧 Hook pour la gestion du mode parent/enfant
 */
export function useParentAssistance(variant: AgeVariant) {
  const [isParentHelping, setIsParentHelping] = useState(false);
  const [childUnderstands, setChildUnderstands] = useState(true);

  const isAvailable = variant === 'kid';

  const toggleParentHelp = () => {
    if (isAvailable) {
      setIsParentHelping((prev) => !prev);
    }
  };

  const getAssistanceText = () => {
    if (!isAvailable) return null;

    return {
      status: isParentHelping ? "Papa ou maman m'aide à répondre" : 'Je réponds tout seul(e)',
      buttonText: isParentHelping ? '✅ Avec aide' : "👋 Demander de l'aide",
      instruction: "👨‍👩‍👧‍👦 Papa ou maman peuvent t'aider à répondre !",
    };
  };

  return {
    isAvailable,
    isParentHelping,
    childUnderstands,
    setChildUnderstands,
    toggleParentHelp,
    getAssistanceText,
  };
}
