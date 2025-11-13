# 🤖 Mise à jour automatique des docs IA

## Vue d'ensemble

Le système de mise à jour automatique des fichiers de contexte IA garantit que les assistants IA (ChatGPT, GitHub Copilot, Cursor) disposent toujours d'informations à jour sur le projet.

## Fichiers concernés

Les fichiers suivants sont automatiquement mis à jour :

1. `docs/CHATGPT_INSTRUCTIONS.md`
2. `docs/COPILOT_CONTEXT.md`
3. `PROJECT_CONTEXT.md`
4. `.cursorrules` (Cursor AI)
5. `.github/copilot-context.md` (GitHub Copilot)

## Informations mises à jour

### Automatiquement

- ✅ **Date de dernière mise à jour**
- ✅ **Versions des packages** (Node, pnpm, firebase-admin, etc.)
- ✅ **Statistiques du projet** (nombre de packages, scripts)

### Manuellement (si changements majeurs)

- Architecture système
- Nouvelles fonctionnalités
- Changements de structure
- Nouveaux scripts

## Utilisation

### Automatique (Git Hook)

Le hook `pre-push` met à jour automatiquement les docs avant chaque push :

```bash
git push origin main
# → Met à jour les docs IA automatiquement
# → Crée un commit si nécessaire
# → Push les changements
```

### Manuelle

Pour mettre à jour manuellement les docs :

```bash
# Exécuter le script
node scripts/update-ai-docs.mjs

# Vérifier les changements
git status

# Commiter si nécessaire
git add docs/ PROJECT_CONTEXT.md .cursorrules .github/
git commit -m "docs(ai): update AI context files"
```

## Installation du hook

Le hook Git est installé via Husky. Si nécessaire, réinstaller :

```bash
# Installer Husky
pnpm install

# Rendre le hook exécutable (Linux/Mac)
chmod +x .husky/pre-push

# Vérifier l'installation
ls -la .husky/
```

## Fonctionnement du script

### 1. Collecte des informations

```javascript
// Versions des packages
const versions = {
  node: process.version,
  pnpm: packageJson.packageManager,
  firebaseAdmin: functionsPackageJson.dependencies['firebase-admin'],
  // ...
};

// Statistiques du projet
const counts = {
  apps: 2,
  packages: 8,
  total: 11,
};
```

### 2. Mise à jour des fichiers

Pour chaque fichier de contexte IA :

1. **Lecture** du contenu actuel
2. **Remplacement** des dates et versions
3. **Écriture** du nouveau contenu
4. **Log** des changements

### 3. Commit automatique

Si des fichiers ont été modifiés :

```bash
git add docs/ PROJECT_CONTEXT.md .cursorrules .github/
git commit -m "docs(ai): auto-update AI context files [skip ci]"
```

Le flag `[skip ci]` évite de déclencher les workflows GitHub Actions inutilement.

## Patterns de remplacement

### Dates

```javascript
// Formats supportés:
'Dernière mise à jour:** 13 novembre 2025';
'Last Updated:** November 13, 2025';
'> **Dernière mise à jour:** 13 novembre 2025';
```

### Versions

```javascript
// Node.js
"Node.js 22.16.0" → "Node.js 22.18.0"

// pnpm
"pnpm 10.22.0" → "pnpm 10.23.0"

// firebase-admin
"firebase-admin": "^13.6.0" → "firebase-admin": "^13.7.0"
```

## Personnalisation

### Ajouter un nouveau fichier

Éditer `scripts/update-ai-docs.mjs` :

```javascript
const AI_DOCS = [
  'docs/CHATGPT_INSTRUCTIONS.md',
  'docs/COPILOT_CONTEXT.md',
  'PROJECT_CONTEXT.md',
  '.cursorrules',
  '.github/copilot-context.md',
  'docs/NEW_AI_CONTEXT.md', // ← Ajouter ici
];
```

### Ajouter un nouveau pattern

```javascript
// Dans updateVersionsInFile()
updated = updated.replace(/MyPackage\s+\d+\.\d+\.\d+/gi, `MyPackage ${versions.myPackage}`);
```

## Dépannage

### Le hook ne s'exécute pas

```bash
# Vérifier que Husky est installé
ls -la .husky/

# Réinstaller Husky
pnpm install

# Rendre les hooks exécutables
chmod +x .husky/pre-push
```

### Les versions ne se mettent pas à jour

```bash
# Vérifier le package.json racine
cat package.json | grep packageManager

# Vérifier le package.json des functions
cat functions/package.json | grep firebase-admin

# Exécuter le script en mode debug
node scripts/update-ai-docs.mjs
```

### Le commit automatique ne fonctionne pas

```bash
# Vérifier les permissions Git
git config --list | grep commit

# Désactiver le hook temporairement
git push --no-verify origin main
```

## Bonnes pratiques

### ✅ DO

- Laisser le hook s'exécuter automatiquement
- Vérifier les changements avant de push
- Mettre à jour manuellement pour les changements majeurs
- Tester le script après modification

### ❌ DON'T

- Ne pas bypass systématiquement le hook avec `--no-verify`
- Ne pas modifier directement les dates/versions dans les docs
- Ne pas supprimer le hook sans avertir l'équipe
- Ne pas ajouter de logique complexe dans le hook

## Logs et monitoring

Le script génère des logs clairs :

```
🤖 Mise à jour des fichiers de contexte IA...

📊 Informations du projet:
   Date: 13 novembre 2025
   Node: 22.16.0
   pnpm: 10.22.0
   Packages workspace: 11
   Scripts de maintenance: 3

✅ Mis à jour: docs/CHATGPT_INSTRUCTIONS.md
✅ Mis à jour: docs/COPILOT_CONTEXT.md
⏭️  Aucun changement: PROJECT_CONTEXT.md
✅ Mis à jour: .cursorrules
✅ Mis à jour: .github/copilot-context.md

📝 Résumé:
   4/5 fichiers mis à jour

💡 N'oubliez pas de commiter les changements:
   git add docs/ PROJECT_CONTEXT.md .cursorrules .github/
   git commit -m "docs(ai): update AI context files (auto-update)"
```

## CI/CD Integration

Le commit automatique inclut `[skip ci]` pour éviter de déclencher les pipelines :

```bash
git commit -m "docs(ai): auto-update AI context files [skip ci]"
```

Si vous voulez forcer l'exécution du CI :

```bash
# Modifier le hook pour retirer [skip ci]
git commit -m "docs(ai): auto-update AI context files"
```

## Support

En cas de problème :

1. Vérifier les logs du script
2. Tester manuellement : `node scripts/update-ai-docs.mjs`
3. Consulter la documentation Husky : https://typicode.github.io/husky/
4. Ouvrir une issue si le problème persiste

---

**Dernière mise à jour** : 13 novembre 2025  
**Auteur** : Système automatisé  
**Version** : 1.0.0
