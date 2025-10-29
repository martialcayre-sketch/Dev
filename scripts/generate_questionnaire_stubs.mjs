#!/usr/bin/env node
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'

const repo = process.cwd()
const catalogPath = path.join(repo, 'apps', 'web', 'src', 'data', 'questionnaires.catalog.json')
if (!fs.existsSync(catalogPath)) {
  console.error('Catalog not found:', catalogPath)
  process.exit(1)
}
const catalog = JSON.parse(await fsp.readFile(catalogPath, 'utf8'))

const outRoot = path.join(repo, 'apps', 'web', 'src', 'questionnaires')
await fsp.mkdir(outRoot, { recursive: true })

const schemaTemplate = (id, title) => `export type QOption = { value: string; label: string }
export type QField =
  | { type: 'radio'; id: string; label: string; options: QOption[] }
  | { type: 'likert'; id: string; label: string; min: number; max: number; left?: string; right?: string }
  | { type: 'multi'; id: string; label: string; options: QOption[] }
  | { type: 'text'; id: string; label: string; placeholder?: string }

export type QSchema = { id: string; title: string; fields: QField[] }

// TODO: Compléter le schéma d'après le PDF original (items, options, échelles).
export const schema: QSchema = {
  id: '${id}',
  title: ${JSON.stringify(title)},
  fields: [
    // Exemple minimal (à remplacer):
    // { type: 'likert', id: 'q1', label: 'Échelle 1–10', min: 1, max: 10, left: 'Min', right: 'Max' },
    // { type: 'radio', id: 'q2', label: 'Choix unique', options: [ { value: 'a', label: 'A' }, { value:'b', label:'B' } ] },
  ],
}
`

const scoreTemplate = `// TODO: Implémenter le calcul du score d'après la notice du questionnaire.
export function score(payload: Record<string, any>): Record<string, number> {
  // Exemple: return { total: Number(payload.q1||0) }
  return {}
}
`

let created = 0
for (const e of catalog) {
  const id = e.id
  const title = e.label || id
  const dir = path.join(outRoot, id)
  await fsp.mkdir(dir, { recursive: true })
  const schemaFile = path.join(dir, 'schema.ts')
  const scoreFile = path.join(dir, 'score.ts')
  if (!fs.existsSync(schemaFile)) {
    await fsp.writeFile(schemaFile, schemaTemplate(id, title), 'utf8')
    created++
  }
  if (!fs.existsSync(scoreFile)) {
    await fsp.writeFile(scoreFile, scoreTemplate, 'utf8')
    created++
  }
}

console.log('Stub generation complete. Files created:', created)

