import { useMemo, useState } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { submitDayFlow } from './submit';
import type { Choice, DayFlowAnswers, DayFlowAxis, DayFlowPayload, SceneKey } from './types';
import { useExportJSON } from './useExportJSON';

const AXES: DayFlowAxis[] = ['AIA', 'SER', 'DOP', 'NEU', 'CON'];
const AXIS_LABEL: Record<DayFlowAxis, string> = {
  AIA: 'Anti‑inflammatoire/antioxydant',
  SER: 'Sérotonine',
  DOP: 'Dopamine',
  NEU: 'Neurovasculaire',
  CON: 'Conscience/Environnement',
};

const SCENES: { key: SceneKey; label: string }[] = [
  { key: 'matin', label: 'Matin' },
  { key: 'midi', label: 'Midi' },
  { key: 'apresmidi', label: 'Après‑midi' },
  { key: 'soir', label: 'Soir' },
  { key: 'global', label: 'Style global' },
];

type AnswersState = Partial<Record<SceneKey, Partial<Record<DayFlowAxis, Choice>>>>;

function choiceToScore(c?: Choice) {
  if (c === 2) return 100;
  if (c === 1) return 50;
  if (c === 0) return 0;
  return undefined;
}

export default function DayFlowAlimForm(props: {
  onSubmitted?: (res: { id: string; payload: DayFlowPayload }) => void;
}) {
  const { onSubmitted } = props;
  const [active, setActive] = useState<SceneKey>('matin');
  const [answers, setAnswers] = useState<AnswersState>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { runDefault } = useExportJSON('copy');

  const filled = useMemo(() => {
    // true if every scene has all 5 axes answered
    return SCENES.every((s) => AXES.every((a) => answers[s.key]?.[a] !== undefined));
  }, [answers]);

  const scores = useMemo(() => {
    // Moyenne par axe des 5 scènes, normalisée 0..100
    const perAxis: Record<DayFlowAxis, number> = {
      AIA: 0,
      SER: 0,
      DOP: 0,
      NEU: 0,
      CON: 0,
    };
    AXES.forEach((axis) => {
      let sum = 0;
      let n = 0;
      SCENES.forEach((s) => {
        const sc = choiceToScore(answers[s.key]?.[axis] as Choice | undefined);
        if (typeof sc === 'number') {
          sum += sc;
          n += 1;
        }
      });
      perAxis[axis] = n ? Math.round(sum / n) : 0;
    });
    const total = Math.round(AXES.reduce((acc, a) => acc + perAxis[a], 0) / AXES.length);
    return { axes: perAxis, total };
  }, [answers]);

  const radarData = useMemo(
    () => [
      { axis: 'AIA', deficit: 100 - scores.axes.AIA },
      { axis: 'SER', deficit: 100 - scores.axes.SER },
      { axis: 'DOP', deficit: 100 - scores.axes.DOP },
      { axis: 'NEU', deficit: 100 - scores.axes.NEU },
      { axis: 'CON', deficit: 100 - scores.axes.CON },
    ],
    [scores]
  );

  function setValue(scene: SceneKey, axis: DayFlowAxis, value: Choice) {
    setAnswers((prev) => ({
      ...prev,
      [scene]: { ...(prev[scene] || {}), [axis]: value },
    }));
  }

  function buildPayload(): DayFlowPayload {
    // Compléter les scènes pour respecter le contrat DayFlowAnswers
    const fullAnswers: DayFlowAnswers = {
      matin: {
        AIA: (answers.matin?.AIA ?? 1) as Choice,
        SER: (answers.matin?.SER ?? 1) as Choice,
        DOP: (answers.matin?.DOP ?? 1) as Choice,
        NEU: (answers.matin?.NEU ?? 1) as Choice,
        CON: (answers.matin?.CON ?? 1) as Choice,
      },
      midi: {
        AIA: (answers.midi?.AIA ?? 1) as Choice,
        SER: (answers.midi?.SER ?? 1) as Choice,
        DOP: (answers.midi?.DOP ?? 1) as Choice,
        NEU: (answers.midi?.NEU ?? 1) as Choice,
        CON: (answers.midi?.CON ?? 1) as Choice,
      },
      apresmidi: {
        AIA: (answers.apresmidi?.AIA ?? 1) as Choice,
        SER: (answers.apresmidi?.SER ?? 1) as Choice,
        DOP: (answers.apresmidi?.DOP ?? 1) as Choice,
        NEU: (answers.apresmidi?.NEU ?? 1) as Choice,
        CON: (answers.apresmidi?.CON ?? 1) as Choice,
      },
      soir: {
        AIA: (answers.soir?.AIA ?? 1) as Choice,
        SER: (answers.soir?.SER ?? 1) as Choice,
        DOP: (answers.soir?.DOP ?? 1) as Choice,
        NEU: (answers.soir?.NEU ?? 1) as Choice,
        CON: (answers.soir?.CON ?? 1) as Choice,
      },
      global: {
        AIA: (answers.global?.AIA ?? 1) as Choice,
        SER: (answers.global?.SER ?? 1) as Choice,
        DOP: (answers.global?.DOP ?? 1) as Choice,
        NEU: (answers.global?.NEU ?? 1) as Choice,
        CON: (answers.global?.CON ?? 1) as Choice,
      },
    };

    return {
      version: '1.0',
      answers: fullAnswers,
      scores,
      meta: {
        device: typeof navigator !== 'undefined' ? navigator.platform : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        locale: typeof navigator !== 'undefined' ? navigator.language : undefined,
        context: 'patient',
      },
    };
  }

  async function handleSubmit() {
    try {
      setSubmitting(true);
      setError(null);
      if (!filled) {
        setError('Merci de compléter toutes les scènes et axes.');
        return;
      }
      const base = buildPayload();
      const res = await submitDayFlow(base);
      onSubmitted?.(res);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleExport() {
    const payload = buildPayload();
    await runDefault('dayflow-alimentation.json', payload);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap gap-2">
          {SCENES.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setActive(s.key)}
              className={
                'px-3 py-1.5 rounded-lg text-sm border ' +
                (active === s.key
                  ? 'bg-nn-primary-500 text-white border-nn-primary-400'
                  : 'bg-slate-900 text-white/80 border-white/10 hover:bg-white/10')
              }
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="mb-3 text-sm font-semibold text-white/90">
            Choix par axe – {SCENES.find((s) => s.key === active)?.label}
          </h3>
          <div className="space-y-3">
            {AXES.map((axis) => {
              const v = answers[active]?.[axis];
              return (
                <div
                  key={axis}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-900 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{AXIS_LABEL[axis]}</p>
                    <p className="text-xs text-white/50">Axe {axis}</p>
                  </div>
                  <div className="shrink-0">
                    <div className="inline-flex overflow-hidden rounded-md border border-white/10">
                      {[0, 1, 2].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setValue(active, axis, c as Choice)}
                          className={
                            'px-3 py-1.5 text-sm ' +
                            (v === c
                              ? 'bg-nn-primary-500 text-white'
                              : 'bg-slate-800 text-white/80 hover:bg-slate-700')
                          }
                          aria-pressed={v === c}
                        >
                          {c === 0 ? 'Faible' : c === 1 ? 'Moyen' : 'Optimal'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/90">Radar des déficits</h3>
            <span className="text-xs text-white/60">Score global: {scores.total} / 100</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <RadarChart data={radarData} outerRadius={90}>
                <PolarGrid />
                <PolarAngleAxis dataKey="axis" stroke="#CBD5E1" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tickCount={6} stroke="#CBD5E1" />
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
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-nn-primary-500 px-4 py-2 text-white disabled:opacity-50"
        >
          {submitting ? 'Envoi…' : 'Valider et enregistrer'}
        </button>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-white/90 hover:bg-white/10"
        >
          Copier/Exporter JSON
        </button>
      </div>
    </div>
  );
}
