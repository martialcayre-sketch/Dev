#!/usr/bin/env python3
"""
Parse OCR'd questionnaire PDFs (or extracted .txt) into a structured JSON format
suitable for the app's questionnaire schema (id, label, type, options, etc.).

Usage examples:
  python scripts/parse_questionnaires.py --input "data/questionnaires/ocr/Mode de vie/questionnaire-contextuel-mode-de-vie-pro-def.pdf" --outdir data/questionnaires/generated
  python scripts/parse_questionnaires.py --input "data/questionnaires/raw/extracted/Mode de vie/questionnaire-contextuel-mode-de-vie-pro-def.txt" --outdir data/questionnaires/generated

Heuristics:
- Section detection: lines in ALL CAPS or lines starting with digits like "1.", "2." as top headers
- Question detection: lines starting with digits ("1.", "1)") or an en-dash/hyphen/bullet
- Options: lines directly following a question that look like list items (starting with -, •, –, o, *)
- Scoring: detect patterns like "(X pt)" or "(X pts)" at end of option

Outputs a JSON with keys: title, sections[{title, questions[{id,label,type,options[],rawOptions[]}]}]

Note: This is a best-effort heuristic; expect manual review.
"""

import argparse
import json
import os
import re
from pathlib import Path

try:
    import pdfplumber  # type: ignore
except Exception:
    pdfplumber = None  # fallback to text-only if missing

SECTION_RE = re.compile(r"^Votre\s.+$", re.IGNORECASE)
QUESTION_MARK_RE = re.compile(r"\?\s*$")
QUESTION_START_RE = re.compile(r"^(Estimez|Avez|Comment|Combien|Le soir|Dans votre métier|Regardez|Je gère|Lors de|Est-ce que|Pratiquez|À quelle|Quel est|Quel|Etes|Consommez|Je connais|Je favorise|Je limite|Au sein|J'ai|Je suis|Dans mon quotidien)", re.IGNORECASE)
QUESTION_NUM_RE = re.compile(r"^\s*(\d+)[\.)]\s+(.*)")
BULLET_RE = re.compile(r"^\s*([\-•–*o])\s+(.*)")
POINTS_RE = re.compile(r"\((\d+)\s*pt[s]?\)\s*$", re.IGNORECASE)
SCORE_BREAKERS = (
    "Votre score",
    "Additionnez les points",
    "Le score pour les Professionnels",
)


def read_text_from_pdf(pdf_path: Path) -> str:
    if pdfplumber is None:
        raise RuntimeError("pdfplumber not installed. Install with: pip install pdfplumber")
    out = []
    with pdfplumber.open(str(pdf_path)) as pdf:
        for i, page in enumerate(pdf.pages, start=1):
            txt = page.extract_text(x_tolerance=2, y_tolerance=2) or ""
            out.append(f"===== PAGE {i} =====\n\n{txt}\n")
    return "\n".join(out)


def read_text(input_path: Path) -> str:
    if input_path.suffix.lower() == ".txt":
        return input_path.read_text(encoding="utf-8", errors="ignore")
    if input_path.suffix.lower() == ".pdf":
        return read_text_from_pdf(input_path)
    raise ValueError(f"Unsupported input: {input_path}")


def normalize_lines(text: str) -> list[str]:
    raw_lines = [ln.rstrip("\n\r") for ln in text.splitlines()]
    lines: list[str] = []
    for ln in raw_lines:
        # Skip page markers inserted by OCR script
        if re.match(r"^===== PAGE \d+ =====$", ln.strip()):
            continue
        # Keep original spacing as much as possible (useful to detect columns/options)
        ln = ln.replace("\t", "    ")
        # Do not collapse multiple spaces; just strip trailing/leading whitespace
        lines.append(ln.strip())
    # Keep blank lines for structure
    return lines


def slugify(s: str) -> str:
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s or "item"


def parse_text(lines: list[str]) -> dict:
    data = {
        "title": None,
        "sections": []
    }
    current_section = None
    current_question = None
    pending_option_lines: list[str] = []

    def start_section(title: str):
        nonlocal current_section, current_question, pending_option_lines
        if current_section:
            # finalize any open question
            if current_question:
                current_section["questions"].append(current_question)
                current_question = None
            data["sections"].append(current_section)
        current_section = {"title": title, "questions": []}
        pending_option_lines = []

    def start_question(q_label: str):
        nonlocal current_question, pending_option_lines
        # close previous
        if current_question:
            current_section["questions"].append(current_question)
        current_question = {
            "id": slugify(q_label)[:64],
            "label": q_label,
            "type": "select",  # default guess; manual fix later if needed
            "options": [],
            "rawOptions": []
        }
        # If we buffered option header lines before the question (common OCR artifact), attach them now
        for ol in pending_option_lines:
            for opt in split_options(ol):
                current_question["rawOptions"].append(opt)
                current_question["options"].append(opt)
        pending_option_lines = []

    def is_breaker(ln: str) -> bool:
        low = ln.lower()
        if not ln:
            return False
        return any(b.lower() in low for b in SCORE_BREAKERS)

    def is_numeric_row(ln: str) -> bool:
        # Matches rows with only digits separated by spaces/pipes (e.g., "0  1  2  3  4")
        return bool(re.match(r"^\s*(?:[0-9]+[\s|]+){2,}[0-9]+\s*$", ln))

    def is_option_header_like(ln: str) -> bool:
        if not ln or '?' in ln:
            return False
        if is_breaker(ln) or SECTION_RE.match(ln):
            return False
        if is_numeric_row(ln):
            return False
        # OCR often produces rows with many spaces between tokens or pipes (Jamais | Rarement | ...)
        if '|' in ln:
            return True
        # Count sequences of 2+ spaces (column gaps)
        return len(re.findall(r"\s{2,}", ln)) >= 2

    def split_options(ln: str) -> list[str]:
        # First split by pipe if present, else by 2+ spaces
        if '|' in ln:
            parts = [p.strip() for p in ln.split('|')]
        else:
            parts = [p.strip() for p in re.split(r"\s{2,}", ln) if p.strip()]
        cleaned = []
        for p in parts:
            # Strip leading bullets/dashes
            p = re.sub(r"^[\-•–*o]\s*", "", p)
            # Strip trailing isolated digits (score columns)
            p = re.sub(r"\s+[0-9]+\s*$", "", p).strip()
            # Strip leading/trailing punctuation noise
            p = p.strip("- •–*:;.,")
            if not p or len(p) <= 1:
                continue
            # remove trailing "Votre score" token often glued at end
            if p.lower().startswith("votre score") or p.lower() == "votre score":
                continue
            # Skip very short fragments that are likely OCR noise
            if len(p) <= 2 and not p.isalpha():
                continue
            # Normalize common French Likert options to standard forms
            p_low = p.lower()
            if "jamais" in p_low and len(p) < 10:
                p = "Jamais"
            elif "rarement" in p_low and len(p) < 12:
                p = "Rarement"
            elif "occasionnelle" in p_low and len(p) < 20:
                p = "Occasionnellement"
            elif "fréquemment" in p_low or "fréquemment" in p_low and len(p) < 18:
                p = "Fréquemment"
            elif "toujours" in p_low and len(p) < 12:
                p = "Toujours"
            elif "pas du tout" in p_low and len(p) < 15:
                p = "Pas du tout"
            elif "plutôt" in p_low and "satisfaisant" in p_low:
                p = "Plutôt satisfaisant"
            elif "tout à fait" in p_low and "satisfaisant" in p_low:
                p = "Tout à fait satisfaisant"
            elif "excellent" in p_low and len(p) < 12:
                p = "Excellent"
            cleaned.append(p)
        # Dedup while preserving order
        seen = set()
        result = []
        for c in cleaned:
            if c.lower() not in seen:
                seen.add(c.lower())
                result.append(c)
        return result

    for ln in lines:
        # Title: pick explicit questionnaire title if present
        if data["title"] is None and "Questionnaire contextuel de mode de vie" in ln:
            data["title"] = "Questionnaire contextuel de mode de vie"
            continue
        if data["title"] is None and ln.strip():
            # fallback to first non-empty line
            data["title"] = ln.strip()
            continue
        if not ln:
            continue
        # Section (e.g., "Votre sommeil")
        if SECTION_RE.match(ln) and len(ln) > 3:
            start_section(re.sub(r"\s+", " ", ln).strip())
            continue
        # Option header that may precede a question line (due to OCR reordering)
        if is_option_header_like(ln) and current_question is None:
            pending_option_lines.append(ln)
            continue
        # Start of question: line ending with a question mark or typical French question lead-in
        if QUESTION_MARK_RE.search(ln) or QUESTION_START_RE.match(ln):
            start_question(re.sub(r"\s+", " ", ln).strip())
            continue
        # Question with leading number (fallback)
        m_q = QUESTION_NUM_RE.match(ln)
        if m_q:
            start_question(m_q.group(2))
            continue
        # Bullet option
        m_b = BULLET_RE.match(ln)
        if m_b and current_question is not None:
            opt = m_b.group(2).strip()
            # strip trailing isolated digits commonly mis-OCR'd as inline scores
            opt = re.sub(r"\s+[0-9]+\s*$", "", opt).strip()
            if opt and len(opt) > 2:
                current_question["rawOptions"].append(opt)
                current_question["options"].append(opt)
            continue
        # If we are within a question, collect option lines until a breaker
        if current_question is not None:
            if is_breaker(ln):
                # End of options block
                continue
            # Option-like lines within a question: split into tokens
            if is_option_header_like(ln):
                for opt in split_options(ln):
                    current_question["rawOptions"].append(opt)
                    current_question["options"].append(opt)
                continue
            # Heuristic: treat short non-empty lines (that don't look like sections) as options, but avoid numeric-only rows
            if not SECTION_RE.match(ln) and not is_numeric_row(ln):
                txt = re.sub(r"\s+[0-9]+\s*$", "", ln).strip("- •–*").strip()
                if txt and len(txt) > 2 and txt != current_question["label"] and not txt.lower().startswith("votre score"):
                    current_question["options"].append(txt)
                continue
        else:
            # If not inside a question and see a likely options header, buffer it
            if is_option_header_like(ln):
                pending_option_lines.append(ln)
                continue
        # Otherwise ignore line

    # finalize
    if current_question and current_section:
        current_section["questions"].append(current_question)
    if current_section:
        data["sections"].append(current_section)
    return data


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True, help="PDF or TXT path")
    ap.add_argument("--outdir", required=True, help="Output directory for JSON")
    args = ap.parse_args()

    inp = Path(args.input)
    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    text = read_text(inp)
    lines = normalize_lines(text)
    data = parse_text(lines)

    slug = slugify(inp.stem)
    out = outdir / f"{slug}.json"
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Written: {out}")

if __name__ == "__main__":
    main()
