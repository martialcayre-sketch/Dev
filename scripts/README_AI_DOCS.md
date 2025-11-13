# 📚 Scripts de Documentation IA

Ce dossier contient les scripts pour maintenir la documentation des assistants IA à jour.

## Scripts disponibles

### `update-ai-docs.mjs`

Script principal de mise à jour automatique des fichiers de contexte IA.

**Utilisation manuelle :**

```bash
# Via npm script
pnpm update:ai-docs

# Directement
node scripts/update-ai-docs.mjs
```

**Utilisation automatique :**
Le script s'exécute automatiquement via le hook Git `pre-push` avant chaque push.

**Fichiers mis à jour :**

- `docs/CHATGPT_INSTRUCTIONS.md`
- `docs/COPILOT_CONTEXT.md`
- `PROJECT_CONTEXT.md`
- `.cursorrules`
- `.github/copilot-context.md`

**Informations mises à jour :**

- ✅ Date de dernière mise à jour
- ✅ Versions des packages (Node, pnpm, firebase-admin, etc.)
- ✅ Statistiques du projet

### Documentation complète

Voir [README_UPDATE_AI_DOCS.md](./README_UPDATE_AI_DOCS.md) pour :

- Guide d'utilisation détaillé
- Configuration et personnalisation
- Dépannage
- Bonnes pratiques

## Workflow Git Hook

Le hook `pre-push` (`.husky/pre-push`) effectue automatiquement :

1. ✅ Mise à jour des fichiers de contexte IA
2. ✅ Détection des changements
3. ✅ Ajout automatique au commit si nécessaire
4. ✅ Création d'un commit `[skip ci]` pour éviter les pipelines inutiles
5. ✅ Push des changements

**Exemple de sortie :**

```
🤖 Mise à jour des fichiers de contexte IA...

📊 Informations du projet:
   Date: 13 novembre 2025
   Node: 24.11.1
   pnpm: 10.22.0
   Packages workspace: 15
   Scripts de maintenance: 4

✅ Mis à jour: .cursorrules
✅ Mis à jour: .github/copilot-context.md

📝 Résumé:
   2/5 fichiers mis à jour

📝 Fichiers de contexte IA mis à jour
💡 Ajout automatique des changements au commit...
✅ Commit de mise à jour créé automatiquement
```

## Désactiver temporairement

Pour push sans exécuter le hook :

```bash
git push --no-verify origin main
```

⚠️ **Attention :** Utilisez cette option avec parcimonie pour ne pas désynchroniser la documentation.

## Support

En cas de problème, consulter [README_UPDATE_AI_DOCS.md](./README_UPDATE_AI_DOCS.md) section "Dépannage".
