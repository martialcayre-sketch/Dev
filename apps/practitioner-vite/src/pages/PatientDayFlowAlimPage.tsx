import { DashboardShell } from '@/components/layout/DashboardShell';
import { firestore } from '@/lib/firebase';
import { downloadJSON, safeCopyToClipboard } from '@/lib/safeClipboard';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { Clipboard, Download, Radar } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar as RChartRadar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface DayFlowItem {
  id: string;
  createdAt?: any;
  updatedAt?: any;
  scores: { axes: Record<string, number>; total: number };
  radarInverted?: Record<string, number>;
  answers?: any;
  interpretation?: any;
}

export default function PatientDayFlowAlimPage() {
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<DayFlowItem[]>([]);
  const [selected, setSelected] = useState<DayFlowItem | null>(null);

  useEffect(() => {
    if (!id) return;
    const ref = collection(firestore, 'users', id, 'surveys', 'dayflow-alim');
    const q = query(ref, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as DayFlowItem[];
      setItems(data);
      setSelected((prev) => prev ?? data[0] ?? null);
    });
    return () => unsub();
  }, [id]);

  const data = useMemo(() => {
    const item = selected;
    if (!item) return [] as { axis: string; deficit: number }[];
    const axes = item.radarInverted || item.scores?.axes || {};
    return [
      { axis: 'AIA', deficit: axes.AIA ?? 0 },
      { axis: 'SER', deficit: axes.SER ?? 0 },
      { axis: 'DOP', deficit: axes.DOP ?? 0 },
      { axis: 'NEU', deficit: axes.NEU ?? 0 },
      { axis: 'CON', deficit: axes.CON ?? 0 },
    ];
  }, [selected]);

  async function handleCopyJSON() {
    if (!selected) return;
    const ok = await safeCopyToClipboard(JSON.stringify(selected, null, 2));
    if (!ok) downloadJSON(`dayflow-alim-${selected.id}.json`, selected);
  }

  function handleDownloadJSON() {
    if (!selected) return;
    downloadJSON(`dayflow-alim-${selected.id}.json`, selected);
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-nn-primary-500/20 p-2 text-nn-primary-200">
              <Radar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Surveys</p>
              <h1 className="text-2xl font-semibold text-white">DayFlow 360 — Alimentation</h1>
            </div>
          </div>
          {id && (
            <Link
              to={`/patients/${id}`}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-white hover:border-white/30 hover:bg-white/10"
            >
              Retour fiche patient
            </Link>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Liste */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/80">Historique</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyJSON}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-white hover:border-white/30 hover:bg-white/10"
                >
                  <Clipboard className="h-4 w-4" /> Copier JSON
                </button>
                <button
                  onClick={handleDownloadJSON}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-nn-primary-500 to-nn-accent-500 px-3 py-1.5 text-sm font-semibold text-white hover:from-nn-primary-400 hover:to-nn-accent-400"
                >
                  <Download className="h-4 w-4" /> Télécharger JSON
                </button>
              </div>
            </div>

            <div className="max-h-[420px] overflow-auto">
              <table className="min-w-full text-sm text-white/80">
                <thead className="sticky top-0 bg-white/5">
                  <tr>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-left">Total</th>
                    <th className="px-3 py-2 text-left">Axes</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => {
                    const sel = selected?.id === it.id;
                    const date = it.createdAt?.toDate ? it.createdAt.toDate().toLocaleString() : '';
                    const axes = it.scores?.axes || {};
                    return (
                      <tr
                        key={it.id}
                        onClick={() => setSelected(it)}
                        className={`cursor-pointer border-b border-white/10 hover:bg-white/5 ${
                          sel ? 'bg-white/10' : ''
                        }`}
                      >
                        <td className="px-3 py-2">{date}</td>
                        <td className="px-3 py-2 font-semibold">
                          {Math.round(it.scores?.total ?? 0)}
                        </td>
                        <td className="px-3 py-2 text-xs text-white/60">
                          AIA {axes.AIA ?? '-'} • SER {axes.SER ?? '-'} • DOP {axes.DOP ?? '-'} •
                          NEU {axes.NEU ?? '-'} • CON {axes.CON ?? '-'}
                        </td>
                      </tr>
                    );
                  })}
                  {items.length === 0 && (
                    <tr>
                      <td className="px-3 py-6 text-white/60" colSpan={3}>
                        Aucun résultat enregistré.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Radar */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="mb-3 text-sm font-semibold text-white/80">Radar des déficits</h3>
            <div className="h-72 w-full">
              {selected ? (
                <ResponsiveContainer>
                  <RadarChart data={data} outerRadius={110}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="axis" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tickCount={6} />
                    <Tooltip
                      formatter={(v: any) => `${v} / 100`}
                      labelFormatter={(l: string) => `Axe ${l}`}
                    />
                    <RChartRadar
                      name="Déficit"
                      dataKey="deficit"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.35}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-white/60">
                  Sélectionnez un résultat
                </div>
              )}
            </div>

            {selected?.interpretation?.summary && (
              <p className="mt-3 text-sm text-white/80">{selected.interpretation.summary}</p>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
