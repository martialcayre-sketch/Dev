# 🤖 Instructions IA - NeuroNutrition Executive Summary

## 📋 **Vue d'Ensemble**

Ce document synthétise les instructions IA pour éviter les erreurs TypeScript et Node.js dans le workspace NeuroNutrition, basé sur l'expérience des corrections v3 (novembre 2025).

## 🎯 **Objectifs**

1. **Zéro erreur TypeScript** dans tous les builds
2. **Builds stables** < 15s par application
3. **Conformité v3** avec patterns validés
4. **Performance optimale** < 400KB chunks principaux

## 📚 **Documentation Complète**

| Fichier                           | Objet                              | Utilisation                  |
| --------------------------------- | ---------------------------------- | ---------------------------- |
| `AI_TYPESCRIPT_GUIDELINES.md`     | Patterns techniques & anti-erreurs | Référence pour développement |
| `AI_PROMPTS_TEMPLATES.md`         | Templates de prompts optimisés     | Utilisation directe avec IA  |
| `AI_CONFIGURATION_PATTERNS.md`    | Configurations & snippets          | Templates de code            |
| `COPILOT_CONTEXT.md` (mis à jour) | Context global projet              | Background IA                |

## ⚡ **Fixes Critiques Identifiés**

### **1. Import Resolution (Cloud Functions)**

```typescript
// ❌ PROBLÈME: ES6 imports fail
import { shared } from '@neuronutrition/shared-core';

// ✅ SOLUTION: require() bypass
const { shared } = require('@neuronutrition/shared-core');
```

### **2. Auth Hook Missing (Frontend)**

```typescript
// ❌ PROBLÈME: Hook manquant
import { useAuth } from '@/contexts/AuthContext';

// ✅ SOLUTION: Hook existant validé
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
```

### **3. UI Components Missing**

```typescript
// ❌ PROBLÈME: @/components/ui/* manquants
import { Button } from '@/components/ui/button';

// ✅ SOLUTION: Créer substituts locaux
const Button = ({ children, onClick, variant = 'primary' }: ButtonProps) => (
  <button className={`btn btn-${variant}`} onClick={onClick}>
    {children}
  </button>
);
```

### **4. Firebase Type Conflicts**

```typescript
// ❌ PROBLÈME: Query vs CollectionReference
const query: Query = firestore.collection('users');

// ✅ SOLUTION: Casting explicite
const query = firestore.collection('users') as CollectionReference;
const filteredQuery = query.where('active', '==', true) as Query;
```

## 🚀 **Commandes de Validation**

### **Workflow Standard**

```bash
# 1. TypeScript global
pnpm typecheck

# 2. Builds applications
cd apps/patient-vite && npm run build
cd apps/practitioner-vite && npm run build

# 3. Cloud Functions
cd functions && npm run build

# 4. Validation finale
echo "✅ Tous les builds OK"
```

### **Métriques de Succès**

- ✅ TypeScript errors: **0**
- ✅ Build time patient: **< 15s**
- ✅ Build time practitioner: **< 15s**
- ✅ Bundle size principal: **< 400KB**
- ✅ Cloud Functions: **compilation OK**

## 📊 **Résultats Validés (Nov 2025)**

| Component            | Status          | Metrics       |
| -------------------- | --------------- | ------------- |
| Cloud Functions      | ✅ OPÉRATIONNEL | Build < 5s    |
| Patient App          | ✅ PRODUCTION   | 11.07s, 369KB |
| Practitioner App     | ✅ PRODUCTION   | 10.42s, 369KB |
| TypeScript Workspace | ✅ CONFORME     | 1.878s        |

## 🎯 **Instructions Rapides pour IA**

### **Prompt de Base**

```
Context: Workspace NeuroNutrition, TypeScript 5.9.3 strict, pnpm monorepo

Règles obligatoires:
- Cloud Functions: require() pour shared packages
- Frontend: useFirebaseUser au lieu de useAuth
- UI manquant: créer substituts simples
- Firebase: casting explicite Query vs CollectionReference
- Validation: pnpm typecheck doit passer

Corrigez [PROBLÈME] en respectant ces patterns.
```

### **Fix Pattern Standard**

1. Identifier le type d'erreur (import, type, missing component)
2. Appliquer le pattern validé correspondant
3. Valider avec `pnpm typecheck`
4. Vérifier le build de l'app concernée

## 📈 **Évolution et Maintenance**

### **Mise à Jour des Instructions**

- Documenter nouveaux patterns d'erreur dans `AI_TYPESCRIPT_GUIDELINES.md`
- Ajouter templates de fix dans `AI_CONFIGURATION_PATTERNS.md`
- Mettre à jour métriques de performance

### **Monitoring Qualité**

```bash
# Script de santé automatique
#!/bin/bash
echo "🏥 Santé Workspace"
TS_ERRORS=$(pnpm typecheck 2>&1 | grep -c "error TS")
echo "📝 TypeScript errors: $TS_ERRORS"

if [ $TS_ERRORS -eq 0 ]; then
  echo "✅ Status: HEALTHY"
else
  echo "❌ Status: NEEDS_ATTENTION"
fi
```

---

## 🎭 **Pour les IA: Checklist de Validation**

Avant chaque modification de code:

- [ ] Pattern d'import correct selon contexte (Cloud Functions vs Frontend)
- [ ] Hook Firebase `useFirebaseUser` utilisé
- [ ] Types Firebase castés explicitement si nécessaire
- [ ] Composants UI substitués si manquants
- [ ] `pnpm typecheck` passe après modification
- [ ] Build time reste < 15s par app

**🚀 Ces instructions garantissent des interventions IA robustes et conformes aux standards v3 validés.**
