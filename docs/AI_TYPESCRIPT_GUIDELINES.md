# Guide IA TypeScript & Node.js - NeuroNutrition Workspace

## 🎯 **Mission**

Éviter les erreurs TypeScript, Node.js et de dépendances dans le monorepo NeuroNutrition en suivant les conventions et patterns validés.

## 📋 **Architecture & Technologies**

### **Stack Technique Validé**

- **Node.js**: 20.x (Cloud Functions) / 22.x+ (devcontainer)
- **TypeScript**: 5.9.3 (strict mode)
- **Package Manager**: pnpm 10.22.0 (workspaces)
- **Build System**: Vite 7.2.2 (frontend) / tsc (backend)
- **Monorepo**: Turborepo avec build isolation

### **Structure Workspace**

```
/workspaces/Dev/
├── apps/
│   ├── patient-vite/      # App patient React + Vite
│   └── practitioner-vite/ # App praticien React + Vite
├── packages/
│   ├── shared-core/       # Types & utils partagés
│   ├── shared-questionnaires/ # Types questionnaires
│   ├── shared-backend/    # Logique backend partagée
│   └── shared-ui/         # Composants UI partagés
├── functions/             # Cloud Functions Firebase Gen2
└── api/                   # API Cloud Run (optionnel)
```

## 🚫 **Erreurs TypeScript à Éviter**

### **1. Erreurs d'Import/Module**

#### ❌ **INTERDITS:**

```typescript
// Import ES6 dans Cloud Functions avec dependencies issues
import { something } from '@neuronutrition/shared-core';

// Alias paths incorrects
import { Button } from '@/components/ui/button';

// Import dynamic incorrect
const module = await import('./module');
```

#### ✅ **SOLUTIONS VALIDÉES:**

```typescript
// Cloud Functions: Utiliser require() comme bypass
const { something } = require('@neuronutrition/shared-core');

// Frontend: Utiliser les hooks Firebase existants
import { useFirebaseUser } from '@/hooks/useFirebaseUser';

// Import conditionnel avec vérification
const loadModule = async () => {
  try {
    const module = await import('./module');
    return module.default || module;
  } catch (error) {
    console.warn('Module non disponible:', error);
    return null;
  }
};
```

### **2. Erreurs de Types Firebase**

#### ❌ **PROBLÈMES FRÉQUENTS:**

```typescript
// Confusion Query vs CollectionReference
const query: Query = firestore.collection('users');

// Types Firebase manquants
const result = httpsCallable(functions, 'myFunction')();
```

#### ✅ **PATTERNS CORRECTS:**

```typescript
import { Query, CollectionReference } from 'firebase-admin/firestore';

// Typage explicite pour Query
const query = firestore.collection('users') as CollectionReference;
const queryWithFilter = query.where('active', '==', true) as Query;

// Cloud Functions avec types
const callFunction = httpsCallable(functions, 'functionName');
const result = (await callFunction({})) as { data: { success: boolean; data: any } };
```

### **3. Erreurs de Casting et Interprétations**

#### ❌ **PROBLÈME:**

```typescript
// Type mismatch sur les tableaux d'interprétation
interpretations: InterpretationRange[]
```

#### ✅ **SOLUTION:**

```typescript
// Casting explicite pour strict TypeScript
interpretations: InterpretationRange[] = originalData as InterpretationRange[];

// Ou validation avec Zod
const interpretationsSchema = z.array(z.object({
  min: z.number(),
  max: z.number(),
  level: z.string()
}));
const interpretations = interpretationsSchema.parse(originalData);
```

## 🔧 **Patterns Node.js Validés**

### **1. Cloud Functions Gen2**

```typescript
// Structure recommandée
export const myFunction = onRequest(
  {
    region: 'europe-west1',
    memory: '512MiB',
    timeoutSeconds: 60,
  },
  async (req, res) => {
    try {
      // Logique métier
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Erreur fonction:', error);
      res.status(500).json({ error: 'Erreur interne' });
    }
  }
);
```

### **2. Gestion des Dépendances Workspace**

#### **Package.json Patterns:**

```json
{
  "dependencies": {
    // Dependencies locales avec file: pour Cloud Functions
    "@neuronutrition/shared-core": "file:./vendor/@neuronutrition/shared-core",

    // Dependencies normales pour apps
    "@neuronutrition/shared-questionnaires": "workspace:*"
  },
  "engines": {
    "node": "20" // Cloud Functions
  }
}
```

#### **TSConfig Isolation:**

```jsonc
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 📦 **Gestion des Composants UI**

### **Pattern de Substitution Temporaire**

Quand les composants UI sont manquants, créer des substituts simples:

```typescript
// Substituts compatibles TypeScript
const Badge = ({
  children,
  variant = 'default',
  className = '',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
}) => (
  <span className={`px-2 py-1 text-xs rounded ${variantStyles[variant]} ${className}`}>
    {children}
  </span>
);

const Button = ({
  children,
  onClick,
  disabled,
  variant = 'primary',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`rounded transition-colors ${variantStyles[variant]}`}
  >
    {children}
  </button>
);
```

## 🎣 **Hooks et State Management**

### **Firebase Authentication**

```typescript
// ✅ Hook validé existant
import { useFirebaseUser } from '@/hooks/useFirebaseUser';

const { user, loading, error } = useFirebaseUser();

// ❌ Éviter
import { useAuth } from '@/contexts/AuthContext'; // Peut être manquant
```

### **State avec useCallback**

```typescript
// ✅ Performance et dependencies correctes
const loadData = useCallback(async () => {
  if (!user) return;
  // Logique de chargement
}, [user, functions]);

useEffect(() => {
  loadData();
}, [loadData]);
```

## 🔍 **Debugging et Validation**

### **Commandes de Vérification Ordre de Priorité:**

```bash
# 1. TypeCheck workspace complet
pnpm typecheck

# 2. Build applications principales
cd apps/patient-vite && npm run build
cd apps/practitioner-vite && npm run build

# 3. Build Cloud Functions
cd functions && npm run build

# 4. Vérification spellcheck
pnpm spellcheck
```

### **Patterns de Debug TypeScript:**

```typescript
// Vérification de type runtime
const isValidType = (obj: unknown): obj is ExpectedType => {
  return typeof obj === 'object' && obj !== null && 'expectedField' in obj;
};

// Logging avec context
console.error('Erreur avec context:', {
  error: error.message,
  stack: error.stack,
  context: { user: user?.uid, operation: 'functionName' },
});
```

## 🚀 **Build et Déploiement**

### **Métriques de Performance Attendues:**

- **Cloud Functions**: Build TypeScript < 5s
- **Patient App**: Build Vite < 15s, chunk principal < 400KB
- **Practitioner App**: Build Vite < 15s, chunk principal < 400KB
- **Workspace TypeCheck**: < 3s

### **Signaux d'Alerte:**

- Erreurs "Cannot find module" → Vérifier imports et paths
- "Property does not exist" → Vérifier types et interfaces
- Build timeout > 30s → Problème de dépendances circulaires
- Chunk size > 500KB → Optimisation code splitting nécessaire

## 📚 **Références Rapides**

### **Imports Autorisés par Context:**

| Context         | Pattern                   | Exemple                                  |
| --------------- | ------------------------- | ---------------------------------------- |
| Cloud Functions | `require()` ou local impl | `const { fn } = require('shared-core')`  |
| Frontend Apps   | Import ES6 + alias paths  | `import { Hook } from '@/hooks/useHook'` |
| Shared Packages | Import ES6 standard       | `import { Type } from './types'`         |

### **Types Firebase Essentiels:**

```typescript
import { Query, CollectionReference, DocumentSnapshot } from 'firebase-admin/firestore';

import { getFunctions, httpsCallable } from 'firebase/functions';
```

## 🎯 **Checklist de Résolution d'Erreur**

1. **Import Error** → Vérifier le pattern d'import selon le context
2. **Type Error** → Ajouter casting explicite ou validation Zod
3. **Missing Module** → Créer implémentation locale ou substitut
4. **Build Error** → Vérifier tsconfig.json et dependencies
5. **Runtime Error** → Ajouter error boundary et logging

---

**🚀 Ce guide assure une conformité TypeScript stricte et des builds stables pour toute modification IA du workspace NeuroNutrition.**
