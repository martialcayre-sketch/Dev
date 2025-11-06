# Import des questionnaires (OCR + Parsing)

Objectif: extraire automatiquement le texte des 128 PDFs (questionnaires SIIN), reconstruire les questions + consignes + systèmes de réponse, puis générer un JSON exploitable par l'app.

## Vue d'ensemble

1. OCR des PDFs pour rendre le texte sélectionnable (si scannés/formulaires)
2. Extraction du texte page par page
3. Parsing heuristique des sections/questions/options (détection des points)
4. Validation manuelle (relecture et corrections)
5. Génération des fichiers JSON/TS pour l'app

## Pré-requis Windows

- Python 3.10+
- Tesseract OCR (UB Mannheim): <https://github.com/UB-Mannheim/tesseract/wiki>
- Ghostscript: <https://ghostscript.com/releases/gsdnld.html>
- OCRmyPDF: `pip install ocrmypdf`

Optionnel (parser PDF): `pip install pdfplumber`

## 1) OCR batch

Script: `scripts/ocr_batch.ps1`

Exemple:

```powershell
# OCR de toute la bibliothèque
pwsh ./scripts/ocr_batch.ps1 -InputDir "c:/Dev/data/questionnaires/raw" -OutputDir "c:/Dev/data/questionnaires/ocr" -Lang fra -Jobs 4
```

Le script crée un miroir de la structure en sortie.

## 2) Parsing

Script: `scripts/parse_questionnaires.py`

Exemples:

```powershell
# À partir d'un PDF OCR
python scripts/parse_questionnaires.py --input "data/questionnaires/ocr/Mode de vie/questionnaire-contextuel-mode-de-vie-pro-def.pdf" --outdir data/questionnaires/generated

# À partir d'un TXT déjà extrait
python scripts/parse_questionnaires.py --input "data/questionnaires/raw/extracted/Mode de vie/questionnaire-contextuel-mode-de-vie-pro-def.txt" --outdir data/questionnaires/generated
```

Résultat: `data/questionnaires/generated/<slug>.json`

## 3) Validation manuelle

- Ouvrir le JSON et le comparer visuellement au PDF
- Vérifier: titres de sections, questions, options, ponctuation, parenthèses de points `(X pts)`
- Ajuster les types: `select`, `scale`, `number`, `textarea`, `multi-select` (si besoin)

## 4) Intégration dans l'app

- Convertir le JSON final en TypeScript dans `apps/patient-vite/src/questionnaires/`
- Respecter le format déjà utilisé par `alimentaire` et `dnsm`

## Conseils qualité

- Si l'OCR ajoute des erreurs (ponctuation, accents), relancer l'OCR avec `--optimize 1` (déjà activé), vérifier la langue `fra` et la qualité des scans.
- Pour les PDFs difficiles (tableaux, colonnes), envisager Google Document AI (Form Parser) comme fallback ciblé.
- Conserver une traçabilité: stocker PDF source + JSON généré + corrections manuelles.
