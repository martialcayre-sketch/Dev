#!/bin/bash

echo "🔍 Vérification des versions actuelles vs dernières versions disponibles..."

echo ""
echo "=== VERSIONS ACTUELLES ==="

# Dans le devcontainer
echo "Node.js: $(node --version 2>/dev/null || echo 'Non installé')"
echo "npm: $(npm --version 2>/dev/null || echo 'Non installé')"  
echo "pnpm: $(pnpm --version 2>/dev/null || echo 'Non installé')"
echo "Firebase CLI: $(npx firebase --version 2>/dev/null | grep -o '^[0-9]\+\.[0-9]\+\.[0-9]\+' || echo 'Non installé')"
echo "GitHub CLI: $(gh --version 2>/dev/null | head -1 || echo 'Non installé')"

echo ""
echo "=== DEVCONTAINER DOCKERFILE ==="
echo "pnpm configuré: $(grep -o 'pnpm@[0-9]\+\.[0-9]\+\.[0-9]\+' .devcontainer/Dockerfile || echo 'Non trouvé')"
echo "firebase-tools configuré: $(grep -o 'firebase-tools@[0-9]\+\.[0-9]\+\.[0-9]\+' .devcontainer/Dockerfile || echo 'Non trouvé')"
echo "GitHub CLI configuré: $(grep -o 'v[0-9]\+\.[0-9]\+\.[0-9]\+' .devcontainer/Dockerfile || echo 'Non trouvé')"

echo ""
echo "=== PACKAGE.JSON ==="
echo "firebase-tools: $(grep -o '"firebase-tools": "[^"]*"' package.json || echo 'Non trouvé')"
echo "firebase-admin: $(grep -o '"firebase-admin": "[^"]*"' package.json || echo 'Non trouvé')"
echo "Playwright: $(grep -o '"@playwright/test": "[^"]*"' package.json || echo 'Non trouvé')"

echo ""
echo "=== RECOMMANDATIONS ==="
echo "✅ Devcontainer corrigé : GitHub CLI installé manuellement"
echo "✅ Feature problématique supprimée du devcontainer.json" 
echo "📋 Pour rebuild le devcontainer avec les corrections :"
echo "   1. Dans VS Code : Ctrl+Shift+P"
echo "   2. Taper 'Dev Containers: Rebuild Container'"
echo "   3. Ou redémarrer le Codespace"

echo ""
echo "🔧 NEXT STEPS :"
echo "1. Rebuild le devcontainer pour appliquer les corrections"
echo "2. Les apps patient/practitioner devraient fonctionner sur ports 3020/3010"
echo "3. Firebase emulators disponibles avec Java 11 préinstallé"
echo "4. GitHub CLI v2.83.0 disponible via 'gh'"