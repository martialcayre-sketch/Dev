# DevContainer - Configuration Windows

## ✅ Statut : Prêt pour Windows !

Le devcontainer a été mis à jour avec les dernières versions et est **100% compatible Windows**.

### 🖥️ **Configuration Windows**

#### Prérequis Windows
- **Docker Desktop** : Installé et en cours d'exécution
- **VS Code** : Avec extension "Dev Containers" (ms-vscode-remote.remote-containers)
- **WSL 2** : Recommandé pour de meilleures performances

#### Démarrage sur Windows
1. **Cloner le repo** :
   ```bash
   git clone https://github.com/martialcayre-sketch/Dev.git
   cd Dev
   ```

2. **Ouvrir dans VS Code** :
   ```bash
   code .
   ```

3. **Commande palette** (`Ctrl+Shift+P`) → **"Dev Containers: Reopen in Container"**

### 🐳 **Image Container mise à jour**
- **Base** : `node:20-alpine` (optimisée, sécurisée)
- **pnpm** : **10.22.0** (dernière stable)
- **firebase-tools** : **14.24.2** 
- **Java 11** : Inclus pour Firebase emulators
- **GitHub CLI** : Pour intégration Git

### ⚡ **Optimisations Windows**
- **Ports mappés** : 3010, 3020 (apps), 5000 (emulators), 8080, 9099
- **Volumes optimisés** : Cache node_modules pour performance
- **Auto-install** : `pnpm install && pnpm run build` au démarrage
- **Extensions VS Code** : ESLint, Prettier, Copilot, Firebase, etc.

### 🚀 **Post-démarrage automatique**
Le container exécute automatiquement :
```bash
pnpm install           # Install des dépendances
pnpm run build         # Build complet avec Turbo
```

### 📝 **URLs disponibles**
Une fois le container démarré :
- **Patient App** : http://localhost:3020
- **Practitioner App** : http://localhost:3010  
- **Firebase Emulators** : http://localhost:5000

### 🔧 **Commandes dans le container**
```bash
# Dev mode (après ouverture container)
pnpm run dev:patient        # Port 3020
pnpm run dev:practitioner   # Port 3010
pnpm run dev:emu            # Firebase emulators

# Build complet
pnpm run build              # Turbo build de tout

# Tests
pnpm run test
pnpm run lint
```

### ⚠️ **Notes Windows spécifiques**
- **Performance** : WSL 2 recommandé vs WSL 1
- **Docker** : S'assurer que Docker Desktop utilise WSL 2 backend
- **Firewall** : Autoriser Docker Desktop si demandé
- **Memory** : Allouer au moins 4GB RAM à Docker Desktop

### 🛠️ **Résolution de problèmes Windows**

#### Container ne démarre pas
1. Redémarrer Docker Desktop
2. Vérifier WSL 2 : `wsl --list --verbose`
3. Rebuilder container : `Ctrl+Shift+P` → "Dev Containers: Rebuild Container"

#### Ports non accessibles
1. Vérifier que Docker Desktop expose les ports
2. Windows Defender : Autoriser les ports 3010, 3020
3. `docker ps` pour vérifier les mappings

#### Performance lente
1. Passer à WSL 2 si WSL 1
2. Augmenter RAM Docker Desktop (Settings → Resources)
3. Déplacer projet dans WSL filesystem : `/mnt/wsl/...`

---

**Le devcontainer est maintenant parfaitement configuré pour Windows avec toutes les dernières versions ! 🎉**