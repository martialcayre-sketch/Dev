#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXTRACTED_DIR = path.join(__dirname, '../packages/shared-questionnaires/extracted');
const OUTPUT_DIR = path.join(__dirname, '../packages/shared-questionnaires/src/questionnaires');
const INDEX_FILE = path.join(EXTRACTED_DIR, 'index.json');

// Type mapping from JSON to TypeScript
const TYPE_MAPPING = {
  select: 'select',
  number: 'number',
  textarea: 'textarea',
  scale: 'scale',
  'multiple-choice': 'multiple-choice',
};

// Category mapping
const CATEGORY_MAPPING = {
  alimentaire: 'alimentaire',
  cancerologie: 'cancerologie',
  cardiologie: 'cardiologie',
  'gastro-enterologie': 'gastro-enterologie',
  gerontologie: 'gerontologie',
  'mode de vie': 'mode-de-vie',
  'neuro-psychologie': 'neuro-psychologie',
  pneumologie: 'pneumologie',
  pédiatrie: 'pediatrie',
  rhumatologie: 'rhumatologie',
  sommeil: 'sommeil',
  stress: 'stress',
  tabacologie: 'tabacologie',
  urologie: 'urologie',
};

function sanitizeId(id) {
  return id
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeString(str) {
  if (!str) return '';
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
}

function generateQuestionCode(question) {
  const lines = [];
  lines.push('  {');
  lines.push(`    id: '${escapeString(question.id)}',`);
  lines.push(`    label: \`${escapeString(question.label)}\`,`);

  if (question.section) {
    lines.push(`    section: '${escapeString(question.section)}',`);
  }

  if (question.type) {
    lines.push(`    type: '${question.type}',`);
  }

  if (question.scale) {
    lines.push(`    scale: '${question.scale}',`);
  }

  if (question.options && question.options.length > 0) {
    lines.push('    options: [');
    question.options.forEach((opt, idx) => {
      const last = idx === question.options.length - 1;
      if (opt.points !== undefined) {
        lines.push(
          `      { label: \`${escapeString(opt.label)}\`, value: '${escapeString(opt.value)}', points: ${opt.points} }${last ? '' : ','}`
        );
      } else {
        lines.push(
          `      { label: \`${escapeString(opt.label)}\`, value: '${escapeString(opt.value)}' }${last ? '' : ','}`
        );
      }
    });
    lines.push('    ],');
  }

  if (question.required !== undefined) {
    lines.push(`    required: ${question.required},`);
  }

  lines.push('  }');
  return lines.join('\n');
}

function generateQuestionnaireFile(jsonData, category) {
  const id = sanitizeId(jsonData.id);
  const tsCategory = CATEGORY_MAPPING[category] || sanitizeId(category);

  const lines = [];
  lines.push("import type { Questionnaire } from '../../types';");
  lines.push('');
  lines.push(`export const ${id.replace(/-/g, '_')}: Questionnaire = {`);
  lines.push('  metadata: {');
  lines.push(`    id: '${id}',`);
  lines.push(`    title: \`${escapeString(jsonData.title)}\`,`);
  lines.push(`    category: '${tsCategory}',`);

  if (jsonData.description) {
    lines.push(`    description: \`${escapeString(jsonData.description)}\`,`);
  }

  if (jsonData.estimatedDuration) {
    lines.push(`    estimatedDuration: ${jsonData.estimatedDuration},`);
  }

  lines.push('  },');

  if (jsonData.sections && jsonData.sections.length > 0) {
    lines.push('  sections: [');
    jsonData.sections.forEach((section, sIdx) => {
      const lastSection = sIdx === jsonData.sections.length - 1;
      lines.push('    {');
      lines.push(`      id: '${escapeString(section.id)}',`);
      lines.push(`      title: \`${escapeString(section.title)}\`,`);
      if (section.description) {
        lines.push(`      description: \`${escapeString(section.description)}\`,`);
      }
      lines.push('      questions: [');
      section.questions.forEach((q, qIdx) => {
        const lastQ = qIdx === section.questions.length - 1;
        lines.push(generateQuestionCode(q) + (lastQ ? '' : ','));
      });
      lines.push('      ],');
      lines.push(`    }${lastSection ? '' : ','}`);
    });
    lines.push('  ],');
  } else if (jsonData.questions && jsonData.questions.length > 0) {
    lines.push('  questions: [');
    jsonData.questions.forEach((q, qIdx) => {
      const lastQ = qIdx === jsonData.questions.length - 1;
      lines.push(generateQuestionCode(q) + (lastQ ? '' : ','));
    });
    lines.push('  ],');
  }

  lines.push('};');
  lines.push('');

  return lines.join('\n');
}

async function main() {
  console.log('\n🔄 Converting JSON questionnaires to TypeScript...\n');

  // Read index
  const indexData = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));

  // Create output directory structure
  const categories = new Set();
  indexData.questionnaires.forEach((q) => {
    const tsCategory = CATEGORY_MAPPING[q.category] || sanitizeId(q.category);
    categories.add(tsCategory);
  });

  categories.forEach((cat) => {
    const catDir = path.join(OUTPUT_DIR, cat);
    if (!fs.existsSync(catDir)) {
      fs.mkdirSync(catDir, { recursive: true });
    }
  });

  let converted = 0;
  const exports = {};

  // Convert each questionnaire
  for (const meta of indexData.questionnaires) {
    const jsonFile = path.join(EXTRACTED_DIR, `${meta.id}.json`);

    if (!fs.existsSync(jsonFile)) {
      console.log(`⚠️  JSON file not found: ${meta.id}.json`);
      continue;
    }

    const jsonData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
    const tsCategory = CATEGORY_MAPPING[meta.category] || sanitizeId(meta.category);
    const id = sanitizeId(jsonData.id);
    const exportName = id.replace(/-/g, '_');

    const tsContent = generateQuestionnaireFile(jsonData, meta.category);
    const outputFile = path.join(OUTPUT_DIR, tsCategory, `${id}.ts`);

    fs.writeFileSync(outputFile, tsContent, 'utf8');

    if (!exports[tsCategory]) {
      exports[tsCategory] = [];
    }
    exports[tsCategory].push({ id, exportName, file: `./questionnaires/${tsCategory}/${id}` });

    console.log(`✓ ${meta.category}/${id}.ts`);
    converted++;
  }

  // Generate main index.ts
  const indexLines = [];
  indexLines.push('// Auto-generated questionnaires index');
  indexLines.push('// Do not edit manually');
  indexLines.push('');
  indexLines.push("export * from './types';");
  indexLines.push('');

  // Export all questionnaires
  Object.entries(exports)
    .sort()
    .forEach(([category, items]) => {
      indexLines.push(`// ${category}`);
      items.forEach((item) => {
        indexLines.push(`export { ${item.exportName} } from '${item.file}';`);
      });
      indexLines.push('');
    });

  // Import types and re-import questionnaires for helper functions
  indexLines.push("import type { Questionnaire } from './types';");
  Object.entries(exports)
    .sort()
    .forEach(([category, items]) => {
      items.forEach((item) => {
        indexLines.push(`import { ${item.exportName} } from '${item.file}';`);
      });
    });
  indexLines.push('');

  // Create getAllQuestionnaires function
  indexLines.push('export function getAllQuestionnaires(): Questionnaire[] {');
  indexLines.push('  return [');
  Object.entries(exports)
    .sort()
    .forEach(([category, items]) => {
      items.forEach((item) => {
        indexLines.push(`    ${item.exportName},`);
      });
    });
  indexLines.push('  ];');
  indexLines.push('}');
  indexLines.push('');

  // Create getQuestionnaireById function
  indexLines.push('export function getQuestionnaireById(id: string): Questionnaire | undefined {');
  indexLines.push('  return getAllQuestionnaires().find(q => q.metadata.id === id);');
  indexLines.push('}');
  indexLines.push('');

  // Create getQuestionnairesByCategory function
  indexLines.push(
    'export function getQuestionnairesByCategory(category: string): Questionnaire[] {'
  );
  indexLines.push('  return getAllQuestionnaires().filter(q => q.metadata.category === category);');
  indexLines.push('}');
  indexLines.push('');

  fs.writeFileSync(path.join(OUTPUT_DIR, '../index.ts'), indexLines.join('\n'), 'utf8');

  console.log(`\n✅ Converted ${converted} questionnaires to TypeScript`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
  console.log(`📄 Generated index.ts with helper functions`);
}

main().catch(console.error);
