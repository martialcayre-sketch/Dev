/**
 * 🧠 NeuroNutrition - Composant DNSM Radar centralisé
 *
 * Remplace l'ancien DNSMRadar par une version utilisant
 * les APIs backend pour le calcul et la génération.
 */

import { useCentralizedScoring } from '@/hooks/useCentralizedScoringSimple';
import type { DNSMScores } from '@/hooks/useDNSMScore';
import { useEffect, useState } from 'react';

interface CentralizedDNSMRadarProps {
  questionnaireId: string;
  responses: Record<string, number>;
  fallbackScores?: DNSMScores; // Scores calculés côté client comme fallback
  className?: string;
}

export function CentralizedDNSMRadar({
  questionnaireId,
  responses,
  fallbackScores,
  className = '',
}: CentralizedDNSMRadarProps) {
  const { calculateScores, generateChart, loading, error } = useCentralizedScoring();
  const [backendScores, setBackendScores] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const loadBackendData = async () => {
      if (Object.keys(responses).length >= 40) {
        // DNSM complet
        try {
          // Calculer les scores via l'API
          const scores = await calculateScores(questionnaireId, responses);
          setBackendScores(scores);

          // Générer le graphique radar
          if (scores) {
            const chart = await generateChart(questionnaireId, 'radar');
            setChartData(chart);
          }
        } catch (err) {
          console.error('Erreur backend DNSM:', err);
        }
      }
    };

    loadBackendData();
  }, [questionnaireId, responses, calculateScores, generateChart]);

  // Utiliser les données backend si disponibles, sinon fallback
  const displayScores = backendScores?.scores || fallbackScores;
  const displayInterpretations = backendScores?.interpretations || [];

  if (!displayScores) {
    return (
      <div className={`rounded-2xl border border-white/10 bg-white/5 p-6 ${className}`}>
        <p className="text-white/60 text-center">
          Répondez à toutes les questions pour voir le radar
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 p-6 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Profil Neurotransmetteurs</h3>
        {loading && (
          <div className="flex items-center gap-2 text-white/60">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-nn-primary-500"></div>
            <span className="text-xs">Calcul backend...</span>
          </div>
        )}
        {backendScores && !loading && (
          <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
            ✓ Centralisé
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg">
          <p className="text-amber-300 text-sm">⚠️ Calcul backend indisponible: {error}</p>
          <p className="text-amber-200/60 text-xs mt-1">Utilisation du fallback client-side</p>
        </div>
      )}

      {/* Graphique radar */}
      {chartData?.svg ? (
        <div className="mb-6">
          <div
            className="radar-chart-container"
            dangerouslySetInnerHTML={{ __html: chartData.svg }}
          />
        </div>
      ) : (
        <div className="mb-6 h-64 bg-slate-800/50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="w-32 h-32 border-2 border-dashed border-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white/40">Radar</span>
            </div>
            <p className="text-white/60 text-sm">
              {loading ? 'Génération du radar...' : 'Radar généré par le backend'}
            </p>
          </div>
        </div>
      )}

      {/* Scores détaillés */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-white/70 text-sm">Dopamine</span>
            <span className="text-white font-medium">{displayScores.dopaminePercent}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70 text-sm">Noradrénaline</span>
            <span className="text-white font-medium">{displayScores.noradrenalinePercent}%</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-white/70 text-sm">Sérotonine</span>
            <span className="text-white font-medium">{displayScores.serotoninePercent}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70 text-sm">Mélatonine</span>
            <span className="text-white font-medium">{displayScores.melatoninePercent}%</span>
          </div>
        </div>
      </div>

      {/* Score global */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex justify-between">
          <span className="text-white font-medium">Score global</span>
          <span className="text-nn-primary-300 font-bold">{displayScores.globalPercent}%</span>
        </div>
      </div>

      {/* Recommandations backend */}
      {displayInterpretations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <h4 className="text-sm font-semibold text-white mb-2">Interprétations</h4>
          <div className="space-y-2">
            {displayInterpretations.map((interp: any) => (
              <div key={interp.axis} className="text-xs">
                <span className="text-white/70 capitalize">{interp.axis}:</span>
                <span
                  className={`ml-2 ${
                    interp.status === 'normal'
                      ? 'text-emerald-300'
                      : interp.status === 'probable'
                      ? 'text-amber-300'
                      : 'text-rose-300'
                  }`}
                >
                  {interp.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CentralizedDNSMRadar;
