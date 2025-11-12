#!/bin/bash

# Script pour gérer les mots non reconnus par le spell checker
# Usage: ./scripts/spellcheck-helper.sh [command]

DICT_FILE="cspell-custom-dictionary.txt"

show_help() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  check           - Afficher les mots non reconnus"
    echo "  add [mot]       - Ajouter un mot au dictionnaire"
    echo "  words           - Afficher les mots non reconnus uniques"
    echo "  stats           - Afficher les statistiques"
    echo "  help            - Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 check                    # Voir les erreurs"
    echo "  $0 add 'migrer'            # Ajouter un mot"
    echo "  $0 words                    # Voir les mots uniques"
}

check_spelling() {
    echo "🔍 Vérification du spell checking..."
    pnpm run spellcheck
}

get_unknown_words() {
    echo "📝 Extraction des mots non reconnus..."
    pnpm run spellcheck 2>/dev/null | grep "Unknown word" | 
    sed -n 's/.*Unknown word (\([^)]*\)).*/\1/p' | 
    sort -u | 
    head -50
}

add_word() {
    if [ -z "$1" ]; then
        echo "❌ Erreur: Veuillez spécifier un mot à ajouter"
        echo "Usage: $0 add [mot]"
        return 1
    fi
    
    local word="$1"
    echo "➕ Ajout du mot '$word' au dictionnaire..."
    
    # Vérifier si le mot existe déjà
    if grep -q "^$word$" "$DICT_FILE"; then
        echo "⚠️  Le mot '$word' existe déjà dans le dictionnaire"
        return 1
    fi
    
    # Ajouter le mot
    echo "$word" >> "$DICT_FILE"
    echo "✅ Mot '$word' ajouté avec succès"
    
    # Trier le fichier pour maintenir l'ordre
    sort -u "$DICT_FILE" -o "$DICT_FILE"
    echo "📝 Dictionnaire trié et sauvegardé"
}

show_stats() {
    echo "📊 Statistiques du spell checker..."
    echo ""
    
    # Compter les fichiers vérifiés
    local result=$(pnpm run spellcheck 2>&1 | grep "Files checked")
    echo "$result"
    
    # Extraire le nombre d'erreurs
    local errors=$(echo "$result" | sed -n 's/.*Issues found: \([0-9]*\).*/\1/p')
    
    if [ -n "$errors" ] && [ "$errors" -gt 0 ]; then
        echo ""
        echo "🔧 Suggestions pour réduire les alertes:"
        echo "   1. Exécuter: $0 words"
        echo "   2. Identifier les mots français légitimes"
        echo "   3. Les ajouter avec: $0 add [mot]"
        echo ""
        echo "💡 Mots les plus fréquents:"
        get_unknown_words | head -10
    else
        echo "✅ Aucune erreur de spell checking trouvée !"
    fi
}

case "$1" in
    "check")
        check_spelling
        ;;
    "add")
        add_word "$2"
        ;;
    "words")
        get_unknown_words
        ;;
    "stats")
        show_stats
        ;;
    "help"|"--help"|"-h"|"")
        show_help
        ;;
    *)
        echo "❌ Commande inconnue: $1"
        echo ""
        show_help
        exit 1
        ;;
esac