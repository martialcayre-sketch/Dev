# Script pour approuver rapidement un praticien en dev
# Usage: .\scripts\approve-practitioner-dev.ps1 -Email "john@example.com"

param(
    [Parameter(Mandatory=$true)]
    [string]$Email
)

Write-Host "🔍 Approbation du praticien: $Email" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Étapes:"
Write-Host "   1. Ouvrir l'Emulator UI: http://localhost:5000" -ForegroundColor Gray
Write-Host "   2. Aller dans Firestore > practitioners" -ForegroundColor Gray
Write-Host "   3. Trouver le document avec email = $Email" -ForegroundColor Gray
Write-Host "   4. Modifier le champ 'status' de 'pending_approval' à 'approved'" -ForegroundColor Gray
Write-Host "   5. Ajouter un champ 'approvedAt' avec la date actuelle" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Alternative: Utiliser le script Node.js" -ForegroundColor Yellow
Write-Host "   node scripts/approve-practitioner-dev.mjs $Email" -ForegroundColor Gray
Write-Host ""

# Ouvrir l'Emulator UI automatiquement
$response = Read-Host "Voulez-vous ouvrir l'Emulator UI maintenant? (O/N)"
if ($response -eq "O" -or $response -eq "o") {
    Start-Process "http://localhost:5000"
    Write-Host "✅ Emulator UI ouvert dans le navigateur" -ForegroundColor Green
}
