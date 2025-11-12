# Script pour vérifier quelle branche est la plus récente
# Usage: .\scripts\check-latest-branch.ps1

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Analyse des branches - Par date de dernier commit" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Récupérer les dernières informations des branches
Write-Host "Récupération des informations des branches..." -ForegroundColor Gray
git fetch --all --quiet 2>$null

Write-Host "📊 Top 10 des branches les plus récentes:" -ForegroundColor Yellow
Write-Host ""

# Obtenir les branches triées par date
$branches = git for-each-ref --sort=-committerdate refs/remotes/origin/ --format='%(committerdate:short)|%(refname:short)|%(subject)' | Select-Object -First 10

foreach ($branch in $branches) {
    $parts = $branch -split '\|'
    $date = $parts[0]
    $name = $parts[1]
    $subject = $parts[2]
    Write-Host "  $date " -NoNewline -ForegroundColor Green
    Write-Host "$name" -NoNewline -ForegroundColor Cyan
    Write-Host " - $subject" -ForegroundColor Gray
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Comparaison avec la branche main:" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Obtenir la date du dernier commit sur main
$mainDate = git log -1 --format='%ci' origin/main 2>$null
$mainSubject = git log -1 --format='%s' origin/main 2>$null

Write-Host "📌 Branche main:" -ForegroundColor Yellow
Write-Host "   Date: $mainDate" -ForegroundColor White
Write-Host "   Commit: $mainSubject" -ForegroundColor Gray
Write-Host ""

# Trouver la branche la plus récente (excluant HEAD)
$latestBranch = git for-each-ref --sort=-committerdate refs/remotes/origin/ --format='%(refname:short)' | Where-Object { $_ -notlike '*HEAD*' } | Select-Object -First 1
$latestDate = git log -1 --format='%ci' $latestBranch 2>$null
$latestSubject = git log -1 --format='%s' $latestBranch 2>$null

Write-Host "🏆 Branche la plus récente:" -ForegroundColor Yellow
Write-Host "   Nom: $latestBranch" -ForegroundColor Cyan
Write-Host "   Date: $latestDate" -ForegroundColor White
Write-Host "   Commit: $latestSubject" -ForegroundColor Gray
Write-Host ""

# Comparer les branches
if ($latestBranch -eq "origin/main") {
    Write-Host "✅ La branche main est à jour!" -ForegroundColor Green
} else {
    Write-Host "⚠️  La branche main n'est pas la plus récente." -ForegroundColor Yellow
    Write-Host "   La branche '$latestBranch' a des commits plus récents." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
