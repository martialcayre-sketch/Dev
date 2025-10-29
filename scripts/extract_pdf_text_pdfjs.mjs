#!/usr/bin/env node
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'

let pdfjsLib
try {
  pdfjsLib = await import('pdfjs-dist')
  if (!pdfjsLib.getDocument) throw new Error('no getDocument')
} catch (e) {
  try {
    pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
  } catch (e2) {
    console.error("Dependency 'pdfjs-dist' is missing or incompatible. In the Dev Container run: pnpm add -D pdfjs-dist")
    process.exit(1)
  }
}

function removeDiacritics(s) {
  return s.normalize('NFD').replace(/\p{Diacritic}+/gu, '').normalize('NFC')
}

function slugify(name) {
  const n = removeDiacritics(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return n
}

const repoRoot = process.cwd()
const rawRoot = path.join(repoRoot, 'data', 'questionnaires', 'raw')
const outRoot = path.join(repoRoot, 'data', 'questionnaires', 'extracted')

async function listPdfFiles(dir) {
  const entries = await fsp.readdir(dir, { withFileTypes: true })
  const files = []
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) files.push(...await listPdfFiles(full))
    else if (e.isFile() && e.name.toLowerCase().endsWith('.pdf')) files.push(full)
  }
  return files
}

async function extractPdfText(buffer) {
  const loadingTask = pdfjsLib.getDocument({ data: buffer })
  const pdf = await loadingTask.promise
  let text = ''
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const content = await page.getTextContent()
    const strings = content.items.map(item => item.str)
    text += strings.join(' ') + '\n\n'
  }
  return { text, pages: pdf.numPages }
}

async function main() {
  const categoryFilter = process.argv[2] || null
  if (!fs.existsSync(rawRoot)) {
    console.error('Raw directory not found:', rawRoot)
    process.exit(1)
  }
  await fsp.mkdir(outRoot, { recursive: true })
  const files = await listPdfFiles(categoryFilter ? path.join(rawRoot, categoryFilter) : rawRoot)
  if (files.length === 0) {
    console.log('No PDF found to extract.')
    return
  }
  for (const file of files) {
    const rel = path.relative(rawRoot, file)
    const category = rel.split(path.sep)[0]
    const base = path.parse(file).name
    const slug = slugify(base)
    const buf = new Uint8Array(await fsp.readFile(file))
    const data = await extractPdfText(buf)
    const outDir = path.join(outRoot, category)
    await fsp.mkdir(outDir, { recursive: true })
    await fsp.writeFile(path.join(outDir, slug + '.txt'), data.text, 'utf8')
    await fsp.writeFile(path.join(outDir, slug + '.meta.json'), JSON.stringify({ file: rel, pages: data.pages }, null, 2), 'utf8')
    console.log('Extracted:', rel, '->', path.join('data/questionnaires/extracted', category, slug + '.txt'))
  }
}

main().catch(err => { console.error(err); process.exit(1) })
