# Quick Start : Package Partagé @neuronutrition/shared-charts

## 🎯 Objectif

Résoudre le problème de dépendances dupliquées (recharts) entre patient-vite et practitioner-vite.

## ⚡ Setup (30 minutes)

### Étape 1 : Créer la structure

```bash
# Créer le dossier du package
mkdir -p packages/shared-charts/src/components
mkdir -p packages/shared-charts/src/hooks
mkdir -p packages/shared-charts/src/utils
```

### Étape 2 : Créer package.json

```json
{
  "name": "@neuronutrition/shared-charts",
  "version": "1.0.0",
  "description": "Shared chart components for NeuroNutrition apps",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "firebase": "^10.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "tsup": "^8.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Étape 3 : Créer tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### Étape 4 : Déplacer le code existant

```bash
# Copier LifeJourneyRadar
cp apps/practitioner-vite/src/components/LifeJourneyRadar.tsx packages/shared-charts/src/components/

# Copier le hook
cp apps/practitioner-vite/src/hooks/usePatientLifeJourney.ts packages/shared-charts/src/hooks/

# Créer l'index
cat > packages/shared-charts/src/index.ts << 'EOF'
export { default as LifeJourneyRadar } from './components/LifeJourneyRadar';
export { usePatientLifeJourney } from './hooks/usePatientLifeJourney';
export type { LifeJourneyData } from './hooks/usePatientLifeJourney';
EOF
```

### Étape 5 : Installer les dépendances

```bash
cd packages/shared-charts
pnpm install

# Build le package
pnpm build
```

### Étape 6 : Ajouter au workspace

Modifier `pnpm-workspace.yaml` :

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'packages/shared-charts' # Explicite si nécessaire
  - 'functions'
  - 'api'
```

### Étape 7 : Installer dans les apps

```bash
# Dans patient-vite
cd apps/patient-vite
pnpm add @neuronutrition/shared-charts@workspace:*

# Dans practitioner-vite
cd apps/practitioner-vite
pnpm add @neuronutrition/shared-charts@workspace:*
```

### Étape 8 : Mettre à jour les imports

**Dans `apps/practitioner-vite/src/pages/PatientDetailPage.tsx` :**

```typescript
// AVANT
import LifeJourneyRadar from '@/components/LifeJourneyRadar';
import { usePatientLifeJourney } from '@/hooks/usePatientLifeJourney';

// APRÈS
import { LifeJourneyRadar, usePatientLifeJourney } from '@neuronutrition/shared-charts';
```

### Étape 9 : Supprimer les anciens fichiers

```bash
# Dans practitioner-vite (une fois que l'import fonctionne)
rm apps/practitioner-vite/src/components/LifeJourneyRadar.tsx
rm apps/practitioner-vite/src/hooks/usePatientLifeJourney.ts
```

### Étape 10 : Build et test

```bash
# Build practitioner app
cd apps/practitioner-vite
npm run build

# Si succès, déployer
cd ../..
npx firebase deploy --only hosting:practitioner
```

## 🎯 Résultat

✅ Recharts version alignée dans le workspace (`2.12.7`)

> Note: Actuellement, le package `shared-charts` bundle `recharts@2.12.7` pour contourner des problèmes de résolution sous pnpm/Vite. Pour optimiser la taille, vous pourrez retirer ce bundling (noExternal) et déclarer `recharts@2.12.7` comme dépendance directe des apps.
> ✅ Code du radar partagé entre les deux apps
> ✅ Maintenance facilitée (un seul fichier à modifier)
> ✅ Build practitioner fonctionne !

## 🔄 Workflow de développement

```bash
# En mode développement
cd packages/shared-charts
pnpm dev  # Watch mode, rebuild automatique

# Dans un autre terminal
cd apps/practitioner-vite
npm run dev  # Utilise le package en temps réel
```

## 📦 Prochains composants à partager

Une fois que le radar fonctionne, déplacer progressivement :

1. `ComplaintsBarChart` (si existe)
2. `DNSMChart` (si existe)
3. Hooks de calcul SIIN
4. Utilitaires de formatage de données
5. Types TypeScript communs

## 🚀 Commandes rapides

```bash
# Tout en une fois (depuis C:\Dev)
cd packages/shared-charts && pnpm install && pnpm build && \
cd ../../apps/practitioner-vite && pnpm add @neuronutrition/shared-charts@workspace:* && \
npm run build && \
cd ../.. && npx firebase deploy --only hosting:practitioner
```

---

**Temps estimé : 30-45 minutes**
**Prérequis : pnpm installé et configuré**
