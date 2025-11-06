#!/usr/bin/env node
/**
 * Convert mode-de-vie-clean.json to TypeScript data.ts format
 * Usage: node scripts/integrate_mode_de_vie.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the clean JSON
const jsonPath = join(__dirname, '../data/questionnaires/generated/mode-de-vie-clean.json');
const json = JSON.parse(readFileSync(jsonPath, 'utf-8'));

// Read current data.ts
const dataPath = join(__dirname, '../apps/patient-vite/src/questionnaires/data.ts');
let dataContent = readFileSync(dataPath, 'utf-8');

// Generate TypeScript code for the questionnaire
let tsCode = `  // Auto-generated from mode-de-vie-clean.json on ${new Date().toISOString()}
  {
    id: '${json.id}',
    title: ${JSON.stringify(json.title)},
    category: ${JSON.stringify(json.category)},
    description: ${JSON.stringify(json.description)},
    sections: [
`;

for (const section of json.sections) {
  tsCode += `      {
        id: '${section.id}',
        title: ${JSON.stringify(section.title)},
        questions: [
`;

  for (const question of section.questions) {
    tsCode += `          {
            id: '${question.id}',
            label: ${JSON.stringify(question.label)},
            type: '${question.type}' as const,
            options: [
`;
    for (const option of question.options) {
      tsCode += `              ${JSON.stringify(option)},\n`;
    }
    tsCode += `            ],
          },
`;
  }

  tsCode += `        ],
      },
`;
}

tsCode += `    ],
  },`; // Find and replace the existing mode-de-vie entry
const modeDeVieRegex = /{\s*id:\s*['"]mode-de-vie['"],[\s\S]*?^  },/m;

if (modeDeVieRegex.test(dataContent)) {
  dataContent = dataContent.replace(modeDeVieRegex, tsCode);
  console.log('✅ Mode de vie questionnaire remplacé');
} else {
  // If not found, add before the closing bracket
  const insertPoint = dataContent.lastIndexOf('];');
  if (insertPoint > -1) {
    dataContent =
      dataContent.slice(0, insertPoint) + tsCode + '\n' + dataContent.slice(insertPoint);
    console.log('✅ Mode de vie questionnaire ajouté');
  } else {
    console.error('❌ Could not find insertion point in data.ts');
    process.exit(1);
  }
}

// Write back
writeFileSync(dataPath, dataContent, 'utf-8');

console.log(`\n📊 Statistiques:`);
console.log(`   - Sections: ${json.sections.length}`);
console.log(`   - Questions: ${json.sections.reduce((sum, s) => sum + s.questions.length, 0)}`);
console.log(`\n📁 Fichier mis à jour: ${dataPath}`);
