param(
  [string]$InputDir = "c:/Dev/data/questionnaires/raw",
  [string]$OutputDir = "c:/Dev/data/questionnaires/ocr",
  [string]$Lang = "fra",
  [int]$Jobs = 4
)

# This script batch-runs OCRmyPDF on all PDFs under $InputDir and mirrors the structure in $OutputDir.
# Requirements (Windows):
# - Python 3.10+
# - Tesseract OCR installed (add to PATH): https://github.com/UB-Mannheim/tesseract/wiki
# - Ghostscript installed (for OCRmyPDF): https://ghostscript.com/releases/gsdnld.html
# - OCRmyPDF: pip install ocrmypdf
# Verify: python -m ocrmypdf --version

Write-Host "\n=== OCR batch start ===" -ForegroundColor Cyan
Write-Host "Input:  $InputDir" -ForegroundColor White
Write-Host "Output: $OutputDir" -ForegroundColor White

if (-not (Test-Path $InputDir)) {
  Write-Host "Input directory not found: $InputDir" -ForegroundColor Red
  exit 1
}

if (-not (Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$pdfs = Get-ChildItem -Path $InputDir -Recurse -Filter *.pdf
if (-not $pdfs) {
  Write-Host "No PDFs found under $InputDir" -ForegroundColor Yellow
  exit 0
}

$ok = 0
$err = 0
foreach ($pdf in $pdfs) {
  $rel = Resolve-Path -Path $pdf.FullName -Relative -RelativeBasePath $InputDir 2>$null
  if (-not $rel) {
    $rel = $pdf.FullName.Substring($InputDir.Length).TrimStart('\\','/')
  }
  $outPath = Join-Path $OutputDir $rel
  $outDir = Split-Path $outPath -Parent
  if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }

  try {
    Write-Host "OCR: $rel" -ForegroundColor Green
    # Set TESSDATA_PREFIX for OCRmyPDF to find language data
    $env:TESSDATA_PREFIX = "C:/Dev/tessdata"
    # Use python -m to avoid PATH issues
    $ocrArgs = @(
      "-m", "ocrmypdf",
      "--language", "fra",
      "--skip-text",  # Skip pages that already have text
      "--output-type", "pdf",
      "--tesseract-timeout", "300",  # 5 minutes per page
      "-j", "1",  # Single thread to avoid conflicts
      $pdf.FullName,
      $outPath
    )
    python $ocrArgs
    if ($LASTEXITCODE -eq 0) { $ok++ } else { $err++; Write-Host "Failed: $rel" -ForegroundColor Red }
  } catch {
    $err++
    Write-Host ("Error OCR-ing {0}: {1}" -f $rel, $_) -ForegroundColor Red
  }
}

Write-Host "\nDone. OK=$ok ERR=$err" -ForegroundColor Cyan
