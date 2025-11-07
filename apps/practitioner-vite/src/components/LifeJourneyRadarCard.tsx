import { firestore } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Tooltip as RadarTooltip,
  ResponsiveContainer,
} from 'recharts';

type SphereKey =
  | 'sommeil'
  | 'rythme'
  | 'stress'
  | 'activite'
  | 'toxiques'
  | 'relations'
  | 'alimentation';

type LifeJourneyData = {
  scores: Record<SphereKey, { raw: number; max: number; percent: number }>;
  global: number;
  completedAt: string;
};

const SPHERE_LABELS: Record<SphereKey, string> = {
  sommeil: 'Sommeil',
  rythme: 'Rythme biologique',
  stress: 'Stress',
  activite: 'Activité physique',
  toxiques: 'Exposition toxiques',
  relations: 'Relations',
  alimentation: 'Alimentation',
};

export default function LifeJourneyRadarCard({ patientId }: { patientId: string }) {
  const [data, setData] = useState<LifeJourneyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Lire le dernier life journey depuis patients/{uid}/lifejourney
        const ljQuery = query(
          collection(firestore, 'patients', patientId, 'lifejourney'),
          orderBy('submittedAt', 'desc')
        );
        const ljSnap = await getDocs(ljQuery);

        if (!ljSnap.empty) {
          const ljData = ljSnap.docs[0].data() as LifeJourneyData;
          setData(ljData);
        }
      } catch (err) {
        console.warn('[LifeJourneyRadar] Failed to load:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [patientId]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-nn-primary-500" />
          <span className="text-sm text-white/60">Chargement Life Journey...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return null; // Pas de données, ne pas afficher
  }

  const radarData = Object.entries(SPHERE_LABELS).map(([key, label]) => ({
    axis: label,
    score: data.scores[key as SphereKey]?.percent || 0,
  }));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Mode de vie – 7 Sphères Vitales</h3>
          <p className="text-sm text-white/60">
            Score global: {data.global}/100 •{' '}
            {new Date(data.completedAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer>
          <RadarChart data={radarData} outerRadius={120}>
            <PolarGrid stroke="#475569" />
            <PolarAngleAxis
              dataKey="axis"
              stroke="#CBD5E1"
              tick={{ fill: '#CBD5E1', fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tickCount={6}
              stroke="#CBD5E1"
              tick={{ fill: '#94A3B8', fontSize: 10 }}
            />
            <RadarTooltip
              formatter={(v: any) => [`${v}/100`, 'Score']}
              labelFormatter={(l) => `${l}`}
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#e2e8f0',
              }}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.35}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        {Object.entries(data.scores).map(([key, score]) => (
          <div key={key} className="rounded-lg border border-white/10 bg-slate-900/50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-white/90">{SPHERE_LABELS[key as SphereKey]}</span>
              <span className="font-semibold text-emerald-400">
                {score.raw}/{score.max}
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded bg-white/10">
              <div className="h-1.5 bg-emerald-400" style={{ width: `${score.percent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
