#!/usr/bin/env python3
"""
Convert the Mode de vie markdown structure to clean JSON for app integration.
Usage:
  python scripts/convert_mode_de_vie_to_json.py --input "data/questionnaires/raw/extracted/Mode de vie/questionnaire-mode-de-vie-structure.md" --output "data/questionnaires/generated/mode-de-vie-clean.json"
"""
import argparse
import json
import re
from pathlib import Path

def parse_markdown_to_json(md_content: str) -> dict:
    """Parse the markdown structure into a clean questionnaire JSON."""
    questionnaire = {
        "id": "mode-de-vie",
        "title": "Questionnaire contextuel de mode de vie",
        "category": "Mode de vie",
        "description": "Évaluez votre mode de vie sur 7 axes principaux",
        "sections": []
    }
    
    # Section mapping
    sections_map = {
        "1. SOMMEIL": {"id": "sommeil", "title": "Votre sommeil"},
        "2. RYTHME BIOLOGIQUE": {"id": "rythme-biologique", "title": "Votre rythme biologique"},
        "3. ADAPTATION ET STRESS": {"id": "adaptation-stress", "title": "Votre adaptation et le stress"},
        "4. ACTIVITÉ PHYSIQUE": {"id": "activite-physique", "title": "Votre activité physique"},
        "5. EXPOSITION AUX TOXIQUES": {"id": "exposition-toxiques", "title": "Votre exposition aux toxiques"},
        "6. RELATION AUX AUTRES": {"id": "relation-autres", "title": "Votre relation aux autres"},
        "7. MODE ALIMENTAIRE": {"id": "mode-alimentaire", "title": "Votre mode alimentaire"}
    }
    
    # Split into sections
    lines = md_content.split('\n')
    current_section = None
    current_question = None
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        
        # Detect section header
        for section_marker, section_info in sections_map.items():
            if stripped.startswith(f"## {section_marker}"):
                if current_section:
                    questionnaire["sections"].append(current_section)
                current_section = {
                    "id": section_info["id"],
                    "title": section_info["title"],
                    "questions": []
                }
                current_question = None
                break
        
        # Detect question (numbered line starting with digits and **)
        question_match = re.match(r'^(\d+)\.\s+\*\*(.+?)\*\*', stripped)
        if question_match and current_section:
            q_num = question_match.group(1)
            q_label = question_match.group(2).strip()
            
            # Create question ID
            q_id = re.sub(r'[^a-z0-9]+', '_', q_label.lower()).strip('_')
            
            current_question = {
                "id": f"{current_section['id']}_{q_id}",
                "label": q_label,
                "type": "select",
                "options": [],
                "points": []
            }
            current_section["questions"].append(current_question)
        
        # Detect option (line with "   - " at start, including indentation)
        # Match lines like "   - Non-fumeur (10 pts)"
        option_match = re.match(r'^\s*-\s+(.+?)\s+\((\d+)\s+pts?\)\s*$', line)
        if option_match and current_question:
            option_text = option_match.group(1).strip()
            points = int(option_match.group(2))
            
            current_question["options"].append(f"{option_text} ({points} pts)")
            current_question["points"].append(points)
    
    # Add last section
    if current_section:
        questionnaire["sections"].append(current_section)
    
    return questionnaire

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True, help="Path to markdown file")
    ap.add_argument("--output", required=True, help="Path to output JSON file")
    args = ap.parse_args()
    
    inp = Path(args.input)
    out = Path(args.output)
    
    md_content = inp.read_text(encoding='utf-8')
    data = parse_markdown_to_json(md_content)
    
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    
    # Print summary
    total_questions = sum(len(s["questions"]) for s in data["sections"])
    print(f"\n✅ JSON généré: {out}")
    print(f"📊 Sections: {len(data['sections'])}")
    print(f"📝 Questions: {total_questions}")
    
    for section in data["sections"]:
        print(f"   - {section['title']}: {len(section['questions'])} questions")

if __name__ == "__main__":
    main()
