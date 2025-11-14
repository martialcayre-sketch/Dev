/**
 * 🧠 NeuroNutrition - Hook pour utiliser les APIs de scoring centralisées
 *
 * Remplace les hooks de scoring client-side (useDNSMScore, etc.)
 * par des appels aux APIs backend centralisées.
 */

import { functions } from '@/lib/firebase';
import { httpsCallable, type HttpsCallable } from 'firebase/functions';
import { useCallback, useEffect, useState } from 'react';

// Types pour les réponses des Cloud Functions
interface ScoreCloudFunctionResponse {
  success: boolean;
  error?: string;
  patientId: string;
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
  calculatedAt: string;
}

interface ChartCloudFunctionResponse {
  success: boolean;
  error?: string;
  patientId: string;
  ageVariant: 'kid' | 'teen' | 'adult';
  chartData: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string;
      borderWidth?: number;
    }>;
  };
  svg?: string;
  generatedAt: string;
}

interface DashboardCloudFunctionResponse {
  success: boolean;
  error?: string;
  patient: {
    id: string;
    email: string;
    displayName?: string;
    age?: number;
    ageVariant: 'kid' | 'teen' | 'adult';
  };
  questionnaires: Array<{
    id: string;
    title: string;
    status: string;
    scores?: any;
  }>;
  charts: Array<any>;
  lastUpdated: string;
}

export interface CentralizedScores {
  questionnaireId: string;
  patientId: string;
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
  calculatedAt: Date;
}

export interface GeneratedChart {
  questionnaireId: string;
  patientId: string;
  chartType: 'radar' | 'bar' | 'pie';
  ageVariant: 'kid' | 'teen' | 'adult';
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string;
      borderWidth?: number;
    }>;
  };
  svg?: string;
  generatedAt: Date;
}

export interface PatientDashboardData {
  patient: {
    id: string;
    email: string;
    displayName?: string;
    age?: number;
    ageVariant: 'kid' | 'teen' | 'adult';
  };
  questionnaires: Array<{
    id: string;
    title: string;
    status: string;
    scores?: CentralizedScores;
  }>;
  charts: GeneratedChart[];
  lastUpdated: Date;
}

/**
 * Hook pour calculer les scores via l'API backend centralisée
 */
export function useCentralizedScoring() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cloud Functions callables
  const [calculateScoresFn, setCalculateScoresFn] = useState<HttpsCallable<
    any,
    ScoreCloudFunctionResponse
  > | null>(null);
  const [generateChartFn, setGenerateChartFn] = useState<HttpsCallable<
    any,
    ChartCloudFunctionResponse
  > | null>(null);
  const [getDashboardFn, setGetDashboardFn] = useState<HttpsCallable<
    any,
    DashboardCloudFunctionResponse
  > | null>(null);

  useEffect(() => {
    // Initialize Cloud Functions callables
    setCalculateScoresFn(
      httpsCallable<any, ScoreCloudFunctionResponse>(functions, 'calculateQuestionnaireScores')
    );
    setGenerateChartFn(
      httpsCallable<any, ChartCloudFunctionResponse>(functions, 'generateQuestionnaireChart')
    );
    setGetDashboardFn(
      httpsCallable<any, DashboardCloudFunctionResponse>(functions, 'getPatientDashboardData')
    );
  }, []);

  /**
   * Calcul des scores pour un questionnaire spécifique
   */
  const calculateScores = useCallback(
    async (
      questionnaireId: string,
      responses: Record<string, number | string>
    ): Promise<CentralizedScores | null> => {
      if (!calculateScoresFn) {
        setError('Service de scoring non initialisé');
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await calculateScoresFn({
          questionnaireId,
          responses,
        });

        if (result.data.success) {
          return {
            questionnaireId,
            patientId: result.data.patientId,
            scores: result.data.scores,
            interpretations: result.data.interpretations,
            isComplete: result.data.isComplete,
            calculatedAt: new Date(result.data.calculatedAt),
          };
        } else {
          setError(result.data.error || 'Erreur de calcul des scores');
          return null;
        }
      } catch (err: any) {
        setError(`Erreur API: ${err.message || 'Échec du calcul des scores'}`);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [calculateScoresFn]
  );

  /**
   * Génération de graphique adapté à l'âge
   */
  const generateChart = useCallback(
    async (
      questionnaireId: string,
      chartType: 'radar' | 'bar' | 'pie' = 'radar',
      options?: {
        ageVariant?: 'kid' | 'teen' | 'adult';
        includeRecommendations?: boolean;
      }
    ): Promise<GeneratedChart | null> => {
      if (!generateChartFn) {
        setError('Service de charts non initialisé');
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await generateChartFn({
          questionnaireId,
          chartType,
          ...options,
        });

        if (result.data.success) {
          return {
            questionnaireId,
            patientId: result.data.patientId,
            chartType,
            ageVariant: result.data.ageVariant || 'adult',
            data: result.data.chartData,
            svg: result.data.svg,
            generatedAt: new Date(result.data.generatedAt),
          };
        } else {
          setError(result.data.error || 'Erreur de génération du graphique');
          return null;
        }
      } catch (err: any) {
        setError(`Erreur API: ${err.message || 'Échec de génération du graphique'}`);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [generateChartFn]
  );

  /**
   * Récupération des données dashboard complètes
   */
  const getPatientDashboard = useCallback(async (): Promise<PatientDashboardData | null> => {
    if (!getDashboardFn) {
      setError('Service dashboard non initialisé');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await getDashboardFn();

      if (result.data.success) {
        return {
          patient: {
            id: result.data.patient.id,
            email: result.data.patient.email,
            displayName: result.data.patient.displayName,
            age: result.data.patient.age,
            ageVariant: result.data.patient.ageVariant || 'adult',
          },
          questionnaires: result.data.questionnaires.map((q: any) => ({
            id: q.id,
            title: q.title,
            status: q.status,
            scores: q.scores
              ? {
                  ...q.scores,
                  calculatedAt: new Date(q.scores.calculatedAt),
                }
              : undefined,
          })),
          charts: result.data.charts.map((c: any) => ({
            ...c,
            generatedAt: new Date(c.generatedAt),
          })),
          lastUpdated: new Date(result.data.lastUpdated),
        };
      } else {
        setError(result.data.error || 'Erreur de récupération du dashboard');
        return null;
      }
    } catch (err: any) {
      setError(`Erreur API: ${err.message || 'Échec du dashboard'}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getDashboardFn]);

  return {
    // States
    loading,
    error,

    // Actions
    calculateScores,
    generateChart,
    getPatientDashboard,
  };
}

/**
 * Hook spécialisé pour les scores DNSM (rétrocompatibilité)
 */
export function useCentralizedDNSMScore(
  questionnaireId: string,
  responses: Record<string, number>
) {
  const { calculateScores, loading, error } = useCentralizedScoring();
  const [scores, setScores] = useState<CentralizedScores | null>(null);

  useEffect(() => {
    if (Object.keys(responses).length > 0) {
      calculateScores(questionnaireId, responses).then(setScores);
    }
  }, [questionnaireId, responses, calculateScores]);

  return {
    scores: scores?.scores || null,
    interpretations: scores?.interpretations || [],
    isComplete: scores?.isComplete || false,
    loading,
    error,
  };
}
