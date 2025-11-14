# Configuration IA - Patterns Anti-Erreurs

## 🛡️ **TypeScript Strict Patterns**

### **Fichier de Configuration Recommandé**

#### **1. .ai-workspace-config.json**

```json
{
  "workspace": {
    "name": "NeuroNutrition",
    "type": "monorepo",
    "packageManager": "pnpm",
    "nodeVersion": "20.x|22.x+",
    "typescript": "5.9.3"
  },
  "build": {
    "commands": {
      "typecheck": "pnpm typecheck",
      "build": "pnpm build",
      "buildFunctions": "cd functions && npm run build",
      "buildApps": "cd apps/patient-vite && npm run build && cd ../practitioner-vite && npm run build"
    },
    "thresholds": {
      "bundleSize": "400KB",
      "buildTime": "15s",
      "typecheckTime": "3s"
    }
  },
  "imports": {
    "cloudFunctions": {
      "pattern": "require()",
      "reason": "ES6 imports causent des erreurs de résolution"
    },
    "frontend": {
      "pattern": "import {} from '@/path'",
      "authHook": "@/hooks/useFirebaseUser"
    }
  },
  "forbidden": [
    "import {} from '@/contexts/AuthContext'",
    "import {} from 'sonner'",
    "hardcoded secrets",
    "double-write patterns"
  ]
}
```

### **2. Snippets TypeScript Auto-Fix**

#### **Firebase Hook Pattern**

```typescript
// Template: Firebase Auth Hook
import { useFirebaseUser } from '@/hooks/useFirebaseUser';

export function Component() {
  const { user, loading, error } = useFirebaseUser();

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;
  if (!user) return <div>Non authentifié</div>;

  // Component logic
}
```

#### **Cloud Function Template**

```typescript
// Template: Cloud Function avec TypeScript
import { onRequest } from 'firebase-functions/v2/https';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Import shared avec require() bypass
const { validateUser } = require('@neuronutrition/shared-core');

export const functionName = onRequest(
  {
    region: 'europe-west1',
    memory: '512MiB',
  },
  async (req, res) => {
    try {
      // Auth validation
      if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token manquant' });
      }

      // Business logic
      const result = await businessLogic();

      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Erreur fonction:', error);
      res.status(500).json({ error: 'Erreur interne' });
    }
  }
);
```

#### **UI Component Substitut**

```typescript
// Template: Composant UI substitut conforme
interface ComponentProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const Component = ({
  children,
  variant = 'default',
  className = '',
  onClick,
  disabled = false,
}: ComponentProps) => {
  const baseClass = 'transition-colors rounded';
  const variantClass = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  }[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variantClass} ${className}`}
    >
      {children}
    </button>
  );
};
```

## 🔧 **Patterns de Debug Automatique**

### **Error Boundary React**

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary p-4 bg-red-50 border border-red-200 rounded">
          <h2 className="text-red-800 font-semibold">Erreur Composant</h2>
          <p className="text-red-600">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
          >
            Réessayer
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### **Type Guard Utilities**

```typescript
// Helpers de validation de type runtime
export const isValidFirebaseUser = (user: unknown): user is FirebaseUser => {
  return (
    typeof user === 'object' &&
    user !== null &&
    'uid' in user &&
    typeof (user as any).uid === 'string'
  );
};

export const isValidQuestionnaireData = (data: unknown): data is QuestionnaireData => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'templateId' in data &&
    'patientUid' in data &&
    'responses' in data
  );
};

export const assertNever = (x: never): never => {
  throw new Error(`Unexpected value: ${x}`);
};
```

## 📋 **Checklist de Validation Automatique**

### **Pre-Commit Hook Script**

```bash
#!/bin/bash
# .husky/pre-commit-ai-validation

echo "🔍 Validation IA Pre-Commit..."

# TypeScript check
echo "📝 TypeScript validation..."
if ! pnpm typecheck; then
  echo "❌ Erreurs TypeScript détectées"
  exit 1
fi

# Build validation
echo "🏗️ Build validation..."
if ! pnpm build:web; then
  echo "❌ Build échoué"
  exit 1
fi

# Bundle size check
echo "📦 Bundle size check..."
PATIENT_SIZE=$(du -sh apps/patient-vite/dist/assets/*.js | sort -hr | head -1 | cut -f1)
PRACTITIONER_SIZE=$(du -sh apps/practitioner-vite/dist/assets/*.js | sort -hr | head -1 | cut -f1)

if [[ ${PATIENT_SIZE%K} -gt 400 ]] || [[ ${PRACTITIONER_SIZE%K} -gt 400 ]]; then
  echo "⚠️ Bundle size warning: Patient=${PATIENT_SIZE}, Practitioner=${PRACTITIONER_SIZE}"
fi

echo "✅ Validation IA réussie"
```

### **VS Code Settings pour IA**

```json
{
  "typescript.preferences.quoteStyle": "single",
  "typescript.suggest.autoImports": true,
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.associations": {
    "*.tsx": "typescriptreact",
    "*.ts": "typescript"
  },
  "emmet.includeLanguages": {
    "typescriptreact": "html",
    "typescript": "html"
  }
}
```

## 🎯 **Règles de Résolution d'Erreur**

### **Ordre de Priorité**

1. **Erreurs TypeScript** → Fix immédiat requis
2. **Erreurs de Build** → Bloquant pour déploiement
3. **Warnings Bundle Size** → Performance concern
4. **Lint Warnings** → Code quality

### **Patterns de Fix Automatique**

| Erreur                             | Pattern de Fix                  | Exemple                                                     |
| ---------------------------------- | ------------------------------- | ----------------------------------------------------------- |
| `Cannot find module '@/component'` | Créer substitut local           | Voir template composant                                     |
| `useAuth is not found`             | Remplacer par `useFirebaseUser` | `import { useFirebaseUser } from '@/hooks/useFirebaseUser'` |
| `Query vs CollectionReference`     | Cast explicite                  | `as CollectionReference`                                    |
| `interpretations type mismatch`    | Cast avec validation            | `as InterpretationRange[]`                                  |
| `Missing dependency in useEffect`  | Ajouter à deps ou useCallback   | `useCallback(fn, [deps])`                                   |

### **Anti-Patterns à Éviter Absolument**

```typescript
// ❌ JAMAIS FAIRE
import { useAuth } from '@/contexts/AuthContext'; // Hook inexistant
import { toast } from 'sonner'; // Package manquant
const query: Query = collection(); // Type mismatch
import shared from '@neuronutrition/shared'; // ES6 dans CF

// ✅ TOUJOURS FAIRE
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
const toast = { success: console.log, error: console.error };
const query = collection() as CollectionReference;
const shared = require('@neuronutrition/shared');
```

## 📊 **Métriques de Succès IA**

### **KPIs de Qualité**

- TypeScript errors: 0
- Build time: < 15s per app
- Bundle size: < 400KB main chunk
- Import errors: 0
- Runtime errors: < 1%

### **Dashboard de Santé**

```bash
#!/bin/bash
# health-check.sh

echo "🏥 Santé Workspace NeuroNutrition"
echo "================================="

# TypeScript
TS_ERRORS=$(pnpm typecheck 2>&1 | grep -c "error TS")
echo "📝 TypeScript errors: $TS_ERRORS"

# Build time
BUILD_TIME=$(time pnpm build:web 2>&1 | grep real | awk '{print $2}')
echo "⏱️ Build time: $BUILD_TIME"

# Bundle sizes
PATIENT_SIZE=$(stat -f%z apps/patient-vite/dist/assets/*.js 2>/dev/null | sort -nr | head -1)
PRACTITIONER_SIZE=$(stat -f%z apps/practitioner-vite/dist/assets/*.js 2>/dev/null | sort -nr | head -1)
echo "📦 Bundle sizes: Patient=$(($PATIENT_SIZE/1024))KB, Practitioner=$(($PRACTITIONER_SIZE/1024))KB"

# Status
if [ $TS_ERRORS -eq 0 ]; then
  echo "✅ Status: HEALTHY"
else
  echo "❌ Status: NEEDS ATTENTION"
fi
```

---

**⚡ Cette configuration assure des interventions IA robustes et conformes aux patterns validés du workspace.**
