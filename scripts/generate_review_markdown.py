#!/usr/bin/env python3
"""
Generate a human-readable markdown review from parsed questionnaire JSON.
Usage:
  python scripts/generate_review_markdown.py --input "data/questionnaires/generated/questionnaire-contextuel-mode-de-vie-pro-def.json" --output "data/questionnaires/generated/mode-de-vie-review.md"
"""
import argparse
import json
from pathlib import Path

def generate_markdown(data: dict) -> str:
    lines = []
    lines.append(f"# {data.get('title', 'Questionnaire')}\n")
    lines.append(f"**Total sections:** {len(data.get('sections', []))}\n")
    
    total_questions = sum(len(s.get('questions', [])) for s in data.get('sections', []))
    lines.append(f"**Total questions:** {total_questions}\n")
    lines.append("\n---\n")
    
    for i, section in enumerate(data.get('sections', []), start=1):
        title = section.get('title', 'Sans titre')
        questions = section.get('questions', [])
        lines.append(f"\n## Section {i}: {title}\n")
        lines.append(f"**Questions:** {len(questions)}\n")
        
        if not questions:
            lines.append("*(Aucune question détectée)*\n")
            continue
        
        for j, q in enumerate(questions, start=1):
            label = q.get('label', '')
            opts = q.get('options', [])
            lines.append(f"\n### Question {i}.{j}\n")
            lines.append(f"**Label:** {label}\n")
            lines.append(f"**Type:** {q.get('type', 'select')}\n")
            lines.append(f"**ID:** `{q.get('id', '')}`\n")
            lines.append(f"\n**Options ({len(opts)}):**\n")
            if opts:
                for opt in opts:
                    lines.append(f"- {opt}\n")
            else:
                lines.append("*(Aucune option détectée)*\n")
    
    lines.append("\n---\n")
    lines.append("\n## Résumé\n")
    lines.append(f"- **Sections avec questions:** {sum(1 for s in data.get('sections', []) if s.get('questions'))}\n")
    lines.append(f"- **Questions totales:** {total_questions}\n")
    lines.append(f"- **Questions sans options:** {sum(1 for s in data.get('sections', []) for q in s.get('questions', []) if not q.get('options'))}\n")
    
    return "".join(lines)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True, help="Path to JSON file")
    ap.add_argument("--output", required=True, help="Path to output markdown file")
    args = ap.parse_args()
    
    inp = Path(args.input)
    out = Path(args.output)
    
    data = json.loads(inp.read_text(encoding='utf-8'))
    md = generate_markdown(data)
    
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(md, encoding='utf-8')
    print(f"✅ Review generated: {out}")

if __name__ == "__main__":
    main()
