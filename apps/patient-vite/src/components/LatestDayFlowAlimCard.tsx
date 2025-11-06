import { listDayFlowSurveys, watchDayFlowSurveys } from '@/features/dayflow-alim/persistence';
import type { DayFlowPayload } from '@/features/dayflow-alim/types';
import { auth } from '@/lib/firebase';
import { useEffect, useMemo, useState } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

/**
 * Tuile tableau de bord: affiche le dernier résultat DayFlow – Alimentation (radar des déficits)
 * Dépendance: recharts
 */
export default function LatestDayFlowAlimCard() {
  const [item, setItem] = useState<DayFlowPayload | null>(null);

  useEffect(() => {
    const u = auth.currentUser;
    if (!u) return;
    // Chargement initial rapide
    listDayFlowSurveys(u.uid, { limit: 1 }).then((items) => setItem(items[0] || null));
    // Écoute temps réel
    const unsub = watchDayFlowSurveys(u.uid, (items) => setItem(items[0] || null), {
      liveOnly: true,
    });
    return () => unsub();
  }, []);

  const data = useMemo(() => {
    if (!item) return [] as { axis: string; deficit: number }[];
    const axes = item.radarInverted || item.scores.axes; // fallback si pas d'inversion
    return [
      { axis: 'AIA', deficit: axes.AIA },
      { axis: 'SER', deficit: axes.SER },
      { axis: 'DOP', deficit: axes.DOP },
      { axis: 'NEU', deficit: axes.NEU },
      { axis: 'CON', deficit: axes.CON },
    ];
  }, [item]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          DayFlow 360 – Alimentation (radar des déficits)
        </h3>
        {item?.createdAt && (
          <span className="text-xs text-gray-500">{formatTimestamp(item.createdAt)}</span>
        )}
      </div>

      {item ? (
        <div className="h-60 w-full">
          <ResponsiveContainer>
            <RadarChart data={data} outerRadius={90}>
              <PolarGrid />
              <PolarAngleAxis dataKey="axis" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tickCount={6} />
              <Tooltip formatter={(v: any) => `${v} / 100`} labelFormatter={(l) => `Axe ${l}`} />
              <Radar
                name="Déficit"
                dataKey="deficit"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.35}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-sm text-gray-500">Aucun résultat enregistré pour le moment.</div>
      )}

      {item?.interpretation?.summary && (
        <p className="mt-3 text-sm text-gray-700">{item.interpretation.summary}</p>
      )}
    </div>
  );
}

function formatTimestamp(ts: any) {
  try {
    if (ts?.toDate) return ts.toDate().toLocaleString();
    return new Date(ts?.seconds ? ts.seconds * 1000 : ts).toLocaleString();
  } catch {
    return '';
  }
}
