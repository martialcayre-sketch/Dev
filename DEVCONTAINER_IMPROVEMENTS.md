# Améliorations du DevContainer ✅

## Changements appliqués (Nov 2025)

### 🐳 Dockerfile
- ✅ **Node.js 22.16.0** (au lieu de 24.11.1) - aligné avec engines du projet
- ✅ **Support multi-architecture** (AMD64 + ARM64) pour GitHub CLI
- ✅ **Build optimisé** - toutes les dépendances dans un seul stage
- ✅ **pnpm store persistant** dans `/home/node/.pnpm-store`
- ✅ **Ajout de `jq`** pour manipulation JSON en ligne de commande

### ⚙️ devcontainer.json
- ✅ **pnpm store volume persistant** - cache entre rebuilds
- ✅ **Installation conditionnelle** - skip si node_modules existe déjà
- ✅ **Ports Firebase Emulators** mis à jour (5000-5004 au lieu de 8080/9099)
- ✅ **4 CPUs** recommandés (au lieu de 2) pour meilleure performance
- ✅ **File watchers exclusions** - ignore node_modules, dist, .turbo
- ✅ **Search exclusions** - améliore performance de la recherche
- ✅ **Tailwind IntelliSense** - regex pour `cn()` et `cva()`
- ✅ **Extensions supplémentaires** - ErrorLens, GitLens, Auto Close Tag

### 🚀 Optimisations de performance

1. **Cache pnpm persistant** 
   - Volume Docker dédié pour `.pnpm-store`
   - Économie de temps sur pnpm install (>50%)

2. **Installation intelligente**
   - `onCreateCommand` vérifie si node_modules existe
   - Pas de réinstallation inutile au redémarrage

3. **Exclusions de fichiers**
   - VSCode ignore node_modules, dist, .turbo pour watchers
   - Améliore réactivité et réduit CPU/RAM

4. **Allocation ressources**
   - 4 CPUs (au lieu de 2)
   - NODE_OPTIONS avec 4GB heap
   - Turbo cache optimisé

## Variables d'environnement Firebase

```bash
FIRESTORE_EMULATOR_HOST=localhost:5003
FIREBASE_AUTH_EMULATOR_HOST=localhost:5004
FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199
```

## Ports exposés

| Port | Service | Auto-open |
|------|---------|-----------|
| 3010 | Practitioner App | notify |
| 3020 | Patient App | notify |
| 5000 | Firebase Emulator UI | openBrowser |
| 5001 | Firebase Hosting | silent |
| 5002 | Firebase Functions | silent |
| 5003 | Firestore Emulator | silent |
| 5004 | Auth Emulator | silent |
| 5173 | Patient Vite Dev | notify |
| 5174 | Practitioner Vite Dev | notify |

## Commandes utiles

```bash
# Vérifier la santé du container
bash .devcontainer/docker-healthcheck.sh

# Rebuilder le devcontainer (si nécessaire)
# Cmd/Ctrl + Shift + P → "Dev Containers: Rebuild Container"

# Vérifier les versions
node --version  # 22.16.0
pnpm --version  # 10.22.0
firebase --version  # 14.24.2
gh --version  # 2.83.0
```

## Prochaines améliorations possibles

- [ ] Pre-build des packages lors du build Docker (accélère encore onCreateCommand)
- [ ] Integration tests avec Playwright dans le devcontainer
- [ ] Docker layer caching avec GitHub Actions
- [ ] Turbo remote cache configuration

