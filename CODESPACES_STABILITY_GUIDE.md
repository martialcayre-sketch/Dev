# Guide de Stabilité Codespaces - NeuroNutrition

## 🎯 **Optimisations appliquées pour éviter les plantages**

### 1. **Dockerfile Multi-stage**

- ✅ Versions fixes (Node 24.11.1, pnpm 10.22.0, firebase-tools 14.24.2)
- ✅ Layers optimisés pour cache Docker maximal
- ✅ Healthcheck intégré pour détection précoce des problèmes
- ✅ Build tools supprimés dans l'image finale (moins de surface d'attaque)

### 2. **Devcontainer.json optimisé**

- ✅ PostCreateCommand allégé (pas de build lourd au démarrage)
- ✅ Limites ressources définies: 2 CPUs, 8GB RAM, 32GB storage
- ✅ NODE_OPTIONS avec max-old-space-size=4096 pour éviter OOM
- ✅ PNPM store dans /tmp pour éviter conflicts permissions

### 3. **Turbo.json optimisé**

- ✅ Cache désactivé pour typecheck/test (évite corruption)
- ✅ Variables d'environnement globales définies
- ✅ Pipeline UI améliorer le debugging

## 🚀 **Commandes de démarrage optimales**

```bash
# Démarrage manuel après container ready
pnpm install
pnpm run build

# Ou directement le dev stack
pnpm run dev:patient    # Port 5173
pnpm run dev:practitioner  # Port 5174
pnpm run dev:emu        # Emulators Firebase
```

## 🛡️ **Prévention des plantages**

### Surveillance mémoire

```bash
# Surveiller usage mémoire
free -h
htop

# Si surcharge: redémarrer processus gourmands
pkill -f "node.*vite"
pkill -f "firebase"
```

### Nettoyage périodique

```bash
# Nettoyer cache pnpm
pnpm store prune

# Nettoyer node_modules si corruption
pnpm clean  # (si script défini)
rm -rf node_modules && pnpm install

# Nettoyer cache turbo
pnpm turbo clean
```

### Diagnostic

```bash
# Vérifier santé container
./.devcontainer/docker-healthcheck.sh

# Monitorer processus actifs
ps aux | grep -E "(node|pnpm|firebase)" | head -10

# Logs Codespaces
journalctl -u code-server --since "10 minutes ago"
```

## 🚨 **Signaux d'alerte**

| Problème           | Symptôme                        | Solution                                   |
| ------------------ | ------------------------------- | ------------------------------------------ |
| **OOM**            | `JavaScript heap out of memory` | Redémarrer terminal, vérifier NODE_OPTIONS |
| **CPU 100%**       | Interface slow/freeze           | `pkill` processus TypeScript/ESLint        |
| **Disk full**      | `ENOSPC: no space left`         | Nettoyer node_modules, cache Docker        |
| **Port conflicts** | `Port already in use`           | `lsof -ti:PORT \| xargs kill -9`           |

## ⚡ **Optimisations développement**

```bash
# Dev avec hot reload optimisé
pnpm run dev:patient --host 0.0.0.0 --port 5173

# Build incrémental rapide
pnpm run build --filter=patient-vite

# Test avec watch mode léger
pnpm run test:watch --max-workers=1
```

## 🔧 **Troubleshooting avancé**

### Container restart propre

```bash
# Depuis VS Code: Ctrl+Shift+P
# "Dev Containers: Rebuild Container"

# Ou via CLI si disponible
docker system prune -f
```

### Reset complet workspace

```bash
# Sauvegarder changements importants d'abord!
git stash push -m "avant reset"

# Reset installation complète
rm -rf node_modules .turbo
pnpm install
pnpm run build
```

## 📊 **Monitoring continue**

```bash
# Script monitoring (à lancer en arrière-plan)
while true; do
  echo "$(date): RAM=$(free -m | awk 'NR==2{printf "%.1f%%", $3/$2*100}') CPU=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)"
  sleep 30
done
```

Cette configuration assure **maximum de stabilité** pour Codespaces avec **reproductibilité** et **performance optimales**.

## 🎉 **Résultat attendu**

- ✅ Démarrage container < 2 minutes
- ✅ Build projet < 5 minutes
- ✅ Hot reload < 1 seconde
- ✅ Zéro plantage lié aux ressources
- ✅ Reproductibilité 100% entre devs
