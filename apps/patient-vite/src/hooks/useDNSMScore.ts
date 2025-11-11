import { useMemo } from 'react';

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
 * Hook pour calculer les scores DNSM à partir des réponses
 * Échelle Likert 0-4 pour chaque question (10 questions par axe)
 * Score max par axe: 40, score total max: 160
 */
export function useDNSMScore(responses: Record<string, number>): {
  scores: DNSMScores;
  interpretations: DNSMInterpretation[];
  isComplete: boolean;
} {
  const { scores, isComplete } = useMemo(() => {
    // Calculer les scores bruts par axe
    const dopamineIds = Array.from({ length: 10 }, (_, i) => `da-${i + 1}`);
    const noradrenalineIds = Array.from({ length: 10 }, (_, i) => `na-${i + 1}`);
    const serotonineIds = Array.from({ length: 10 }, (_, i) => `se-${i + 1}`);
    const melatonineIds = Array.from({ length: 10 }, (_, i) => `me-${i + 1}`);

    const dopamine = dopamineIds.reduce((sum, id) => sum + (responses[id] || 0), 0);
    const noradrenaline = noradrenalineIds.reduce((sum, id) => sum + (responses[id] || 0), 0);
    const serotonine = serotonineIds.reduce((sum, id) => sum + (responses[id] || 0), 0);
    const melatonine = melatonineIds.reduce((sum, id) => sum + (responses[id] || 0), 0);

    const total = dopamine + noradrenaline + serotonine + melatonine;

    // Vérifier si toutes les 40 questions sont répondues
    const allIds = [...dopamineIds, ...noradrenalineIds, ...serotonineIds, ...melatonineIds];
    const isComplete = allIds.every((id) => responses[id] !== undefined && responses[id] !== null);

    // Normalisation en pourcentage (score/40 * 100)
    const dopaminePercent = Math.round((dopamine / 40) * 100);
    const noradrenalinePercent = Math.round((noradrenaline / 40) * 100);
    const serotoninePercent = Math.round((serotonine / 40) * 100);
    const melatoninePercent = Math.round((melatonine / 40) * 100);
    const globalPercent = Math.round((total / 160) * 100);

    return {
      scores: {
        dopamine,
        noradrenaline,
        serotonine,
        melatonine,
        total,
        dopaminePercent,
        noradrenalinePercent,
        serotoninePercent,
        melatoninePercent,
        globalPercent,
      },
      isComplete,
    };
  }, [responses]);

  const interpretations = useMemo((): DNSMInterpretation[] => {
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

    return [
      getInterpretation('dopamine', scores.dopamine, scores.dopaminePercent),
      getInterpretation('noradrenaline', scores.noradrenaline, scores.noradrenalinePercent),
      getInterpretation('serotonine', scores.serotonine, scores.serotoninePercent),
      getInterpretation('melatonine', scores.melatonine, scores.melatoninePercent),
    ];
  }, [scores]);

  return { scores, interpretations, isComplete };
}
