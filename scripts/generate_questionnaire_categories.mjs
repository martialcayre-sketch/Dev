#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

// Usage: node scripts/generate_questionnaire_categories.mjs "C:\\path\\to\\QUESTIONNAIRES"
// Produces apps/web/src/data/questionnaires.generated.json

const srcRoot = process.argv[2] || process.env.QN_SOURCE_DIR
if (!srcRoot) {
  console.error('Provide source directory as arg or QN_SOURCE_DIR env var')
  process.exit(1)
}
if (!fs.existsSync(srcRoot) || !fs.statSync(srcRoot).isDirectory()) {
  console.error('Source path not found or not a directory:', srcRoot)
  process.exit(1)
}

const categories = []
for (const entry of fs.readdirSync(srcRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue
  const catDir = path.join(srcRoot, entry.name)
  const items = []
  for (const q of fs.readdirSync(catDir, { withFileTypes: true })) {
    if (q.isDirectory()) {
      const id = q.name.toLowerCase().replace(/\s+/g, '-')
      items.push({ id, label: q.name, href: `/questionnaires/${id}` })
    } else if (q.isFile()) {
      const base = path.parse(q.name).name
      const id = base.toLowerCase().replace(/\s+/g, '-')
      items.push({ id, label: base, href: `/questionnaires/${id}` })
    }
  }
  const id = entry.name.toLowerCase().replace(/\s+/g, '-')
  categories.push({ id, label: entry.name, items })
}

const out = { categories }
const outPath = path.join(process.cwd(), 'apps', 'web', 'src', 'data', 'questionnaires.generated.json')
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf-8')
console.log('Wrote', outPath)

