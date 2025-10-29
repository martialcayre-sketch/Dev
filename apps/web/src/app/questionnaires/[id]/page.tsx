"use client";
export const dynamic = 'force-dynamic'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import RequireAuth from '@/src/components/RequireAuth'
import catalog from '@/src/data/questionnaires.catalog.json'
import { addIntake, setProfileBadge } from '@/src/lib/firestore'
import { auth } from '@/src/lib/firebase'

type QField =
  | { type: 'radio'; id: string; label: string; options: { value: string; label: string }[] }
  | { type: 'likert'; id: string; label: string; min: number; max: number; left?: string; right?: string }
  | { type: 'multi'; id: string; label: string; options: { value: string; label: string }[] }
  | { type: 'text'; id: string; label: string; placeholder?: string }

type QSchema = { id: string; title: string; fields: QField[]; score?: (payload: Record<string, any>) => Record<string, number> }

// Import detailed schemas/scores when available
import { schema as schemaContextuel } from '@/src/questionnaires/questionnaire-contextuel-mode-de-vie/schema'
import { score as scoreContextuel } from '@/src/questionnaires/questionnaire-contextuel-mode-de-vie/score'
import { schema as schemaSIIN } from '@/src/questionnaires/questionnaire-dactivite-et-de-depense-energetique-globale-siin/schema'
import { score as scoreSIIN } from '@/src/questionnaires/questionnaire-dactivite-et-de-depense-energetique-globale-siin/score'
import { schema as schemaPlaintes } from '@/src/questionnaires/mes-plaintes-actuelles-et-troubles-ressentis/schema'
import { score as scorePlaintes } from '@/src/questionnaires/mes-plaintes-actuelles-et-troubles-ressentis/score'

// Registry for known schemas (placeholders for 3 questionnaires Mode de vie)
function registry(id: string): QSchema | null {
  if (id === 'questionnaire-contextuel-mode-de-vie') return { ...schemaContextuel, score: scoreContextuel as any }
  if (id === 'questionnaire-dactivite-et-de-depense-energetique-globale-siin' || id === 'questionnaire-dactivite-et-de-depense-energetique-globale-siin-def-pro') return { ...schemaSIIN, id, score: scoreSIIN as any }
  if (id === 'mes-plaintes-actuelles-et-troubles-ressentis') return { ...schemaPlaintes, score: scorePlaintes as any }
  // Tentative d'import dynamique pour tous les autres questionnaires
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const s = require(`@/src/questionnaires/${id}/schema`)
    let scorer: any = undefined
    try { scorer = require(`@/src/questionnaires/${id}/score`) } catch {}
    return { ...(s.schema || s.default || {}), score: scorer?.score }
  } catch {
    return null
  }
}

function Section({ schema }: { schema: QSchema }) {
  const [payload, setPayload] = useState<Record<string, any>>({})
  const [done, setDone] = useState<string | null>(null)
  const [score, setScore] = useState<Record<string, number> | null>(null)
  const setVal = (id: string, v: any) => setPayload(prev => ({ ...prev, [id]: v }))

  const submit = async () => {
    const s = schema.score ? schema.score(payload) : {}
    await addIntake('QUESTIONNAIRE', { id: schema.id, ...payload, _score: s })
    setScore(s)
    setDone('Réponses enregistrées. Merci !')
    try {
      // Met à jour un badge de profil pour le questionnaire SIIN
      if (schema.id.includes('questionnaire-dactivite-et-de-depense-energetique-globale-siin') && auth.currentUser) {
        const lvl = (s as any).activite_globale
        const kcal = (s as any).kcal_estime ?? null
        await setProfileBadge('siin', { activite_globale: lvl ?? '—', kcal_estime: kcal })
      }
      if (schema.id === 'mes-plaintes-actuelles-et-troubles-ressentis' && auth.currentUser) {
        const total = (s as any).total
        await setProfileBadge('plaintes', { total: total ?? null })
      }
      if (schema.id === 'questionnaire-contextuel-mode-de-vie' && auth.currentUser) {
        const total = (s as any).total
        await setProfileBadge('contexte', { total: total ?? null })
      }
    } catch {}
  }

  return (
    <div className="space-y-5">
      {schema.fields.map(f => {
        if (f.type === 'radio') {
          return (
            <div key={f.id}>
              <div className="font-medium mb-2">{f.label}</div>
              <div className="flex flex-wrap gap-2">
                {f.options.map(o => (
                  <button key={o.value} className={`px-3 py-2 rounded border ${payload[f.id]===o.value?'bg-black text-white':'bg-white'}`} onClick={() => setVal(f.id, o.value)}>{o.label}</button>
                ))}
              </div>
            </div>
          )
        }
        if (f.type === 'multi') {
          const cur: string[] = payload[f.id] ?? []
          const toggle = (val: string) => setVal(f.id, cur.includes(val) ? cur.filter(x=>x!==val) : [...cur, val])
          return (
            <div key={f.id}>
              <div className="font-medium mb-2">{f.label}</div>
              <div className="flex flex-wrap gap-2">
                {f.options.map(o => (
                  <button key={o.value} className={`px-3 py-2 rounded border ${cur.includes(o.value)?'bg-black text-white':'bg-white'}`} onClick={() => toggle(o.value)}>{o.label}</button>
                ))}
              </div>
            </div>
          )
        }
        if (f.type === 'likert') {
          const val = Number(payload[f.id] ?? Math.round((f.min+f.max)/2))
          return (
            <div key={f.id}>
              <div className="font-medium mb-2">{f.label}</div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{f.left ?? f.min}</span>
                <input type="range" min={f.min} max={f.max} value={val} onChange={(e)=>setVal(f.id, Number(e.target.value))} className="flex-1" />
                <span className="text-sm text-gray-600">{f.right ?? f.max}</span>
                <span className="inline-block w-10 text-center border rounded py-1">{val}</span>
              </div>
            </div>
          )
        }
        return (
          <div key={f.id}>
            <div className="font-medium mb-2">{f.label}</div>
            <textarea rows={4} className="w-full border rounded px-3 py-2" placeholder={f.placeholder ?? ''} value={payload[f.id]??''} onChange={e=>setVal(f.id, e.target.value)} />
          </div>
        )
      })}
      <div className="flex gap-2 print:hidden">
        <button className="px-3 py-2 bg-black text-white rounded" onClick={submit}>Soumettre</button>
        <Link className="px-3 py-2 border rounded" href="/questionnaires">Retour</Link>
      </div>
      {done && (
        <div className="mt-4 border rounded p-4" id="resultats">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Résultats — {schema.title}</h3>
              <p className="text-xs text-gray-500">{new Date().toLocaleString()}</p>
            </div>
            <div className="flex gap-2 print:hidden">
              <button className="px-3 py-2 border rounded" onClick={() => window.print()}>Imprimer / PDF</button>
              <button className="px-3 py-2 border rounded" onClick={async () => {
                const el = document.getElementById('resultats')
                if (!el) return
                const [html2canvas, jsPDFmod] = await Promise.all([
                  import('html2canvas'),
                  import('jspdf'),
                ])
                const canvas = await html2canvas.default(el as HTMLElement, { scale: 2 })
                const imgData = canvas.toDataURL('image/png')
                const pdf = new (jsPDFmod as any).jsPDF('p','mm','a4')
                const pageWidth = 210, pageHeight = 297
                const imgWidth = pageWidth - 20
                const imgHeight = canvas.height * imgWidth / canvas.width
                pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, Math.min(imgHeight, pageHeight-20))
                pdf.save('resultats.pdf')
              }}>Exporter PDF</button>
              <Link className="px-3 py-2 border rounded" href="/profile">Retour profil</Link>
            </div>
          </div>
          <p className="text-green-700 text-sm mb-3">{done}</p>
          {score && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(score).map(([k,v]) => {
                if (k === 'activite_globale') {
                  const level = String(v)
                  const cls = level === 'fort' ? 'bg-green-600' : level === 'moyen' ? 'bg-amber-500' : 'bg-gray-500'
                  return (
                    <div key={k} className="flex items-center justify-between border rounded px-3 py-2">
                      <span className="text-sm text-gray-600">Activité globale</span>
                      <span className={`text-white text-xs px-2 py-1 rounded ${cls}`}>{level}</span>
                    </div>
                  )
                }
                if (k === 'total') {
                  return (
                    <div key={k} className="flex items-center justify-between border rounded px-3 py-2 bg-gray-50">
                      <span className="text-sm text-gray-600">Total</span>
                      <span className="font-semibold">{String(v)}</span>
                    </div>
                  )
                }
                if (k === 'kcal_estime') {
                  return (
                    <div key={k} className="flex items-center justify-between border rounded px-3 py-2">
                      <span className="text-sm text-gray-600">Dépense énergétique estimée</span>
                      <span className="font-medium">{v ?? '-'} kcal/j</span>
                    </div>
                  )
                }
                return (
                  <div key={k} className="flex items-center justify-between border rounded px-3 py-2">
                    <span className="text-sm text-gray-600">{k}</span>
                    <span className="font-medium">{String(v)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params
  const entry = (catalog as any[]).find(e => e.id === id)
  const schema = useMemo(() => registry(id), [id])
  return (
    <RequireAuth>
      <div className="space-y-5">
        <h1 className="text-2xl font-semibold">{entry?.label ?? id}</h1>
        {entry?.pdf && <Link className="underline" href={entry.pdf} target="_blank">Télécharger le PDF</Link>}
        {!schema && <p>Formulaire en cours de modélisation. Merci de revenir bientôt.</p>}
        {schema && <Section schema={schema} />}
      </div>
    </RequireAuth>
  )
}
