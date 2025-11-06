import fs from 'fs/promises';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function extractPdfDetailed(pdfPath) {
  console.log(`\n📄 Extraction de: ${path.basename(pdfPath)}`);
  console.log('━'.repeat(80));

  try {
    const dataBuffer = await fs.readFile(pdfPath);

    // Extract with pdf-parse
    const data = await pdfParse(dataBuffer, {
      // Get more detailed page information
      pagerender: async function (pageData) {
        const renderOptions = {
          normalizeWhitespace: false,
          disableCombineTextItems: false,
        };

        const textContent = await pageData.getTextContent(renderOptions);

        // Group text items by approximate Y position (lines)
        const lines = [];
        let currentLine = [];
        let lastY = null;

        for (const item of textContent.items) {
          const y = item.transform[5];

          // New line if Y position changed significantly
          if (lastY !== null && Math.abs(y - lastY) > 5) {
            if (currentLine.length > 0) {
              lines.push(currentLine.sort((a, b) => a.x - b.x));
              currentLine = [];
            }
          }

          currentLine.push({
            text: item.str,
            x: item.transform[4],
            y: y,
            height: item.height,
          });

          lastY = y;
        }

        if (currentLine.length > 0) {
          lines.push(currentLine.sort((a, b) => a.x - b.x));
        }

        // Sort lines top to bottom
        lines.sort((a, b) => b[0].y - a[0].y);

        // Reconstruct text
        let pageText = '';
        for (const line of lines) {
          const lineText = line.map((item) => item.text).join(' ');
          if (lineText.trim()) {
            pageText += lineText.trim() + '\n';
          }
        }

        return pageText;
      },
    });

    console.log(`📊 Nombre de pages: ${data.numpages}`);
    console.log(`📝 Longueur du texte: ${data.text.length} caractères\n`);

    return data.text;
  } catch (error) {
    console.error(`❌ Erreur lors de l'extraction:`, error);
    throw error;
  }
}

async function main() {
  const pdfPath = path.join(
    __dirname,
    '../data/questionnaires/raw/Mode de vie/questionnaire-contextuel-mode-de-vie-pro-def.pdf'
  );

  const outputPath = path.join(
    __dirname,
    '../data/questionnaires/extracted/Mode de vie/questionnaire-contextuel-mode-de-vie-DETAILED.txt'
  );

  console.log('\n🚀 EXTRACTION DÉTAILLÉE DU PDF MODE DE VIE');
  console.log('━'.repeat(80));

  const fullText = await extractPdfDetailed(pdfPath);

  // Save full text
  await fs.writeFile(outputPath, fullText, 'utf-8');
  console.log(`\n✅ Texte complet sauvegardé: ${path.basename(outputPath)}`);

  // Display a preview
  console.log('\n📋 APERÇU DU CONTENU:');
  console.log('━'.repeat(80));
  console.log(fullText.substring(0, 3000));
  console.log('\n...');
  console.log(fullText.substring(fullText.length - 1000));

  console.log('\n🎉 EXTRACTION TERMINÉE !');
  console.log('━'.repeat(80));
  console.log(`📁 Fichier: ${outputPath}`);
  console.log(`📊 Taille: ${fullText.length} caractères`);
  console.log('━'.repeat(80));
}

main().catch(console.error);
