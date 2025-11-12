#!/bin/bash
# Healthcheck script pour le dev container

set -e

# Vérifier que Node.js fonctionne
if ! node --version >/dev/null 2>&1; then
    echo "❌ Node.js non disponible"
    exit 1
fi

# Vérifier pnpm
if ! pnpm --version >/dev/null 2>&1; then
    echo "❌ pnpm non disponible"
    exit 1
fi

# Vérifier firebase CLI
if ! firebase --version >/dev/null 2>&1; then
    echo "❌ Firebase CLI non disponible"
    exit 1
fi

# Vérifier GitHub CLI
if ! gh --version >/dev/null 2>&1; then
    echo "❌ GitHub CLI non disponible"  
    exit 1
fi

# Vérifier la mémoire disponible
MEMORY_AVAILABLE=$(free -m | awk 'NR==2{printf "%.1f", $7/$2*100 }')
if (( $(echo "$MEMORY_AVAILABLE < 10" | bc -l) )); then
    echo "⚠️ Mémoire faible: ${MEMORY_AVAILABLE}% disponible"
fi

echo "✅ Dev container sain - Tous les outils fonctionnels"
exit 0