# 📚 Index des Instructions IA - NeuroNutrition

## 🎯 **Vue d'Ensemble**

Cette documentation fournit un ensemble complet d'instructions IA pour éviter les erreurs TypeScript et Node.js dans le workspace NeuroNutrition, basé sur l'expérience de résolution d'erreurs v3 (novembre 2025).

## 📋 **Documents Disponibles**

### **1. 📖 Guide Technique Principal**

**Fichier:** [`AI_TYPESCRIPT_GUIDELINES.md`](./AI_TYPESCRIPT_GUIDELINES.md)  
**Usage:** Guide de référence pour développement  
**Contenu:**

- Patterns TypeScript validés et anti-erreurs
- Solutions spécifiques Cloud Functions vs Frontend
- Gestion des imports et dépendances workspace
- Métriques de performance et validation

### **2. 🤖 Templates de Prompts**

**Fichier:** [`AI_PROMPTS_TEMPLATES.md`](./AI_PROMPTS_TEMPLATES.md)  
**Usage:** Prompts optimisés pour collaboration IA  
**Contenu:**

- Prompts de diagnostic et résolution d'erreurs
- Templates pour nouvelles features et refactoring
- Patterns de réponse attendus
- Workflows de validation automatique

### **3. ⚙️ Configuration et Patterns**

**Fichier:** [`AI_CONFIGURATION_PATTERNS.md`](./AI_CONFIGURATION_PATTERNS.md)  
**Usage:** Snippets de code et configurations  
**Contenu:**

- Templates TypeScript auto-fix
- Patterns de substitution de composants UI
- Error boundaries et type guards
- Scripts de validation et santé du workspace

### **4. 🤝 Context Projet (Mis à Jour)**

**Fichier:** [`COPILOT_CONTEXT.md`](./COPILOT_CONTEXT.md)  
**Usage:** Context global pour toute IA  
**Contenu:**

- Architecture technique et stack validé
- Patterns d'imports critiques pour IA
- Commandes de validation TypeScript
- Guidelines v3 compliance

### **5. 📊 Résumé Exécutif**

**Fichier:** [`AI_INSTRUCTIONS_SUMMARY.md`](./AI_INSTRUCTIONS_SUMMARY.md)  
**Usage:** Vue d'ensemble rapide et checklist  
**Contenu:**

- Synthèse des fixes critiques identifiés
- Métriques de succès validées (nov 2025)
- Workflow de validation standard
- Instructions rapides pour IA

### **6. 🤖 Configuration Automatique**

**Fichier:** [`AI_AUTOMATIC_CONTEXT.md`](./AI_AUTOMATIC_CONTEXT.md)  
**Usage:** Documentation du chargement automatique dans Copilot  
**Contenu:**

- Configuration Copilot pour chargement automatique des 5 fichiers
- Intégration .cursorrules, VS Code settings, GitHub Copilot
- Script de synchronisation et maintenance
- Transparence totale pour développeurs - zéro configuration manuelle

## 🚀 **Utilisation Recommandée**

### **Pour Développeurs IA/Humains:**

1. **Démarrer par:** `AI_INSTRUCTIONS_SUMMARY.md` pour la vue d'ensemble
2. **Approfondir:** `AI_TYPESCRIPT_GUIDELINES.md` pour les détails techniques
3. **Implémenter:** Utiliser les patterns de `AI_CONFIGURATION_PATTERNS.md`

### **Pour Outils IA (Copilot, etc.):**

1. **Context global:** `COPILOT_CONTEXT.md`
2. **Prompts spécifiques:** `AI_PROMPTS_TEMPLATES.md`
3. **Validation:** Checklist de `AI_INSTRUCTIONS_SUMMARY.md`

## ⚡ **Fixes Critiques Documentés**

| Problème                   | Solution                   | Document Ref                   |
| -------------------------- | -------------------------- | ------------------------------ |
| Import ES6 Cloud Functions | `require()` bypass         | `AI_TYPESCRIPT_GUIDELINES.md`  |
| Hook Auth manquant         | `useFirebaseUser` existant | Tous                           |
| Composants UI manquants    | Substituts locaux          | `AI_CONFIGURATION_PATTERNS.md` |
| Types Firebase conflicts   | Casting explicite          | `AI_TYPESCRIPT_GUIDELINES.md`  |
| Build errors               | Patterns validés           | `AI_PROMPTS_TEMPLATES.md`      |

## 📈 **Métriques Validées (Nov 2025)**

| Component        | Status          | Build Time | Bundle Size |
| ---------------- | --------------- | ---------- | ----------- |
| Cloud Functions  | ✅ OPÉRATIONNEL | < 5s       | N/A         |
| Patient App      | ✅ PRODUCTION   | 11.07s     | 369KB       |
| Practitioner App | ✅ PRODUCTION   | 10.42s     | 369KB       |
| TypeScript Check | ✅ CONFORME     | 1.878s     | N/A         |

## 🎯 **Actions Rapides**

### **Diagnostic Global:**

```bash
# Validation complète workspace
pnpm typecheck
```

### **Build Applications:**

```bash
# Cloud Functions
cd functions && npm run build

# Frontend Apps
cd apps/patient-vite && npm run build
cd apps/practitioner-vite && npm run build
```

### **Prompt IA Standard:**

```
Context: Workspace NeuroNutrition TypeScript 5.9.3, pnpm monorepo

Règles:
- Cloud Functions: require() pour shared packages
- Frontend: useFirebaseUser au lieu de useAuth
- UI manquant: créer substituts simples
- Firebase: casting explicite types

Corrigez [ERREUR] en respectant ces patterns.
```

## 🔄 **Maintenance**

### **Mise à Jour Documentation:**

- Documenter nouveaux patterns d'erreur
- Mettre à jour métriques de performance
- Enrichir les templates de prompts

### **Validation Continue:**

- Exécuter `pnpm typecheck` avant commit
- Monitorer bundle sizes < 400KB
- Valider builds < 15s par app

---

## 📞 **Support**

En cas de nouveaux patterns d'erreur non documentés:

1. Reproduire et documenter dans `AI_TYPESCRIPT_GUIDELINES.md`
2. Ajouter template de fix dans `AI_CONFIGURATION_PATTERNS.md`
3. Créer prompt spécifique dans `AI_PROMPTS_TEMPLATES.md`
4. Mettre à jour ce fichier index

**🚀 Ces instructions garantissent des interventions IA robustes et conformes aux standards NeuroNutrition v3.**
