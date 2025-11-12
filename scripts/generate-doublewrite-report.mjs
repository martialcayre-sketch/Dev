#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const project =
  process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || process.argv[2] || '';
if (!project) {
  console.error('Usage: GCLOUD_PROJECT=<project-id> node scripts/generate-doublewrite-report.mjs');
  process.exit(1);
}

console.log(`Running double-write analysis for project: ${project}`);

const proc = spawn('node', ['scripts/analyze-questionnaire-doublewrite.mjs'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, GOOGLE_CLOUD_PROJECT: project },
});

let out = '';
let err = '';
proc.stdout.on('data', (d) => (out += d.toString()));
proc.stderr.on('data', (d) => (err += d.toString()));
proc.on('close', (code) => {
  const ts = new Date().toISOString().replace(/[:]/g, '-');
  const dir = join('docs');
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `QUESTIONNAIRE_DOUBLEWRITE_REPORT_${project}_${ts}.md`);
  const content = `# Double-write Report (questionnaires)\n\n- Project: ${project}\n- Date: ${new Date().toISOString()}\n- Exit code: ${code}\n\n## Output\n\n\n\n\n\n${'```'}\n${out}\n${'```'}\n\n## Errors\n\n${
    err ? '```\n' + err + '\n```' : '_None_'
  }\n`;
  writeFileSync(file, content, 'utf-8');
  console.log(`Report written to ${file}`);
  process.exit(code || 0);
});
