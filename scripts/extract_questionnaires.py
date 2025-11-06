#!/usr/bin/env python3
"""
Extract text from OCR'd PDFs and structure it for questionnaire integration.
"""

import os
import sys
import json
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple

try:
    import pdfplumber
    PDF_LIBRARY = 'pdfplumber'
except ImportError:
    try:
        import PyMuPDF as fitz
        PDF_LIBRARY = 'pymupdf'
    except ImportError:
        print("❌ No PDF library found. Please install: pip install pdfplumber", file=sys.stderr)
        sys.exit(1)

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract all text from a PDF file."""
    try:
        if PDF_LIBRARY == 'pdfplumber':
            with pdfplumber.open(pdf_path) as pdf:
                text = ""
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                return text
        else:  # pymupdf
            doc = fitz.open(pdf_path)
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            return text
    except Exception as e:
        print(f"Error extracting text from {pdf_path}: {e}", file=sys.stderr)
        return ""

def detect_questions_french(text: str) -> List[str]:
    """Detect French questions in text."""
    # Patterns for French questions
    patterns = [
        r'^\d+[\.\)]\s*([^\n]+\?)',  # 1. Question?
        r'^\d+[\.\)]\s*\*\*([^\n]+)\*\*',  # 1. **Question**
        r'^[A-ZÀÉÈÊË][^\.!?\n]{10,100}\?',  # Capitalized sentence ending with ?
        r'(?:Comment|Combien|Pourquoi|Quand|Où|Quel|Quelle|Quels|Quelles|Est-ce que|Avez-vous|Êtes-vous)[^\.!?\n]+\?',  # French question starters
    ]
    
    questions = []
    lines = text.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        for pattern in patterns:
            matches = re.findall(pattern, line, re.MULTILINE | re.IGNORECASE)
            if matches:
                questions.append(line)
                break
    
    return questions

def extract_options(text: str, question_line_index: int, lines: List[str]) -> List[Dict[str, any]]:
    """Extract options following a question."""
    options = []
    i = question_line_index + 1
    
    while i < len(lines):
        line = lines[i].strip()
        
        # Stop if we hit another question
        if re.match(r'^\d+[\.\)]', line) or line.endswith('?'):
            break
        
        # Check for option patterns
        # Pattern 1: "- Option text (X pts)"
        match = re.match(r'^[-•]\s*(.+?)\s*\((\d+)\s*pts?\)', line, re.IGNORECASE)
        if match:
            options.append({
                'label': match.group(1).strip(),
                'points': int(match.group(2))
            })
            i += 1
            continue
        
        # Pattern 2: "□ Option text" or "○ Option text"
        match = re.match(r'^[□○☐]\s*(.+)', line)
        if match:
            options.append({
                'label': match.group(1).strip()
            })
            i += 1
            continue
        
        # Pattern 3: Simple list items
        if line.startswith('-') or line.startswith('•'):
            options.append({
                'label': line[1:].strip()
            })
            i += 1
            continue
        
        # Stop if line doesn't look like an option
        if line and not line[0].isdigit():
            i += 1
        else:
            break
    
    return options

def categorize_pdf(filename: str) -> str:
    """Determine category from filename."""
    filename_lower = filename.lower()
    
    categories = {
        'alimentaire': ['alimentaire', 'nutrition', 'diete', 'monnier'],
        'sommeil': ['sommeil', 'insomnie', 'fatigue', 'chronotype', 'psqi', 'berlin'],
        'stress': ['stress', 'anxiete', 'burn', 'karasek', 'dass'],
        'neuro-psychologie': ['depression', 'beck', 'hamilton', 'anxiete', 'alcool', 'addiction', 'dependance', 'alzheimer', 'cognitif'],
        'mode-de-vie': ['mode', 'vie', 'contextuel', 'activite', 'plaintes'],
        'tabacologie': ['tabac', 'nicotine', 'fagerstrom', 'cannabis'],
        'gastro-enterologie': ['digestif', 'intestin', 'bristol', 'francis'],
        'cardiologie': ['cardio', 'metabolique'],
        'rhumatologie': ['fibromyalgie', 'douleur', 'first'],
        'pediatrie': ['conners', 'enfant', 'tdah'],
        'urologie': ['mictionnel', 'prostate', 'ipss'],
        'pneumologie': ['bpco', 'respiratoire'],
        'cancerologie': ['cancer', 'qlq'],
        'gerontologie': ['sarcopenie', 'tinetti', 'geriatrie'],
    }
    
    for category, keywords in categories.items():
        if any(keyword in filename_lower for keyword in keywords):
            return category
    
    return 'other'

def process_pdf(pdf_path: Path, category: str) -> Optional[Dict]:
    """Process a single PDF and extract structured data."""
    print(f"Processing: {pdf_path.name}")
    
    text = extract_text_from_pdf(str(pdf_path))
    if not text or len(text) < 100:
        print(f"  ⚠️  No text extracted or text too short", file=sys.stderr)
        return None
    
    lines = text.split('\n')
    questions = []
    
    # Try to detect title
    title = pdf_path.stem.replace('-', ' ').replace('_', ' ').title()
    for line in lines[:10]:  # Check first 10 lines for title
        line = line.strip()
        if len(line) > 10 and len(line) < 100 and not line[0].isdigit():
            title = line
            break
    
    # Detect questions
    for i, line in enumerate(lines):
        line = line.strip()
        
        # Pattern: numbered question
        match = re.match(r'^(\d+)[\.\)]\s*(.+)', line)
        if match:
            question_num = match.group(1)
            question_text = match.group(2).strip()
            
            # Extract options
            options = extract_options(text, i, lines)
            
            questions.append({
                'id': f'q{question_num}',
                'label': question_text,
                'type': 'select' if options else 'textarea',
                'options': [opt['label'] for opt in options] if options else None,
                'points': [opt.get('points') for opt in options] if options and any('points' in opt for opt in options) else None
            })
    
    if not questions:
        print(f"  ⚠️  No questions detected", file=sys.stderr)
        return None
    
    print(f"  ✓ Found {len(questions)} questions")
    
    return {
        'id': pdf_path.stem,
        'title': title,
        'category': category,
        'filename': pdf_path.name,
        'questions': questions,
        'extracted_text_length': len(text),
        'source': 'ocr'
    }

def main():
    """Main extraction process."""
    ocr_dir = Path('c:/Dev/data/questionnaires/ocr')
    output_dir = Path('c:/Dev/packages/shared-questionnaires/extracted')
    output_dir.mkdir(parents=True, exist_ok=True)
    
    if not ocr_dir.exists():
        print(f"❌ OCR directory not found: {ocr_dir}", file=sys.stderr)
        return 1
    
    print("🚀 Starting PDF extraction from OCR library...\n")
    
    results = []
    categories_stats = {}
    
    # Process all PDFs in OCR directory
    for category_dir in sorted(ocr_dir.iterdir()):
        if not category_dir.is_dir():
            continue
        
        category = category_dir.name.lower()
        print(f"\n📁 Category: {category}")
        
        pdf_files = list(category_dir.glob('*.pdf'))
        categories_stats[category] = {'total': len(pdf_files), 'processed': 0}
        
        for pdf_file in sorted(pdf_files):
            result = process_pdf(pdf_file, category)
            if result:
                results.append(result)
                categories_stats[category]['processed'] += 1
                
                # Save individual questionnaire
                questionnaire_file = output_dir / f"{result['id']}.json"
                with open(questionnaire_file, 'w', encoding='utf-8') as f:
                    json.dump(result, f, ensure_ascii=False, indent=2)
    
    # Save master index
    index_file = output_dir / 'index.json'
    with open(index_file, 'w', encoding='utf-8') as f:
        json.dump({
            'total_questionnaires': len(results),
            'categories': categories_stats,
            'questionnaires': [
                {
                    'id': r['id'],
                    'title': r['title'],
                    'category': r['category'],
                    'question_count': len(r['questions'])
                }
                for r in results
            ]
        }, f, ensure_ascii=False, indent=2)
    
    # Print summary
    print("\n" + "=" * 60)
    print("📊 EXTRACTION SUMMARY")
    print("=" * 60)
    print(f"\n✅ Total questionnaires extracted: {len(results)}")
    print(f"📁 Output directory: {output_dir}")
    print(f"\n📈 By category:")
    for cat, stats in sorted(categories_stats.items()):
        print(f"   • {cat:30} {stats['processed']:2}/{stats['total']:2} PDFs")
    
    print(f"\n💾 Files created:")
    print(f"   • {len(results)} individual JSON files")
    print(f"   • 1 master index.json")
    
    return 0

if __name__ == '__main__':
    sys.exit(main())
