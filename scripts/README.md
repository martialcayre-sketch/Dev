# Scripts de développement local

Ce dossier contient les scripts pour démarrer l'environnement de développement complet.

**Localisation du projet** : `c:\Dev\` (racine directe, plus de sous-dossier `neuronutrition-app`)

## 🚀 Démarrage rapide

### Windows

```bash
pnpm dev:stack:win
```

Ou directement :

```powershell
.\scripts\dev-local.ps1
```

### Mac / Linux

```bash
pnpm dev:stack:mac
# ou
pnpm dev:stack:linux
```

Ou directement :

```bash
chmod +x scripts/dev-local.sh
./scripts/dev-local.sh
```

## 📜 Scripts disponibles

### `dev-local.ps1` (Windows PowerShell)

Lance 3 fenêtres PowerShell :

1. **Émulateurs Firebase** (Auth, Firestore, Functions)
2. **App Patient** (port 3020)
3. **App Practitioner** (port 3010)

**Options** :

- `-NoEmu` : Ne lance pas les émulateurs (si déjà démarrés)

**Exemple** :

```powershell
.\scripts\dev-local.ps1 -NoEmu
```

### `dev-local.sh` (Mac / Linux Bash)

Équivalent du script Windows pour Mac et Linux.

Lance 3 terminaux :

1. **Émulateurs Firebase**
2. **App Patient** (port 3020)
3. **App Practitioner** (port 3010)

**Compatibilité** :

- macOS : Utilise Terminal.app
- Linux GNOME : Utilise gnome-terminal
- Linux autres : Utilise xterm

### Autres scripts

- `start-emulators.ps1` : Lance uniquement les émulateurs
- `start-patient-dev.ps1` : Lance uniquement l'app Patient
- `start-practitioner-dev.ps1` : Lance uniquement l'app Practitioner
- `setup-github-preview.ps1` : Configuration GitHub Actions preview
- `test-preview-local.ps1` : Test local du workflow preview
- `check-latest-branch.sh` / `check-latest-branch.ps1` : Vérifier quelle branche est la plus récente

### `check-latest-branch.sh` / `check-latest-branch.ps1` - Analyse des branches

Script pour identifier quelle branche est la plus récente et comparer avec la branche main.

**Utilisation** :

```bash
# Linux/Mac
bash scripts/check-latest-branch.sh

# Windows PowerShell
.\scripts\check-latest-branch.ps1
```

**Fonctionnalités** :

- Affiche le top 10 des branches les plus récentes par date de commit
- Compare la branche main avec les autres branches
- Indique quelle branche a les commits les plus récents
- Récupère automatiquement les dernières informations depuis le dépôt distant

**Exemple de sortie** :

```
📊 Top 10 des branches les plus récentes:
  2025-11-12 origin/copilot/check-latest-branch - Initial plan
  2025-11-11 origin/main - feat: configure Copilot context files
  ...

🏆 Branche la plus récente:
  Nom: origin/copilot/check-latest-branch
  Date: 2025-11-12 12:06:42 +0000
```

## 📋 URLs après démarrage

| Service           | URL                                                              |
| ----------------- | ---------------------------------------------------------------- |
| **Émulateurs UI** | http://localhost:5000                                            |
| **Patient**       | http://localhost:3020                                            |
| **Practitioner**  | http://localhost:3010                                            |
| **API Health**    | http://localhost:5002/neuronutrition-app/europe-west1/api/health |

## 🛠️ Commandes individuelles

Si vous préférez lancer manuellement :

### Émulateurs

```bash
pnpm dev:emu
```

### Patient

```bash
pnpm dev:patient
```

### Practitioner

```bash
pnpm dev:practitioner
```

## 📚 Documentation complète

Voir [`docs/DEV_LOCAL.md`](../docs/DEV_LOCAL.md) pour :

- Prérequis détaillés
- Configuration
- Dépannage
- Workflow de développement

## 🐛 Dépannage

### Windows : Erreur d'exécution PowerShell

Si vous avez l'erreur "l'exécution de scripts est désactivée" :

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

### Mac/Linux : Permission refusée

```bash
chmod +x scripts/dev-local.sh
```

### Ports déjà utilisés

Vérifiez qu'aucune instance n'est déjà lancée :

```bash
# Windows
netstat -ano | findstr "5003"

# Mac/Linux
lsof -i :5003
```

## 💡 Astuces

### Arrêter tous les services

- **Windows** : Fermez les 3 fenêtres PowerShell
- **Mac/Linux** : Fermez les 3 terminaux

Ou tuez tous les processus :

```powershell
# Windows PowerShell
Get-Process | Where-Object {$_.ProcessName -like "*node*" -or $_.ProcessName -like "*java*"} | Stop-Process -Force
```

```bash
# Mac/Linux
pkill -f "firebase emulators"
pkill -f "next dev"
```

### Logs en temps réel

Les logs apparaissent dans chaque fenêtre/terminal respectif :

- **Émulateurs** : Logs Firebase, requêtes Functions
- **Patient/Practitioner** : Logs Next.js, HMR, requêtes HTTP

---

**Besoin d'aide ?** Consultez [`docs/DEV_LOCAL.md`](../docs/DEV_LOCAL.md)
