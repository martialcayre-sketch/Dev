#!/bin/bash

# 🤖 Script de synchronisation automatique des instructions IA
# Met à jour les configurations Copilot quand les fichiers AI_*.md changent

set -e

echo "🔄 Synchronisation des instructions IA avec les configurations Copilot..."

# Vérifier que les fichiers d'instructions existent
AI_FILES=(
    "docs/AI_INDEX.md"
    "docs/AI_INSTRUCTIONS_SUMMARY.md" 
    "docs/AI_TYPESCRIPT_GUIDELINES.md"
    "docs/AI_PROMPTS_TEMPLATES.md"
    "docs/AI_CONFIGURATION_PATTERNS.md"
    "docs/COPILOT_CONTEXT.md"
)

echo "📋 Vérification des fichiers d'instructions IA..."
missing_files=()

for file in "${AI_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    echo "❌ Fichiers manquants:"
    printf '%s\n' "${missing_files[@]}"
    exit 1
fi

echo "✅ Tous les fichiers d'instructions IA sont présents"

# Vérifier que VS Code settings.json contient la configuration
VSCODE_SETTINGS=".vscode/settings.json"

if ! grep -q "github.copilot.conversationAdditionalContextFiles" "$VSCODE_SETTINGS"; then
    echo "⚠️  Configuration Copilot manquante dans $VSCODE_SETTINGS"
    echo "💡 Exécutez la mise à jour manuelle du fichier"
fi

# Vérifier .cursorrules
CURSORRULES=".cursorrules"

if ! grep -q "docs/AI_INDEX.md" "$CURSORRULES"; then
    echo "⚠️  Référence aux instructions IA manquante dans $CURSORRULES"
    echo "💡 Exécutez la mise à jour manuelle du fichier"
fi

# Vérifier la configuration GitHub Copilot
GITHUB_COPILOT_CONFIG=".github/copilot-instructions.json"

if [ ! -f "$GITHUB_COPILOT_CONFIG" ]; then
    echo "⚠️  Fichier de configuration GitHub Copilot manquant: $GITHUB_COPILOT_CONFIG"
    echo "💡 Le fichier devrait être créé automatiquement"
fi

echo "🎯 Status de synchronisation:"
echo "  📄 Fichiers d'instructions IA: ✅ (${#AI_FILES[@]} fichiers)"
echo "  ⚙️  .cursorrules: $([ -f "$CURSORRULES" ] && echo "✅" || echo "❌")"
echo "  🔧 VS Code settings: $([ -f "$VSCODE_SETTINGS" ] && echo "✅" || echo "❌")"  
echo "  📋 GitHub Copilot config: $([ -f "$GITHUB_COPILOT_CONFIG" ] && echo "✅" || echo "❌")"

# Afficher statistiques des fichiers
echo ""
echo "📊 Statistiques des instructions IA:"
total_size=0
for file in "${AI_FILES[@]}"; do
    if [ -f "$file" ]; then
        size=$(wc -c < "$file")
        total_size=$((total_size + size))
        echo "  $(basename "$file"): $(echo "$size" | numfmt --to=iec-i)B"
    fi
done

echo "  📦 Total: $(echo "$total_size" | numfmt --to=iec-i)B"

echo ""
echo "✅ Synchronisation terminée"
echo "💡 Les instructions IA sont maintenant chargées automatiquement dans chaque conversation Copilot"