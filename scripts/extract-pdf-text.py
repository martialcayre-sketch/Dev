#!/usr/bin/env python3
"""
Script d'extraction de texte depuis les PDF du dossier raw.
Utilise PyPDF2 pour l'extraction de texte natif (si le PDF contient déjà du texte).
Pour les PDF scannés, il faudrait utiliser OCRmyPDF ou Tesseract.
"""

import os
import sys
from pathlib import Path

try:
    import PyPDF2
except ImportError:
    print("❌ PyPDF2 non installé. Installation...")
    print("   pip install PyPDF2")
    sys.exit(1)


def extract_text_from_pdf(pdf_path: Path) -> str:
    """Extrait le texte d'un fichier PDF."""
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text_parts = []
            
            for i, page in enumerate(reader.pages, 1):
                page_text = page.extract_text()
                if page_text.strip():
                    text_parts.append(f"===== PAGE {i} =====\n\n{page_text}\n")
            
            return "\n".join(text_parts)
    except Exception as e:
        return f"❌ ERREUR lors de l'extraction: {str(e)}"


def process_directory(input_dir: Path, output_dir: Path):
    """Traite tous les PDF d'un répertoire."""
    input_dir = Path(input_dir)
    output_dir = Path(output_dir)
    
    # Créer le dossier de sortie s'il n'existe pas
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Chercher tous les PDF récursivement
    pdf_files = list(input_dir.rglob("*.pdf"))
    
    if not pdf_files:
        print(f"⚠️  Aucun fichier PDF trouvé dans {input_dir}")
        return
    
    print(f"📄 {len(pdf_files)} fichier(s) PDF trouvé(s)\n")
    
    success_count = 0
    error_count = 0
    
    for pdf_path in pdf_files:
        # Construire le chemin relatif pour garder la structure
        relative_path = pdf_path.relative_to(input_dir)
        
        # Créer le chemin de sortie avec extension .txt
        txt_path = output_dir / relative_path.with_suffix('.txt')
        txt_path.parent.mkdir(parents=True, exist_ok=True)
        
        print(f"🔄 Traitement: {relative_path}")
        
        # Extraire le texte
        text = extract_text_from_pdf(pdf_path)
        
        # Sauvegarder
        try:
            with open(txt_path, 'w', encoding='utf-8') as f:
                f.write(f"Source: {pdf_path.name}\n")
                f.write(f"Chemin: {relative_path}\n")
                f.write("=" * 80 + "\n\n")
                f.write(text)
            
            # Vérifier si du texte a été extrait
            if "❌ ERREUR" in text:
                print(f"   ❌ Erreur: {txt_path}")
                error_count += 1
            elif len(text.strip()) < 100:
                print(f"   ⚠️  Peu de texte extrait (PDF scanné?): {txt_path}")
                error_count += 1
            else:
                print(f"   ✅ Texte extrait: {txt_path}")
                success_count += 1
        
        except Exception as e:
            print(f"   ❌ Erreur d'écriture: {e}")
            error_count += 1
    
    print(f"\n{'=' * 60}")
    print(f"✅ Réussis: {success_count}")
    print(f"❌ Erreurs: {error_count}")
    print(f"📁 Fichiers texte dans: {output_dir}")


def main():
    """Point d'entrée principal."""
    if len(sys.argv) < 2:
        print("Usage: python extract-pdf-text.py <input_dir> [output_dir]")
        print("\nExemples:")
        print('  python extract-pdf-text.py "data/questionnaires/raw"')
        print('  python extract-pdf-text.py "data/questionnaires/raw" "data/questionnaires/extracted"')
        print('  python extract-pdf-text.py "data/questionnaires/raw/Mode de vie"')
        sys.exit(1)
    
    input_dir = Path(sys.argv[1])
    
    if not input_dir.exists():
        print(f"❌ Le répertoire {input_dir} n'existe pas")
        sys.exit(1)
    
    # Dossier de sortie par défaut
    if len(sys.argv) > 2:
        output_dir = Path(sys.argv[2])
    else:
        output_dir = input_dir.parent / "extracted" / input_dir.name
    
    print("=" * 60)
    print("📄 EXTRACTION DE TEXTE DEPUIS PDF")
    print("=" * 60)
    print(f"📂 Source: {input_dir}")
    print(f"📁 Destination: {output_dir}")
    print("=" * 60 + "\n")
    
    process_directory(input_dir, output_dir)


if __name__ == "__main__":
    main()
