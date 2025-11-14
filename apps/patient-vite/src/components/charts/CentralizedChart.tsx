/**
 * 🧠 NeuroNutrition - Composant Chart centralisé
 *
 * Utilise les APIs backend pour générer des graphiques
 * adaptatifs selon l'âge du patient.
 */

import { useCentralizedScoring } from '@/hooks/useCentralizedScoringSimple';
import { useEffect, useState } from 'react';

interface CentralizedChartProps {
  questionnaireId: string;
  chartType?: 'radar' | 'bar' | 'pie';
  className?: string;
}

export function CentralizedChart({
  questionnaireId,
  chartType = 'radar',
  className = '',
}: CentralizedChartProps) {
  const { generateChart, loading, error } = useCentralizedScoring();
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    generateChart(questionnaireId, chartType).then(setChartData);
  }, [questionnaireId, chartType, generateChart]);

  if (loading) {
    return (
      <div className={`rounded-2xl border border-white/10 bg-white/5 p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nn-primary-500"></div>
          <span className="ml-3 text-white/60">Génération du graphique...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 ${className}`}>
        <p className="text-rose-200 text-center">⚠️ Erreur: {error}</p>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className={`rounded-2xl border border-white/10 bg-white/5 p-6 ${className}`}>
        <p className="text-white/60 text-center">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">
          Graphique {chartType === 'radar' ? 'Radar' : chartType === 'bar' ? 'Barres' : 'Secteurs'}
        </h3>
        {chartData.ageVariant && (
          <p className="text-sm text-white/60">
            Adapté pour:{' '}
            {chartData.ageVariant === 'kid'
              ? 'Enfant'
              : chartData.ageVariant === 'teen'
              ? 'Adolescent'
              : 'Adulte'}
          </p>
        )}
      </div>

      {/* Rendu du graphique */}
      {chartData.svg ? (
        <div className="chart-container" dangerouslySetInnerHTML={{ __html: chartData.svg }} />
      ) : (
        <div className="h-64 bg-slate-800/50 rounded-lg flex items-center justify-center">
          <p className="text-white/60">Graphique généré par l'API backend</p>
        </div>
      )}

      {/* Métadonnées */}
      {chartData.generatedAt && (
        <p className="mt-4 text-xs text-white/40">
          Généré le {new Date(chartData.generatedAt).toLocaleString('fr-FR')}
        </p>
      )}
    </div>
  );
}

export default CentralizedChart;
