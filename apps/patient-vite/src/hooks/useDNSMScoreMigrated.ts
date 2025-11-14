/**
 * 🧠 NeuroNutrition - Hook migré vers scoring centralisé
 *
 * DEPRECATED: Ce hook utilise maintenant les APIs backend centralisées
 * au lieu du calcul client-side pour une meilleure sécurité.
 */

import { useEffect, useState } from 'react';
import { useCentralizedScoring, type CentralizedScores } from './useCentralizedScoringSimple';

export interface DNSMScores {
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
}

export interface DNSMInterpretation {
  axis: 'dopamine' | 'noradrenaline' | 'serotonine' | 'melatonine';
  score: number;
  percent: number;
  status: 'normal' | 'probable' | 'marquee';
  label: string;
  color: string;
}

/**
 * Hook DNSM migré vers scoring centralisé backend
 * @deprecated Utilisera les APIs centralisées dans le futur
 */
export function useDNSMScoreCentralized(responses: Record<string, number>): {
  scores: DNSMScores | null;
  interpretations: DNSMInterpretation[];
  isComplete: boolean;
  loading: boolean;
} {
  const { calculateScores, loading } = useCentralizedScoring();
  const [centralizedResult, setCentralizedResult] = useState<CentralizedScores | null>(null);

  // Calcul client-side en parallèle (fallback)
  const clientSideResult = useDNSMScoreClientSide(responses);

  useEffect(() => {
    if (Object.keys(responses).length >= 40) {
      // DNSM complet
      calculateScores('dnsm', responses).then((result) => {
        setCentralizedResult(result);
      });
    }
  }, [responses, calculateScores]);

  // Utiliser le résultat centralisé si disponible, sinon fallback
  if (centralizedResult) {
    return {
      scores: centralizedResult.scores,
      interpretations: centralizedResult.interpretations.map((interp) => ({
        axis: interp.axis,
        score: interp.score,
        percent: interp.percent,
        status: interp.status,
        label: interp.label,
        color: interp.color,
      })),
      isComplete: centralizedResult.isComplete,
      loading,
    };
  }

  return clientSideResult;
}

/**
 * Hook pour calculer les scores DNSM côté client (TEMPORAIRE)
 * @deprecated À remplacer par le backend centralisé
 */
function useDNSMScoreClientSide(responses: Record<string, number>): {
  scores: DNSMScores | null;
  interpretations: DNSMInterpretation[];
  isComplete: boolean;
  loading: boolean;
} {
  // Calcul client-side temporaire (logique existante)
  const dopamineIds = Array.from({ length: 10 }, (_, i) => `da-${i + 1}`);
  const noradrenalineIds = Array.from({ length: 10 }, (_, i) => `na-${i + 1}`);
  const serotonineIds = Array.from({ length: 10 }, (_, i) => `se-${i + 1}`);
  const melatonineIds = Array.from({ length: 10 }, (_, i) => `me-${i + 1}`);

  const dopamine = dopamineIds.reduce((sum, id) => sum + (responses[id] || 0), 0);
  const noradrenaline = noradrenalineIds.reduce((sum, id) => sum + (responses[id] || 0), 0);
  const serotonine = serotonineIds.reduce((sum, id) => sum + (responses[id] || 0), 0);
  const melatonine = melatonineIds.reduce((sum, id) => sum + (responses[id] || 0), 0);

  const total = dopamine + noradrenaline + serotonine + melatonine;
  const allIds = [...dopamineIds, ...noradrenalineIds, ...serotonineIds, ...melatonineIds];
  const isComplete = allIds.every((id) => responses[id] !== undefined && responses[id] !== null);

  const scores: DNSMScores = {
    dopamine,
    noradrenaline,
    serotonine,
    melatonine,
    total,
    dopaminePercent: Math.round((dopamine / 40) * 100),
    noradrenalinePercent: Math.round((noradrenaline / 40) * 100),
    serotoninePercent: Math.round((serotonine / 40) * 100),
    melatoninePercent: Math.round((melatonine / 40) * 100),
    globalPercent: Math.round((total / 160) * 100),
  };

  const getInterpretation = (
    axis: 'dopamine' | 'noradrenaline' | 'serotonine' | 'melatonine',
    score: number,
    percent: number
  ): DNSMInterpretation => {
    let status: 'normal' | 'probable' | 'marquee';
    let label: string;
    let color: string;

    if (score <= 10) {
      status = 'normal';
      label = 'Fonctionnement normal';
      color = 'emerald';
    } else if (score <= 19) {
      status = 'probable';
      label = 'Dysfonction probable';
      color = 'amber';
    } else {
      status = 'marquee';
      label = 'Dysfonction marquée';
      color = 'rose';
    }

    return { axis, score, percent, status, label, color };
  };

  const interpretations: DNSMInterpretation[] = [
    getInterpretation('dopamine', scores.dopamine, scores.dopaminePercent),
    getInterpretation('noradrenaline', scores.noradrenaline, scores.noradrenalinePercent),
    getInterpretation('serotonine', scores.serotonine, scores.serotoninePercent),
    getInterpretation('melatonine', scores.melatonine, scores.melatoninePercent),
  ];

  return { scores, interpretations, isComplete, loading: false };
}

// Export par défaut pour rétrocompatibilité
export const useDNSMScore = useDNSMScoreClientSide;
