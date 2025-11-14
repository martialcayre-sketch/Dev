# 🧹 Scripts de Nettoyage Firebase NeuroNutrition

Collection de scripts pour nettoyer et gérer les données Firebase (production et émulateurs).

## 📋 Scripts disponibles

### 🌐 **Production (Données réelles)**

#### `scripts/purge-all-patients.mjs`

**Supprime TOUS les patients en production**

```bash
# ⚠️  ATTENTION : Suppression irréversible des données réelles !
node scripts/purge-all-patients.mjs --confirm-delete-all
```

**Ce qui est supprimé :**

- ✅ Comptes Firebase Auth patients
- ✅ Documents patients Firestore
- ✅ Questionnaires collection root
- ✅ Notifications patients
- ✅ Tokens d'invitation
- ✅ Sous-collections liées

#### `scripts/list-patients-emulator.mjs`

**Liste les patients et données (production/émulateurs)**

```bash
# Vérifie automatiquement l'environnement
node scripts/list-patients-emulator.mjs
```

---

### 🧪 **Émulateurs (Développement)**

#### `scripts/purge-emulator-patients.mjs`

**Supprime TOUS les patients dans les émulateurs**

```bash
# ✅ SÉCURISÉ : Fonctionne uniquement avec émulateurs
export FIRESTORE_EMULATOR_HOST=localhost:5003
export FIREBASE_AUTH_EMULATOR_HOST=localhost:5004
export FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199

node scripts/purge-emulator-patients.mjs --confirm-delete-all
```

#### `scripts/clean-emulators.mjs`

**Nettoyage complet des émulateurs (arrêt + suppression + redémarrage)**

```bash
# Remet les émulateurs à zéro complètement
node scripts/clean-emulators.mjs
```

#### `scripts/stop-emulators.mjs`

**Arrêt propre des émulateurs**

```bash
# Arrête tous les processus émulateurs
node scripts/stop-emulators.mjs
```

---

## 🚀 Workflow recommandé

### **Pour le développement local :**

```bash
# 1. Démarrer les émulateurs
firebase emulators:start --only firestore,auth &

# 2. Configurer l'environnement
export FIRESTORE_EMULATOR_HOST=localhost:5003
export FIREBASE_AUTH_EMULATOR_HOST=localhost:5004
export FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199

# 3. Développer et tester...

# 4. Nettoyer quand nécessaire
node scripts/purge-emulator-patients.mjs --confirm-delete-all

# 5. Arrêter les émulateurs
node scripts/stop-emulators.mjs
```

### **Pour nettoyer la production :**

```bash
# ⚠️  ATTENTION : Données réelles !
# Désactiver les émulateurs d'abord
unset FIRESTORE_EMULATOR_HOST
unset FIREBASE_AUTH_EMULATOR_HOST
unset FIREBASE_STORAGE_EMULATOR_HOST

# Lister ce qu'il y a avant
node scripts/list-patients-emulator.mjs

# Supprimer (irréversible!)
node scripts/purge-all-patients.mjs --confirm-delete-all

# Vérifier que c'est vide
node scripts/list-patients-emulator.mjs
```

---

## 🔒 Sécurités intégrées

### **Protection production :**

- ⚠️ Confirmation obligatoire `--confirm-delete-all`
- 📊 Rapport détaillé des opérations
- 🌐 Détection automatique environnement

### **Protection émulateurs :**

- 🧪 Vérification variables d'environnement
- 🚫 Refus de fonctionner en production
- ✅ Arrêt sécurisé des processus

### **Scripts de vérification :**

- 🔍 `list-patients-emulator.mjs` - État avant/après
- 📈 Statistiques détaillées dans chaque script
- 🎯 Compteurs d'opérations réalisées

---

## 📦 Scripts legacy (à conserver)

Ces scripts existants restent disponibles pour des besoins spécifiques :

- `scripts/clean-patient.mjs` - Nettoyage patient individuel
- `scripts/cleanup-firestore.mjs` - Nettoyage et réparation automatique
- `scripts/cleanup-firestore-safe.mjs` - Avec exclusion spécifique
- `scripts/purge-legacy-questionnaires.mjs` - Migration données legacy

---

## 🎯 Utilisation rapide

```bash
# 🧪 DÉVELOPPEMENT : Nettoyer émulateurs
node scripts/purge-emulator-patients.mjs --confirm-delete-all

# 🌐 PRODUCTION : Nettoyer données réelles (PRUDENCE!)
node scripts/purge-all-patients.mjs --confirm-delete-all

# 📊 VÉRIFICATION : Lister état actuel
node scripts/list-patients-emulator.mjs
```

---

**⚠️ Rappel important :** Toujours vérifier l'environnement avant suppression !

- 🧪 Émulateurs = Tests sécurisés
- 🌐 Production = Données réelles irréversibles
