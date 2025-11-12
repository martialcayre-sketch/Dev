#!/bin/bash

# Script d'apprentissage automatique du dictionnaire français
# Traite les alertes spellcheck par batch avec validation

DICT_FILE="cspell-custom-dictionary.txt"
TEMP_WORDS="/tmp/spellcheck_words.txt"
BACKUP_DIR="./scripts/dictionary-backups"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

show_help() {
    echo -e "${BLUE}🔤 Script d'apprentissage automatique du dictionnaire français${NC}"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  extract [limit]     - Extraire les mots uniques (défaut: 50)"
    echo "  learn [limit]       - Apprendre automatiquement les mots français"
    echo "  validate [file]     - Valider manuellement une liste de mots"
    echo "  backup             - Sauvegarder le dictionnaire actuel"
    echo "  stats              - Afficher les statistiques"
    echo "  help               - Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 extract 100      # Extraire 100 mots uniques"
    echo "  $0 learn 50         # Apprendre 50 mots automatiquement"
    echo "  $0 validate words.txt # Valider une liste de mots"
    echo ""
    echo -e "${YELLOW}💡 Conseils:${NC}"
    echo "- Commencez par extract pour voir les mots"
    echo "- Utilisez learn avec limite pour contrôler l'apprentissage"
    echo "- Validez manuellement les mots techniques/anglais"
}

backup_dictionary() {
    echo -e "${BLUE}💾 Sauvegarde du dictionnaire...${NC}"
    mkdir -p "$BACKUP_DIR"
    local backup_file="$BACKUP_DIR/dict-backup-$(date +%Y%m%d-%H%M%S).txt"
    cp "$DICT_FILE" "$backup_file"
    echo -e "${GREEN}✅ Sauvegardé: $backup_file${NC}"
}

get_current_stats() {
    echo -e "${BLUE}📊 Statistiques actuelles:${NC}"
    local result=$(pnpm run spellcheck 2>&1 | grep "Issues found")
    echo "$result"
    
    local errors=$(echo "$result" | sed -n 's/.*Issues found: \([0-9]*\).*/\1/p')
    local files=$(echo "$result" | sed -n 's/.*Files checked: \([0-9]*\).*/\1/p')
    
    echo "📝 Mots dans le dictionnaire: $(wc -l < "$DICT_FILE")"
    echo "🗂️  Fichiers vérifiés: $files"
    echo "⚠️  Alertes restantes: $errors"
    
    return $errors
}

extract_unique_words() {
    local limit=${1:-50}
    echo -e "${BLUE}🔍 Extraction des mots uniques (limite: $limit)...${NC}"
    
    # Extraire tous les mots non reconnus
    pnpm run spellcheck 2>/dev/null | \
    grep "Unknown word" | \
    sed -n 's/.*Unknown word (\([^)]*\)).*/\1/p' | \
    sort | uniq -c | sort -nr | \
    head -$limit > "$TEMP_WORDS"
    
    echo -e "${GREEN}📋 Top $limit mots les plus fréquents:${NC}"
    echo "Format: [occurrences] mot"
    cat "$TEMP_WORDS"
    
    echo ""
    echo -e "${YELLOW}💡 Fichier sauvé: $TEMP_WORDS${NC}"
    echo "Examinez les mots avant l'apprentissage automatique"
}

is_french_word() {
    local word="$1"
    
    # Critères pour identifier un mot français
    # 1. Contient des accents français
    if echo "$word" | grep -q '[àâäéèêëïîôöùûüÿñç]'; then
        return 0
    fi
    
    # 2. Terminaisons françaises courantes
    if echo "$word" | grep -Eq '(tion|sion|ment|ance|ence|ique|able|ible|eux|euse|ais|ait|ent|ant|oir|oire|age|ure|ude|ide|ade|ée|és|er|ir|re)$'; then
        return 0
    fi
    
    # 3. Préfixes français
    if echo "$word" | grep -Eq '^(pré|anti|inter|super|micro|macro|multi|auto|dé|re|sur|sous|co|ex|non)'; then
        return 0
    fi
    
    # 4. Mots courts probablement français (à éviter les acronymes)
    if [ ${#word} -ge 4 ] && [ ${#word} -le 15 ] && echo "$word" | grep -q '^[a-zàâäéèêëïîôöùûüÿñç]*$'; then
        # Éviter les mots tout en majuscules ou avec des chiffres
        if ! echo "$word" | grep -q '[A-Z0-9]'; then
            return 0
        fi
    fi
    
    return 1
}

learn_words_auto() {
    local limit=${1:-50}
    echo -e "${BLUE}🎓 Apprentissage automatique (limite: $limit mots)...${NC}"
    
    # Sauvegarder avant modifications
    backup_dictionary
    
    # Extraire les mots
    extract_unique_words $((limit * 2)) # Plus de mots pour filtrer
    
    local learned=0
    local skipped=0
    local already_exists=0
    
    echo -e "${YELLOW}🔍 Analyse et apprentissage en cours...${NC}"
    
    while read -r count word && [ $learned -lt $limit ]; do
        # Nettoyer le mot
        word=$(echo "$word" | tr -d '[:space:]' | tr '[:upper:]' '[:lower:]')
        
        # Ignorer les mots vides ou trop courts
        if [ ${#word} -lt 3 ]; then
            continue
        fi
        
        # Vérifier si déjà dans le dictionnaire
        if grep -q "^$word$" "$DICT_FILE"; then
            ((already_exists++))
            continue
        fi
        
        # Vérifier si c'est un mot français probable
        if is_french_word "$word"; then
            echo "$word" >> "$DICT_FILE"
            echo -e "${GREEN}✅ Appris: $word (${count} occurrences)${NC}"
            ((learned++))
        else
            echo -e "${YELLOW}⏭️  Ignoré: $word (non-français probable)${NC}"
            ((skipped++))
        fi
    done < "$TEMP_WORDS"
    
    # Trier le dictionnaire
    sort -u "$DICT_FILE" -o "$DICT_FILE"
    
    echo ""
    echo -e "${BLUE}📈 Résultats de l'apprentissage:${NC}"
    echo "✅ Mots appris: $learned"
    echo "⏭️  Mots ignorés: $skipped"
    echo "🔄 Déjà présents: $already_exists"
    
    echo ""
    echo -e "${GREEN}🎯 Test du dictionnaire mis à jour...${NC}"
    get_current_stats
}

validate_words_manual() {
    local word_file=${1:-$TEMP_WORDS}
    
    if [ ! -f "$word_file" ]; then
        echo -e "${RED}❌ Fichier non trouvé: $word_file${NC}"
        echo "Exécutez d'abord: $0 extract"
        return 1
    fi
    
    echo -e "${BLUE}🔍 Validation manuelle des mots...${NC}"
    echo -e "${YELLOW}Pour chaque mot: [o]ui, [n]on, [q]uitter${NC}"
    echo ""
    
    backup_dictionary
    
    local added=0
    
    while read -r count word; do
        word=$(echo "$word" | tr -d '[:space:]' | tr '[:upper:]' '[:lower:]')
        
        if grep -q "^$word$" "$DICT_FILE"; then
            echo -e "${YELLOW}⏭️  '$word' déjà dans le dictionnaire${NC}"
            continue
        fi
        
        echo -n -e "${BLUE}Ajouter '$word' (${count} occurrences) ? [o/n/q]: ${NC}"
        read -n 1 choice
        echo
        
        case $choice in
            o|O|y|Y)
                echo "$word" >> "$DICT_FILE"
                echo -e "${GREEN}✅ Ajouté: $word${NC}"
                ((added++))
                ;;
            q|Q)
                echo -e "${YELLOW}🛑 Arrêt demandé${NC}"
                break
                ;;
            *)
                echo -e "${RED}❌ Ignoré: $word${NC}"
                ;;
        esac
    done < "$word_file"
    
    # Trier le dictionnaire
    sort -u "$DICT_FILE" -o "$DICT_FILE"
    
    echo ""
    echo -e "${GREEN}📈 $added mots ajoutés manuellement${NC}"
    get_current_stats
}

# Script principal
case "$1" in
    "extract")
        extract_unique_words "$2"
        ;;
    "learn")
        learn_words_auto "$2"
        ;;
    "validate")
        validate_words_manual "$2"
        ;;
    "backup")
        backup_dictionary
        ;;
    "stats")
        get_current_stats
        ;;
    "help"|"--help"|"-h"|"")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Commande inconnue: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac