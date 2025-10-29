"use client";
export const dynamic = 'force-dynamic'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getPublicFormByToken, submitPublicResponse } from '@/src/lib/forms'
import catalog from '@/src/data/questionnaires.catalog.json'
import { schema as schemaContextuel } from '@/src/questionnaires/questionnaire-contextuel-mode-de-vie/schema'
import { schema as schemaSIIN } from '@/src/questionnaires/questionnaire-dactivite-et-de-depense-energetique-globale-siin/schema'
import { schema as schemaPlaintes } from '@/src/questionnaires/mes-plaintes-actuelles-et-troubles-ressentis/schema'

type QField =
  | { type: 'radio'; id: string; label: string; options: { value: string; label: string }[] }
  | { type: 'likert'; id: string; label: string; min: number; max: number; left?: string; right?: string }
  | { type: 'multi'; id: string; label: string; options: { value: string; label: string }[] }
  | { type: 'text'; id: string; label: string; placeholder?: string }

type QSchema = { id: string; title: string; fields: QField[] }

function registry(id: string): QSchema | null {
  if (id === 'questionnaire-contextuel-mode-de-vie') return schemaContextuel
  if (id.startsWith('questionnaire-dactivite-et-de-depense-energetique-globale-siin')) return schemaSIIN
  if (id === 'mes-plaintes-actuelles-et-troubles-ressentis') return schemaPlaintes
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const s = require(`@/src/questionnaires/${id}/schema`)
    return s.schema || s.default || null
  } catch {
    return null
  }
}

export default function PublicFormPage() {
  const params = useParams<{ token: string }>()
  const token = params.token
  const [link, setLink] = useState<any | null>(null)
  const [payload, setPayload] = useState<Record<string, any>>({})
  const [done, setDone] = useState<string | null>(null)
  const [score, setScore] = useState<Record<string, number> | null>(null)

  useEffect(() => { (async () => setLink(await getPublicFormByToken(token)))() }, [token])
  const schema = useMemo(() => link?.questionnaireId ? registry(link.questionnaireId) : null, [link])
  const entry = useMemo(() => (catalog as any[]).find(e => e.id === link?.questionnaireId), [link])

  const setVal = (id: string, v: any) => setPayload(prev => ({ ...prev, [id]: v }))
  const submit = async () => {
    let s: Record<string, number> | null = null
    // compute local score similarly for visual feedback if we have a known schema
    if (schema?.id === 'questionnaire-contextuel-mode-de-vie') {
      const { score } = await import('@/src/questionnaires/questionnaire-contextuel-mode-de-vie/score')
      s = score(payload) as any
    } else if (schema?.id?.startsWith('questionnaire-dactivite-et-de-depense-energetique-globale-siin')) {
      const { score } = await import('@/src/questionnaires/questionnaire-dactivite-et-de-depense-energetique-globale-siin/score')
      s = score(payload) as any
    } else if (schema?.id === 'mes-plaintes-actuelles-et-troubles-ressentis') {
      const { score } = await import('@/src/questionnaires/mes-plaintes-actuelles-et-troubles-ressentis/score')
      s = score(payload) as any
    }

    await submitPublicResponse(token, { id: schema?.id, ...payload, _score: s ?? undefined })
    if (s) setScore(s)
    setDone('Merci, votre réponse a été enregistrée.')
  }

  if (link === null) return <p>Chargement…</p>
  if (!link) return <p>Ce lien n’est pas valide ou a expiré.</p>
  if (!schema) return <p>Formulaire en cours de modélisation.</p>

  return (
    <div className="container mx-auto p-6 space-y-5">
      <h1 className="text-2xl font-semibold">{entry?.label ?? schema.title}</h1>
      <div className="text-sm text-gray-600">Catégorie: {entry?.category}</div>
      {entry?.pdf && <Link className="underline" href={entry.pdf} target="_blank">Télécharger le PDF</Link>}
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
      </div>
      {done && (
        <div className="mt-4 border rounded p-4" id="resultats">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Résultats</h3>
            <button className="px-3 py-2 border rounded print:hidden" onClick={() => window.print()}>Télécharger en PDF</button>
          </div>
          <p className="text-green-700 text-sm mb-3">{done}</p>
          <div className="mb-3 print:hidden">
            <a href="/profile" className="inline-block px-3 py-2 border rounded">Retour profil</a>
          </div>
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
