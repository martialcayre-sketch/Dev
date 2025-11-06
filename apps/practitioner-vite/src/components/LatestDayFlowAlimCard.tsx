import { firestore } from '@/lib/firebase';
import { collection, getDocs, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
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

type Item = {
  id: string;
  createdAt?: any;
  scores?: { axes: Record<string, number>; total: number };
  radarInverted?: Record<string, number>;
  interpretation?: { summary?: string };
};

export default function LatestDayFlowAlimCard({ uid }: { uid: string }) {
  const [item, setItem] = useState<Item | null>(null);

  useEffect(() => {
    if (!uid) return;
    const ref = collection(firestore, 'users', uid, 'surveys', 'dayflow-alim');
    // Chargement initial
    getDocs(query(ref, orderBy('createdAt', 'desc'), limit(1))).then((snap) => {
      const first = snap.docs[0];
      setItem(first ? ({ id: first.id, ...(first.data() as any) } as Item) : null);
    });
    // Écoute temps réel
    const unsub = onSnapshot(query(ref, orderBy('createdAt', 'desc')), (snap) => {
      const first = snap.docs[0];
      setItem(first ? ({ id: first.id, ...(first.data() as any) } as Item) : null);
    });
    return () => unsub();
  }, [uid]);

  const data = useMemo(() => {
    if (!item) return [] as { axis: string; deficit: number }[];
    const axes = (item.radarInverted as any) || item.scores?.axes || {};
    return [
      { axis: 'AIA', deficit: axes.AIA ?? 0 },
      { axis: 'SER', deficit: axes.SER ?? 0 },
      { axis: 'DOP', deficit: axes.DOP ?? 0 },
      { axis: 'NEU', deficit: axes.NEU ?? 0 },
      { axis: 'CON', deficit: axes.CON ?? 0 },
    ];
  }, [item]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/80">Dernier DayFlow – Alimentation</h3>
        {item?.createdAt && (
          <span className="text-xs text-white/60">{formatTimestamp(item.createdAt)}</span>
        )}
      </div>

      {item ? (
        <div className="h-60 w-full">
          <ResponsiveContainer>
            <RadarChart data={data} outerRadius={90}>
              <PolarGrid />
              <PolarAngleAxis dataKey="axis" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tickCount={6} />
              <Tooltip
                formatter={(v: any) => `${v} / 100`}
                labelFormatter={(l: string) => `Axe ${l}`}
              />
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
        <div className="text-sm text-white/60">Aucun résultat enregistré pour le moment.</div>
      )}

      {item?.interpretation?.summary && (
        <p className="mt-3 text-sm text-white/80">{item.interpretation.summary}</p>
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
