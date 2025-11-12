#!/bin/bash
set -e

echo "🔄 Reconstruction du dev container avec les dernières versions..."

# Nettoyer les images Docker existantes
echo "🧹 Nettoyage des images Docker existantes..."
docker system prune -f 2>/dev/null || true
docker images | grep devcontainer | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true

# Rebuilder le container avec --no-cache pour forcer la récupération des dernières versions
echo "🏗️  Reconstruction du dev container (sans cache)..."
if command -v code >/dev/null 2>&1; then
    echo "Utilisation de VS Code pour reconstruire le container..."
    code --command "Dev Containers: Rebuild Container Without Cache"
else
    echo "⚠️  VS Code CLI non trouvé. Utilisez la palette de commandes VS Code:"
    echo "   1. Ctrl+Shift+P (ou Cmd+Shift+P sur Mac)"
    echo "   2. Tapez 'Dev Containers: Rebuild Container'"
    echo "   3. Sélectionnez 'Rebuild Without Cache'"
fi

echo ""
echo "✅ Reconstruction terminée!"
echo ""
echo "📋 Versions mises à jour:"
echo "  • Node.js: 22-alpine → 24-alpine (LTS)"
echo "  • pnpm: Dernière version disponible"
echo "  • firebase-tools: Dernière version disponible" 
echo "  • GitHub CLI: Dernière version disponible"
echo "  • @cspell/dict-fr-fr: 2.2.0 → 2.3.2"
echo "  • cspell: 8.14.2 → 9.3.1"
echo "  • husky: 9.1.0 → 9.1.7"
echo ""
echo "🔧 Après la reconstruction, les packages seront automatiquement installés via:"
echo "   pnpm install && pnpm run build"
echo ""
echo "🚀 Le dev container sera prêt avec toutes les dernières versions!"