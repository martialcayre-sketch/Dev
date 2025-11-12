#!/bin/bash
# Script pour vérifier quelle branche est la plus récente
# Usage: ./scripts/check-latest-branch.sh

echo "=================================================="
echo "Analyse des branches - Par date de dernier commit"
echo "=================================================="
echo ""

# Récupérer les dernières informations des branches
git fetch --all --quiet 2>/dev/null

echo "📊 Top 10 des branches les plus récentes:"
echo ""
git for-each-ref --sort=-committerdate refs/remotes/origin/ --format='%(committerdate:short) %(color:green)%(refname:short)%(color:reset) - %(subject)' | head -10

echo ""
echo "=================================================="
echo "Comparaison avec la branche main:"
echo "=================================================="
echo ""

# Obtenir la date du dernier commit sur main
MAIN_DATE=$(git log -1 --format='%ci' origin/main 2>/dev/null)
MAIN_SUBJECT=$(git log -1 --format='%s' origin/main 2>/dev/null)

echo "📌 Branche main:"
echo "   Date: $MAIN_DATE"
echo "   Commit: $MAIN_SUBJECT"
echo ""

# Trouver la branche la plus récente (excluant HEAD)
LATEST_BRANCH=$(git for-each-ref --sort=-committerdate refs/remotes/origin/ --format='%(refname:short)' | grep -v 'HEAD' | head -1)
LATEST_DATE=$(git log -1 --format='%ci' "$LATEST_BRANCH" 2>/dev/null)
LATEST_SUBJECT=$(git log -1 --format='%s' "$LATEST_BRANCH" 2>/dev/null)

echo "🏆 Branche la plus récente:"
echo "   Nom: $LATEST_BRANCH"
echo "   Date: $LATEST_DATE"
echo "   Commit: $LATEST_SUBJECT"
echo ""

# Comparer les dates
if [ "$LATEST_BRANCH" = "origin/main" ]; then
    echo "✅ La branche main est à jour!"
else
    echo "⚠️  La branche main n'est pas la plus récente."
    echo "   La branche '$LATEST_BRANCH' a des commits plus récents."
fi

echo ""
echo "=================================================="
