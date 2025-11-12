# Mise à jour du Dev Container - Novembre 2025

## 🎯 Objectif

Mettre à jour le dev container avec les versions les plus récentes de tous les packages et outils.

## 📦 Versions mises à jour

### Docker Base Image

- **Avant**: `node:22-alpine`
- **Après**: `node:24-alpine` (Node.js LTS Krypton)

### Outils globaux

- **pnpm**: Utilise maintenant `@latest` au lieu de version fixe
- **firebase-tools**: Utilise maintenant `@latest` au lieu de version fixe
- **GitHub CLI**: Installation automatique de la dernière version via `releases/latest`

### Dépendances du projet

| Package            | Ancienne version | Nouvelle version |
| ------------------ | ---------------- | ---------------- |
| @cspell/dict-fr-fr | ^2.2.0           | ^2.3.2           |
| cspell             | ^8.14.2          | ^9.3.1           |
| husky              | ^9.1.0           | ^9.1.7           |

### Contraintes moteur

- **Node.js**: `>=20.17.0 <23` → `>=22.0.0 <25`

## 🚀 Comment reconstruire

### Option 1: Script automatique

```bash
./rebuild-devcontainer.sh
```

### Option 2: VS Code (recommandé)

1. Ouvrir la palette de commandes (`Ctrl+Shift+P`)
2. Taper "Dev Containers: Rebuild Container"
3. Sélectionner "Rebuild Without Cache"

### Option 3: Manuel

```bash
# Nettoyer les images existantes
docker system prune -f
docker images | grep devcontainer | awk '{print $3}' | xargs docker rmi -f

# Reconstruire via VS Code
# Dev Containers: Rebuild Container Without Cache
```

## 🔧 Post-reconstruction

Après la reconstruction, le container exécutera automatiquement :

```bash
pnpm install && pnpm run build
```

## 🎉 Avantages

1. **Sécurité**: Dernières versions avec correctifs de sécurité
2. **Performance**: Node.js 24 LTS avec optimisations
3. **Stabilité**: Versions LTS recommandées
4. **Maintenance**: Installation automatique des dernières versions

## ⚠️ Problèmes potentiels

Si vous rencontrez des problèmes :

1. **Cache Docker**: Assurez-vous d'utiliser "Rebuild Without Cache"
2. **Espace disque**: Nettoyez les images Docker inutilisées
3. **Compatibilité**: Vérifiez que tous les packages supportent Node.js 24

## 📝 Notes

- Le dev container continue d'utiliser Alpine Linux pour une image plus légère
- Toutes les extensions VS Code restent les mêmes
- Les ports et configurations sont préservés
- L'environnement Firebase est maintenu
