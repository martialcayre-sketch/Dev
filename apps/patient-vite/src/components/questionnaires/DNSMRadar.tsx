import type { DNSMScores } from '@/hooks/useDNSMScore';

interface DNSMRadarProps {
  scores: DNSMScores;
}

/**
 * Composant radar DNSM avec affichage des 4 neurotransmetteurs
 * Version sans Recharts (utilise SVG natif + gradients CSS)
 */
export default function DNSMRadar({ scores }: DNSMRadarProps) {
  const axes = [
    { label: 'Dopamine', value: scores.dopaminePercent, angle: 0 },
    { label: 'Noradrénaline', value: scores.noradrenalinePercent, angle: 90 },
    { label: 'Sérotonine', value: scores.serotoninePercent, angle: 180 },
    { label: 'Mélatonine', value: scores.melatoninePercent, angle: 270 },
  ];

  const center = 150;
  const maxRadius = 120;
  const levels = 5;

  // Calculer les coordonnées polaires
  const polarToCartesian = (angle: number, radius: number) => {
    const angleRad = ((angle - 90) * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(angleRad),
      y: center + radius * Math.sin(angleRad),
    };
  };

  // Générer les points du polygone de données
  const dataPoints = axes
    .map((axis) => {
      const radius = (axis.value / 100) * maxRadius;
      const point = polarToCartesian(axis.angle, radius);
      return `${point.x},${point.y}`;
    })
    .join(' ');

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Profil DNSM</h3>

      <div className="relative">
        <svg width="300" height="300" viewBox="0 0 300 300" className="mx-auto">
          {/* Grille de fond (cercles concentriques) */}
          {Array.from({ length: levels }).map((_, i) => (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={((i + 1) / levels) * maxRadius}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          ))}

          {/* Axes */}
          {axes.map((axis) => {
            const end = polarToCartesian(axis.angle, maxRadius);
            return (
              <line
                key={axis.label}
                x1={center}
                y1={center}
                x2={end.x}
                y2={end.y}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
              />
            );
          })}

          {/* Polygone de données */}
          <polygon
            points={dataPoints}
            fill="rgba(79, 70, 229, 0.3)"
            stroke="rgb(79, 70, 229)"
            strokeWidth="2"
          />

          {/* Points de données */}
          {axes.map((axis) => {
            const radius = (axis.value / 100) * maxRadius;
            const point = polarToCartesian(axis.angle, radius);
            return (
              <circle
                key={`point-${axis.label}`}
                cx={point.x}
                cy={point.y}
                r="4"
                fill="rgb(79, 70, 229)"
                stroke="white"
                strokeWidth="2"
              />
            );
          })}

          {/* Labels */}
          {axes.map((axis) => {
            const labelPos = polarToCartesian(axis.angle, maxRadius + 30);
            return (
              <text
                key={`label-${axis.label}`}
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-white/90 text-xs font-medium"
              >
                {axis.label}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Légende des scores */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {axes.map((axis) => (
          <div
            key={`score-${axis.label}`}
            className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 border border-white/10"
          >
            <span className="text-sm text-white/70">{axis.label}</span>
            <span className="text-sm font-semibold text-nn-primary-400">{axis.value}%</span>
          </div>
        ))}
      </div>

      {/* Score global */}
      <div className="mt-4 rounded-xl bg-nn-primary-500/10 border border-nn-primary-500/30 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">Score global DNSM</span>
          <span className="text-lg font-bold text-nn-primary-400">{scores.globalPercent}%</span>
        </div>
      </div>
    </div>
  );
}
