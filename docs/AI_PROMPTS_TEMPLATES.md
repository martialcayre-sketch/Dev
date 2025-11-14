# Prompts IA Optimisés - NeuroNutrition Workspace

## 🎯 **Prompts de Diagnostic**

### **🔍 Diagnostic Global Workspace**

```
Analysez l'état du workspace NeuroNutrition:
1. Exécutez `pnpm typecheck` et rapportez les erreurs TypeScript
2. Testez les builds : functions, patient-vite, practitioner-vite
3. Identifiez les patterns d'erreur récurrents
4. Proposez un plan de résolution priorisé

Context: Monorepo pnpm, TypeScript 5.9.3, Node 20/22, Firebase
```

### **🚨 Résolution d'Erreur Ciblée**

```
Corrigez cette erreur TypeScript dans le contexte NeuroNutrition:

Erreur: [COLLER_ERREUR_ICI]
Fichier: [CHEMIN_FICHIER]

Contraintes:
- Respecter les patterns validés du workspace
- Éviter les imports ES6 problématiques dans Cloud Functions
- Utiliser les hooks Firebase existants (useFirebaseUser)
- Maintenir la compatibilité strict TypeScript

Livrez uniquement le code corrigé, pas d'explication.
```

## 🛠️ **Prompts de Développement**

### **📦 Nouvelle Feature Frontend**

```
Implémentez [FEATURE] dans [patient-vite|practitioner-vite]:

Requirements:
- TypeScript strict conforme
- Utiliser useFirebaseUser pour auth
- Composants UI: créer substituts simples si manquants
- Error boundaries et loading states
- Build final < 400KB chunk principal

Structure: component + hooks + types + tests (optionnel)
```

### **⚡ Cloud Function**

```
Créez une Cloud Function pour [OBJECTIF]:

Spécifications:
- Firebase Gen2, région europe-west1
- Node.js 20, TypeScript strict
- Authentification Firebase obligatoire
- Utiliser require() pour shared packages si nécessaire
- Gestion d'erreur robuste avec logging
- Response JSON normalisé: { success: boolean, data?: any, error?: string }

Incluez: fonction + types + middleware auth si nouveau
```

### **🔗 Integration Shared Package**

```
Intégrez le package shared [PACKAGE_NAME] dans [TARGET]:

Guidelines:
- Workspace dependency: "workspace:*"
- Types exported correctement
- Build isolation maintenu
- Pas de dépendances circulaires
- Compatible avec build Turborepo

Test: `pnpm typecheck` doit passer après intégration
```

## 🧪 **Prompts de Test et QA**

### **🔧 Fix Build Errors**

```
Le build échoue avec ces erreurs:
[COLLER_ERREURS_BUILD]

Contexte workspace NeuroNutrition:
- pnpm workspaces, Turborepo
- TypeScript 5.9.3 strict
- Vite 7.2.2 frontend
- Node 20 Cloud Functions

Corrigez en respectant les patterns validés. Priorité: builds stables.
```

### **📊 Optimisation Performance**

```
Optimisez les performances de [COMPONENT/FUNCTION]:

Objectifs:
- Reduce bundle size (cible < 400KB)
- Minimize re-renders React
- Optimize Firestore queries
- Lazy loading approprié

Metrics actuels: [DONNER_METRIQUES]
Respecter l'architecture TypeScript strict existante.
```

## 🎨 **Prompts de Refactoring**

### **🔄 Migration Pattern**

```
Migrez [OLD_PATTERN] vers [NEW_PATTERN] dans le workspace:

Context:
- Maintenir compatibilité backend/frontend
- Respecter types TypeScript existants
- Éviter breaking changes dans shared packages
- Valider avec `pnpm typecheck`

Livrez migration step-by-step avec rollback si nécessaire.
```

### **🧹 Code Cleanup**

```
Nettoyez et optimisez [FICHIER/DOSSIER]:

Standards NeuroNutrition:
- TypeScript strict compliance
- Remove dead code et imports inutilisés
- Consistent error handling
- ESLint/Prettier formatting
- Proper JSDoc pour fonctions publiques

Préservez la fonctionnalité existante.
```

## 📋 **Prompts de Documentation**

### **📝 API Documentation**

```
Documentez l'API [ENDPOINT/FUNCTION]:

Format:
- TypeScript interfaces
- Usage examples
- Error codes possibles
- Authentication requirements
- Performance considerations

Context: Firebase Cloud Functions, TypeScript strict
```

### **🏗️ Architecture Decision**

```
Documentez la décision architecturale pour [SUJET]:

Structure:
- Problème adressé
- Options considérées
- Solution choisie et rationale
- Impact sur workspace NeuroNutrition
- Migration plan si applicable

Focus: TypeScript ecosystem et Firebase stack.
```

## 🚀 **Prompts de Déploiement**

### **📦 Pre-Deploy Checklist**

```
Validez le workspace avant déploiement:

Checklist automatique:
1. `pnpm typecheck` - OK
2. `pnpm build` - toutes apps OK
3. `pnpm test` - si tests disponibles
4. Bundle sizes < seuils
5. Firebase Functions build OK
6. Security audit (dependencies)

Rapport: GO/NO-GO avec détails.
```

### **🔍 Post-Deploy Validation**

```
Validez le déploiement [ENV]:

Vérifications:
- Cloud Functions endpoints responsive
- Frontend apps loading correctement
- Firebase auth flow fonctionnel
- Firestore queries performantes
- No TypeScript errors en runtime

Context: Firebase hosting + Cloud Functions Gen2
```

## 💡 **Prompts Utility**

### **🔧 Workspace Health Check**

```
Évaluez la santé globale du workspace:

Métriques:
- TypeScript compliance score
- Bundle size trends
- Build time performance
- Dependencies vulnerabilities
- Code quality metrics

Recommandations priorisées pour amélioration.
```

### **📊 Performance Baseline**

```
Établissez une baseline performance pour [COMPONENT]:

Mesures:
- Build time
- Bundle size
- Runtime performance
- Memory usage
- Network requests

Format: JSON metrics + seuils d'alerte recommandés.
```

## 🎯 **Templates de Réponse Attendus**

### **✅ Code Fix Response**

```typescript
// Problem: [brief description]
// Solution: [approach taken]

[CODE_BLOCK_WITH_FIX];

// Validation:
// ✅ TypeScript strict compliance
// ✅ Build passes
// ✅ No breaking changes
```

### **📋 Analysis Response**

````markdown
## Analysis Summary

### Issues Found

1. [Issue 1] - Impact: [High/Medium/Low]
2. [Issue 2] - Impact: [High/Medium/Low]

### Resolution Plan

1. **Immediate**: [critical fixes]
2. **Short-term**: [important improvements]
3. **Long-term**: [optimizations]

### Commands to Run

```bash
[specific commands]
```
````

### Validation

- [ ] TypeScript errors: 0
- [ ] Build time: < [threshold]
- [ ] Bundle size: < [threshold]

```

---

**🎯 Ces prompts optimisés assurent une collaboration IA efficace et des résultats conformes aux standards du workspace NeuroNutrition.**
```
