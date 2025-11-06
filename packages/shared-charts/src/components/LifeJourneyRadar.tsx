import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Tooltip as RadarTooltip,
  ResponsiveContainer,
} from 'recharts';
import type { LifeJourneyData } from '../types';

const SPHERE_LABELS: Record<string, string> = {
  sommeil: 'Sommeil',
  rythme: 'Rythme biologique',
  stress: 'Stress',
  activite: 'Activité physique',
  toxiques: 'Toxiques',
  relations: 'Relations sociales',
  alimentation: 'Alimentation',
};

type LifeJourneyRadarProps = {
  data: LifeJourneyData;
};

export function LifeJourneyRadar({ data }: LifeJourneyRadarProps) {
  const radarData = Object.entries(data.scores).map(([key, value]) => ({
    axis: SPHERE_LABELS[key] || key,
    score: value.percent,
  }));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Mode de vie – 7 Sphères</h2>
          <p className="text-sm text-white/60">
            Score global: {data.global}/100 •{' '}
            {new Date(data.completedAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer>
          <RadarChart data={radarData} outerRadius={110}>
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
              stroke="#475569"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
            />
            <RadarTooltip
              formatter={(v: any) => [`${v}/100`, 'Score']}
              labelFormatter={(l: string) => `${l}`}
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.5rem',
                color: '#fff',
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

      {/* Détails par sphère */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {Object.entries(data.scores).map(([key, value]) => (
          <div key={key} className="rounded-lg border border-white/10 bg-slate-900/50 p-3">
            <p className="text-xs font-medium text-white/60">{SPHERE_LABELS[key] || key}</p>
            <p className="mt-1 text-lg font-bold text-white">
              {value.raw}/{value.max}
              <span className="ml-2 text-sm font-normal text-white/60">({value.percent}%)</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
