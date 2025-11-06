import fs from 'fs/promises';
import path from 'path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = path.join(
  __dirname,
  '../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs'
);

async function extractPdfText(pdfPath) {
  console.log(`\n📄 Extraction de: ${path.basename(pdfPath)}`);
  console.log('━'.repeat(80));

  try {
    const data = await fs.readFile(pdfPath);
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    const numPages = pdf.numPages;
    console.log(`📊 Nombre de pages: ${numPages}\n`);

    let fullText = '';
    const pageTexts = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Extract text with position information
      const items = textContent.items.map((item) => ({
        text: item.str,
        x: item.transform[4],
        y: item.transform[5],
        height: item.height,
        width: item.width,
      }));

      // Sort by Y position (top to bottom) then X position (left to right)
      items.sort((a, b) => {
        const yDiff = Math.abs(b.y - a.y);
        if (yDiff > 5) return b.y - a.y; // Different lines
        return a.x - b.x; // Same line, sort by X
      });

      // Reconstruct text with proper spacing
      let pageText = `\n${'='.repeat(80)}\nPAGE ${pageNum}\n${'='.repeat(80)}\n\n`;
      let lastY = null;
      let lineText = '';

      for (const item of items) {
        if (lastY !== null && Math.abs(item.y - lastY) > 5) {
          // New line
          if (lineText.trim()) {
            pageText += lineText.trim() + '\n';
          }
          lineText = '';
        }

        // Add space between words if needed
        if (lineText && !lineText.endsWith(' ') && !item.text.startsWith(' ')) {
          lineText += ' ';
        }

        lineText += item.text;
        lastY = item.y;
      }

      if (lineText.trim()) {
        pageText += lineText.trim() + '\n';
      }

      pageTexts.push(pageText);
      fullText += pageText;

      console.log(`✓ Page ${pageNum}/${numPages} extraite`);
    }

    return { fullText, pageTexts };
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

  const { fullText, pageTexts } = await extractPdfText(pdfPath);

  // Save full text
  await fs.writeFile(outputPath, fullText, 'utf-8');
  console.log(`\n✅ Texte complet sauvegardé: ${outputPath}`);

  // Also save individual pages for easier analysis
  const pagesDir = path.join(__dirname, '../data/questionnaires/extracted/Mode de vie/pages');
  await fs.mkdir(pagesDir, { recursive: true });

  for (let i = 0; i < pageTexts.length; i++) {
    const pagePath = path.join(pagesDir, `page-${i + 1}.txt`);
    await fs.writeFile(pagePath, pageTexts[i], 'utf-8');
  }
  console.log(`✅ Pages individuelles sauvegardées dans: ${pagesDir}`);

  // Display a preview
  console.log('\n📋 APERÇU DU CONTENU (premières 2000 caractères):');
  console.log('━'.repeat(80));
  console.log(fullText.substring(0, 2000));
  console.log('\n...\n');

  console.log('\n🎉 EXTRACTION TERMINÉE !');
  console.log('━'.repeat(80));
  console.log(`📁 Fichier complet: ${path.basename(outputPath)}`);
  console.log(`📂 Pages individuelles: ${pagesDir}`);
  console.log('━'.repeat(80));
}

main().catch(console.error);
