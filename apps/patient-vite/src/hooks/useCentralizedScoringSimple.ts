/**
 * 🧠 NeuroNutrition - Hook pour utiliser les APIs de scoring centralisées
 *
 * Remplace les hooks de scoring client-side (useDNSMScore, etc.)
 * par des appels aux APIs backend centralisées.
 */

import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { useCallback, useState } from 'react';

export interface CentralizedScores {
  scores: {
    dopamine: number;
    noradrenaline: number;
    serotonine: number;
    melatonine: number;
    total: number;
    dopaminePercent: number;
    noradrenalinePercent: number;
    serotoninePercent: number;
    melatoninePercent: number;
    globalPercent: number;
  };
  interpretations: Array<{
    axis: 'dopamine' | 'noradrenaline' | 'serotonine' | 'melatonine';
    score: number;
    percent: number;
    status: 'normal' | 'probable' | 'marquee';
    label: string;
    color: string;
    recommendations?: string[];
  }>;
  isComplete: boolean;
}

/**
 * Hook pour calculer les scores via l'API backend centralisée
 */
export function useCentralizedScoring() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Calcul des scores pour un questionnaire spécifique
   */
  const calculateScores = useCallback(
    async (
      questionnaireId: string,
      responses: Record<string, number | string>
    ): Promise<CentralizedScores | null> => {
      try {
        setLoading(true);
        setError(null);

        const calculateScoresFn = httpsCallable(functions, 'calculateQuestionnaireScores');
        const result = await calculateScoresFn({
          questionnaireId,
          responses,
        });

        const data = result.data as any;
        if (data?.success) {
          return {
            scores: data.scores,
            interpretations: data.interpretations,
            isComplete: data.isComplete,
          };
        } else {
          setError(data?.error || 'Erreur de calcul des scores');
          return null;
        }
      } catch (err: any) {
        console.error('Erreur API scoring:', err);
        setError(`Erreur API: ${err.message || 'Échec du calcul des scores'}`);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Génération de graphique adapté à l'âge
   */
  const generateChart = useCallback(
    async (
      questionnaireId: string,
      chartType: 'radar' | 'bar' | 'pie' = 'radar'
    ): Promise<any | null> => {
      try {
        setLoading(true);
        setError(null);

        const generateChartFn = httpsCallable(functions, 'generateQuestionnaireChart');
        const result = await generateChartFn({
          questionnaireId,
          chartType,
        });

        const data = result.data as any;
        if (data?.success) {
          return data;
        } else {
          setError(data?.error || 'Erreur de génération du graphique');
          return null;
        }
      } catch (err: any) {
        console.error('Erreur API chart:', err);
        setError(`Erreur API: ${err.message || 'Échec de génération du graphique'}`);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    calculateScores,
    generateChart,
  };
}
