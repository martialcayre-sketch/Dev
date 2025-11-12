# 🔤 Spell Checker - Gestion du Français

## 📊 État Actuel

- **Fichiers vérifiés**: 290
- **Alertes restantes**: 5 266 (réduction de 80% depuis 26 481)
- **Fichiers avec erreurs**: 147

## 🛠 Outils Disponibles

### Commandes NPM

```bash
# Vérifier l'orthographe
pnpm run spellcheck

# Voir les statistiques
pnpm run spellcheck:stats

# Voir les mots non reconnus (top 50)
pnpm run spellcheck:words

# Ajouter un mot au dictionnaire
pnpm run spellcheck:add [mot]
```

### Script Helper

```bash
# Aide complète
./scripts/spellcheck-helper.sh help

# Statistiques détaillées
./scripts/spellcheck-helper.sh stats

# Mots non reconnus
./scripts/spellcheck-helper.sh words

# Ajouter un mot
./scripts/spellcheck-helper.sh add "migrer"
```

## 📝 Configuration

### Fichiers Clés

- `cspell.json` - Configuration principale
- `cspell-custom-dictionary.txt` - Dictionnaire personnalisé (300+ mots)
- `scripts/spellcheck-helper.sh` - Utilitaire de gestion

### Langues Supportées

- ✅ Français (`fr-FR`)
- ✅ Anglais (`en`)

### Fichiers Ignorés

- Tests e2e
- Questionnaires auto-générés
- Build artifacts (dist, build, .turbo)
- Assets (images, fonts)
- Package-lock files

## 🎯 Prochaines Étapes

### 1. Finaliser le Dictionnaire (Recommandé)

Les mots les plus fréquents à ajouter :

```bash
# Mots techniques tronqués - à compléter
pnpm run spellcheck:add "activité"
pnpm run spellcheck:add "alimentation"
pnpm run spellcheck:add "allonger"
pnpm run spellcheck:add "août"

# Noms propres/techniques
pnpm run spellcheck:add "Appsmith"   # Outil no-code
pnpm run spellcheck:add "Asberg"     # Échelle psychiatrique
pnpm run spellcheck:add "asthme"     # Condition médicale
```

### 2. Ignorer les Fichiers Spécialisés (Optionnel)

Si trop de faux positifs dans certains fichiers :

```json
// Dans cspell.json, ajouter à "ignorePaths"
"**/questionnaires/**/*.md",
"**/data/questionnaires/**"
```

### 3. Configuration par Fichier (Avancé)

Pour des fichiers spécifiques :

```typescript
// En tête de fichier .ts/.js
/* cspell:disable */
// ou
/* cspell:words migrer praticien anamnèse */
```

## 🔧 Workflow de Maintenance

### Workflow Quotidien

1. `pnpm run spellcheck:stats` - Vérifier l'état
2. `pnpm run spellcheck:words` - Identifier nouveaux mots
3. `pnpm run spellcheck:add [mot]` - Ajouter mots légitimes

### Workflow de Révision

1. Examiner les mots les plus fréquents
2. Valider qu'ils sont corrects en français
3. Les ajouter en masse si nécessaire

## 🚀 Objectif Cible

- **5 000 alertes** → **< 1 000 alertes**
- Accent sur la qualité du contenu français
- Balance entre précision et productivité

## 📈 Historique des Améliorations

| Date            | Alertes     | Action                        |
| --------------- | ----------- | ----------------------------- |
| Initial         | 26 481      | Configuration de base         |
| + Dict FR       | 5 478       | Dictionnaire français médical |
| + Mots courants | 5 266       | Vocabulaire général français  |
| **Objectif**    | **< 1 000** | **Finalisation dictionnaire** |

---

## 💡 Conseils

- **Priorité** : Mots français légitimes et médicaux
- **Ignorer** : Acronymes techniques, noms de variables
- **Valider** : Orthographe française correcte avant ajout
- **Maintenir** : Dictionnaire trié et sans doublons (script automatique)

La configuration actuelle permet déjà un contrôle efficace du français dans votre application NeuroNutrition ! 🎉
