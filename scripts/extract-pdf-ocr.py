#!/usr/bin/env python3
"""
Script d'extraction OCR depuis PDF avec Tesseract.
Pour les PDF scannés ou avec peu de texte natif.
"""

import os
import sys
from pathlib import Path

try:
    import pytesseract
    from pdf2image import convert_from_path
    from PIL import Image
except ImportError:
    print("❌ Bibliothèques manquantes. Installation...")
    print("   pip install pytesseract pdf2image pillow")
    print("\n⚠️  Tesseract doit aussi être installé:")
    print("   Windows: https://github.com/UB-Mannheim/tesseract/wiki")
    print("   Ubuntu: sudo apt install tesseract-ocr tesseract-ocr-fra")
    print("   macOS: brew install tesseract tesseract-lang")
    sys.exit(1)


def ocr_pdf(pdf_path: Path, lang='fra+eng') -> str:
    """Effectue l'OCR d'un PDF."""
    try:
        print(f"   🔍 Conversion PDF en images (DPI=300)...")
        images = convert_from_path(pdf_path, dpi=300)
        
        text_parts = []
        for i, image in enumerate(images, 1):
            print(f"   📄 OCR page {i}/{len(images)}...")
            page_text = pytesseract.image_to_string(image, lang=lang)
            if page_text.strip():
                text_parts.append(f"===== PAGE {i} =====\n\n{page_text}\n")
        
        return "\n".join(text_parts)
    except Exception as e:
        return f"❌ ERREUR OCR: {str(e)}"


def main():
    """Point d'entrée principal."""
    if len(sys.argv) < 2:
        print("Usage: python extract-pdf-ocr.py <pdf_file> [output_file] [lang]")
        print("\nExemples:")
        print('  python extract-pdf-ocr.py "questionnaire.pdf"')
        print('  python extract-pdf-ocr.py "questionnaire.pdf" "output.txt"')
        print('  python extract-pdf-ocr.py "questionnaire.pdf" "output.txt" "fra"')
        sys.exit(1)
    
    pdf_path = Path(sys.argv[1])
    
    if not pdf_path.exists():
        print(f"❌ Le fichier {pdf_path} n'existe pas")
        sys.exit(1)
    
    # Fichier de sortie
    if len(sys.argv) > 2:
        output_path = Path(sys.argv[2])
    else:
        output_path = pdf_path.with_suffix('.ocr.txt')
    
    # Langue
    lang = sys.argv[3] if len(sys.argv) > 3 else 'fra+eng'
    
    print("=" * 60)
    print("📄 EXTRACTION OCR DEPUIS PDF (Tesseract)")
    print("=" * 60)
    print(f"📂 Source: {pdf_path}")
    print(f"📁 Destination: {output_path}")
    print(f"🌍 Langue: {lang}")
    print("=" * 60 + "\n")
    
    # Vérifier Tesseract
    try:
        version = pytesseract.get_tesseract_version()
        print(f"✅ Tesseract {version} détecté\n")
    except:
        print("❌ Tesseract non trouvé. Installation requise:")
        print("   Windows: https://github.com/UB-Mannheim/tesseract/wiki")
        print("   Ubuntu: sudo apt install tesseract-ocr tesseract-ocr-fra")
        sys.exit(1)
    
    print(f"🔄 Traitement de {pdf_path.name}...")
    text = ocr_pdf(pdf_path, lang)
    
    # Sauvegarder
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(f"Source: {pdf_path.name}\n")
            f.write(f"Méthode: OCR Tesseract\n")
            f.write(f"Langue: {lang}\n")
            f.write("=" * 80 + "\n\n")
            f.write(text)
        
        if "❌ ERREUR" in text:
            print(f"\n❌ Échec de l'OCR")
        else:
            char_count = len(text.strip())
            print(f"\n✅ OCR terminé: {char_count} caractères extraits")
            print(f"📁 Fichier sauvegardé: {output_path}")
    
    except Exception as e:
        print(f"\n❌ Erreur d'écriture: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
