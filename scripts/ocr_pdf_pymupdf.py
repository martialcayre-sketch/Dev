#!/usr/bin/env python3
"""
OCR a PDF using PyMuPDF for rasterization and pytesseract for text recognition.
Writes a .txt file with page markers preserving order.

Usage:
  C:/Python314/python.exe scripts/ocr_pdf_pymupdf.py --input "data/questionnaires/raw/Mode de vie/questionnaire-contextuel-mode-de-vie-pro-def.pdf" --output "data/questionnaires/ocr_txt/Mode de vie/questionnaire-contextuel-mode-de-vie-pro-def.txt" --dpi 400 --psm 6 --oem 1

Requires: pymupdf, pytesseract, pillow
Assumes tesseract.exe is on PATH.
"""
import argparse
import os
from pathlib import Path
import fitz  # PyMuPDF
import pytesseract
from PIL import Image, ImageOps, ImageFilter
import shutil

# Try to set tesseract path if not in PATH
DEFAULT_TESS_PATHS = [
    r"C:\\Program Files\\Tesseract-OCR\\tesseract.exe",
    r"C:\\Program Files (x86)\\Tesseract-OCR\\tesseract.exe",
]
if not shutil.which("tesseract"):
    for p in DEFAULT_TESS_PATHS:
        if os.path.exists(p):
            pytesseract.pytesseract.tesseract_cmd = p
            break

def preprocess(img: Image.Image) -> Image.Image:
    """Basic preprocessing to improve OCR: grayscale, contrast boost, light denoise/binarize."""
    # Convert to grayscale
    g = ImageOps.grayscale(img)
    # Slight sharpen to improve edges
    g = g.filter(ImageFilter.SHARPEN)
    # Auto-contrast to stretch histogram
    g = ImageOps.autocontrast(g)
    # Light binarization: keep as L to preserve shapes; create a high-contrast version
    # You can experiment with threshold if needed
    # bw = g.point(lambda x: 0 if x < 160 else 255, mode='1')
    return g

def ocr_pdf(input_pdf: Path, output_txt: Path, dpi: int = 400, lang: str = "fra", psm: int = 6, oem: int = 1):
    # Ensure TESSDATA_PREFIX points to a valid tessdata folder if user provided one
    user_tess = Path("C:/Dev/tessdata")
    if user_tess.exists():
        os.environ["TESSDATA_PREFIX"] = str(user_tess)

    output_txt.parent.mkdir(parents=True, exist_ok=True)
    with fitz.open(str(input_pdf)) as doc:
        with output_txt.open("w", encoding="utf-8") as out:
            for i, page in enumerate(doc, start=1):
                # Render page to image
                zoom = dpi / 72.0
                mat = fitz.Matrix(zoom, zoom)
                pix = page.get_pixmap(matrix=mat, alpha=False)
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                proc = preprocess(img)
                config = f"--oem {oem} --psm {psm} -c preserve_interword_spaces=1"
                text = pytesseract.image_to_string(proc, lang=lang, config=config)
                out.write(f"===== PAGE {i} =====\n\n{text}\n")
                print(f"OCR page {i}/{len(doc)} (psm={psm}, oem={oem}, dpi={dpi})")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True)
    ap.add_argument("--output", required=True)
    ap.add_argument("--dpi", type=int, default=400)
    ap.add_argument("--lang", default="fra")
    ap.add_argument("--psm", type=int, default=6, help="Tesseract page segmentation mode")
    ap.add_argument("--oem", type=int, default=1, help="Tesseract OCR engine mode")
    args = ap.parse_args()

    ocr_pdf(Path(args.input), Path(args.output), dpi=args.dpi, lang=args.lang, psm=args.psm, oem=args.oem)

if __name__ == "__main__":
    main()
