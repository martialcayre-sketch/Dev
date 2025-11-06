# 🔄 Migration Patients Existants : Mode de Vie → Life Journey

## 📋 Contexte

Le questionnaire **Life Journey** a remplacé l'ancien questionnaire **mode-de-vie** dans le système d'assignation automatique. Cependant, cette modification n'affecte que les **nouveaux patients**.

Les **patients existants** ont encore l'ancien questionnaire `mode-de-vie` assigné dans leur collection Firestore.

## 🎯 Objectif de la Migration

Remplacer automatiquement le questionnaire `mode-de-vie` par `life-journey` pour tous les patients existants, tout en :

- ✅ Préservant le statut (`pending` ou `completed`)
- ✅ Préservant les réponses si le questionnaire était déjà complété
- ✅ Préservant les dates d'assignation et de complétion
- ✅ Garantissant l'idempotence (peut être exécuté plusieurs fois sans danger)

## 📊 Structure des Données

### Avant Migration

```
patients/{uid}/questionnaires/
  ├── mode-de-vie/
  │   ├── id: "mode-de-vie"
  │   ├── title: "Questionnaire de mode de vie"
  │   ├── status: "pending" | "completed"
  │   ├── assignedAt: Timestamp
  │   ├── completedAt: Timestamp | null
  │   └── responses: { ... }
  ├── plaintes-et-douleurs/
  ├── alimentaire/
  └── dnsm/
```

### Après Migration

```
patients/{uid}/questionnaires/
  ├── life-journey/                    ⭐ NOUVEAU
  │   ├── id: "life-journey"
  │   ├── title: "Mode de vie – 7 Sphères Vitales"
  │   ├── category: "Mode de vie SIIN"
  │   ├── status: "pending" | "completed"  (préservé)
  │   ├── assignedAt: Timestamp            (préservé)
  │   ├── completedAt: Timestamp | null    (préservé)
  │   ├── responses: { ... }               (préservé)
  │   ├── migratedFrom: "mode-de-vie"
  │   └── migratedAt: Timestamp
  ├── plaintes-et-douleurs/
  ├── alimentaire/
  └── dnsm/
```

**Note:** L'ancien document `mode-de-vie` est **supprimé** après la migration.

## 🚀 Exécution de la Migration

### Prérequis

1. **Service Account Key** : Fichier `serviceAccountKey.json` à la racine du projet
   - Si vous ne l'avez pas, téléchargez-le depuis :
   - https://console.firebase.google.com/project/neuronutrition-app/settings/serviceaccounts/adminsdk
   - Cliquez sur "Générer une nouvelle clé privée"
   - Sauvegardez sous `C:\Dev\serviceAccountKey.json`

2. **Node.js** installé (v18+)

### Commande

```powershell
cd C:\Dev
.\scripts\migrate-mode-de-vie-to-life-journey.ps1
```

### Sortie Attendue

```
════════════════════════════════════════════════════════════
  🔄 MIGRATION MODE-DE-VIE → LIFE-JOURNEY
════════════════════════════════════════════════════════════

✅ Service Account Key trouvé

⚠️  ATTENTION: Ce script va modifier TOUS les patients existants

📋 Actions qui seront effectuées:
   • Trouver tous les patients avec 'mode-de-vie' assigné
   • Créer un nouveau questionnaire 'life-journey'
   • Copier le statut et les réponses (si complété)
   • Supprimer l'ancien 'mode-de-vie'

Voulez-vous continuer? (oui/non): oui

🚀 Lancement de la migration...

📊 Total de patients trouvés: 15

🔄 Migration du patient: abc123...
  📋 Status actuel: completed
  📅 Assigné le: 01/11/2024
  ✅ Questionnaire complété le: 03/11/2024
  ✅ Migration réussie : mode-de-vie → life-journey

...

════════════════════════════════════════════════════════════
  📊 RÉSUMÉ DE LA MIGRATION
════════════════════════════════════════════════════════════

✅ Patients migrés:           12
⏭️  Patients skippés:          2
ℹ️  Déjà migrés:               1
❌ Erreurs:                   0
📊 Total:                     15

🎉 Migration terminée avec succès!
```

## 🔍 Vérifications Post-Migration

### 1. Firebase Console

1. Ouvrez https://console.firebase.google.com/project/neuronutrition-app/firestore
2. Naviguez vers `patients/{uid}/questionnaires`
3. **Vérifications:**
   - ✅ `life-journey` existe
   - ✅ `mode-de-vie` n'existe plus
   - ✅ Le statut est préservé (`pending` ou `completed`)
   - ✅ `migratedFrom: "mode-de-vie"` est présent

### 2. Test Côté Patient

1. Connectez-vous avec un compte patient existant
2. Allez sur `/dashboard/questionnaires`
3. **Vérifications:**
   - ✅ "Mode de vie – 7 Sphères Vitales" apparaît dans la liste
   - ✅ Le statut est correct (badge "À compléter" ou "Complété")
   - ✅ Si complété, le lien "Voir les résultats" fonctionne
   - ✅ Si pending, le formulaire se charge correctement

### 3. Test Côté Praticien

1. Ouvrez une fiche patient (qui a complété le questionnaire)
2. Allez dans l'onglet "Life Journey" ou section radar
3. **Vérifications:**
   - ✅ Le radar graph s'affiche avec 6 dimensions
   - ✅ Les scores sont cohérents (0-100)
   - ✅ Les données correspondent aux réponses du patient

## ⚙️ Fonctionnement du Script

### Algorithme

```
POUR chaque patient dans la collection 'patients':

  1. Vérifier si questionnaires/mode-de-vie existe
     ├── Non → Skip (déjà migré ou jamais assigné)
     └── Oui → Continuer

  2. Vérifier si questionnaires/life-journey existe déjà
     ├── Oui → Supprimer mode-de-vie et skip
     └── Non → Continuer la migration

  3. Lire les données de mode-de-vie
     • status
     • assignedAt
     • completedAt
     • responses
     • practitionerId

  4. TRANSACTION ATOMIQUE:
     ├── Créer life-journey avec les données copiées
     └── Supprimer mode-de-vie

  5. Marquer comme migré (migratedFrom, migratedAt)
```

### Garanties

- **Atomicité**: Utilisation de transactions Firestore (tout ou rien)
- **Idempotence**: Peut être exécuté plusieurs fois sans créer de doublons
- **Traçabilité**: Champs `migratedFrom` et `migratedAt` ajoutés
- **Réversibilité**: Backup automatique (mode-de-vie → life-journey)

## 🛡️ Sécurité

### Que se passe-t-il en cas d'erreur ?

1. **Transaction échoue**: Les modifications sont annulées (rollback)
2. **Erreur réseau**: Le patient est skippé, logged dans le résumé
3. **Données manquantes**: Valeurs par défaut utilisées (status: 'pending')

### Logs

Tous les événements sont loggés :

- ✅ Migrations réussies
- ⏭️ Patients skippés (avec raison)
- ❌ Erreurs (avec stack trace)

## 📝 Cas Particuliers

### Patient sans mode-de-vie

**Comportement**: Skip automatique

```
🔄 Migration du patient: xyz789
  ⏭️  Pas de mode-de-vie trouvé, skip
```

### Patient avec life-journey existant

**Comportement**: Supprime mode-de-vie uniquement

```
🔄 Migration du patient: abc123
  ⚠️  life-journey existe déjà, on supprime mode-de-vie
```

### Patient avec mode-de-vie complété

**Comportement**: Copie toutes les réponses + dates

```
🔄 Migration du patient: def456
  📋 Status actuel: completed
  📅 Assigné le: 01/11/2024
  ✅ Questionnaire complété le: 03/11/2024
  ✅ Migration réussie : mode-de-vie → life-journey
```

## 🔄 Rollback (si nécessaire)

Si vous devez annuler la migration :

1. **Backup Firestore** recommandé avant migration
2. Script de rollback possible (inverser l'opération)
3. Ou restauration manuelle via Firebase Console

**Note**: Les réponses Life Journey soumises après migration seront perdues en cas de rollback.

## 📊 Statistiques Attendues

Pour un projet avec **N** patients :

- **Migrés**: Patients avec mode-de-vie et sans life-journey
- **Skippés**: Patients sans mode-de-vie (nouveaux comptes)
- **Déjà migrés**: Patients avec life-journey existant
- **Erreurs**: Normalement 0 (sinon investiguer les logs)

## ✅ Checklist de Validation

Avant de marquer la migration comme terminée :

- [ ] Script exécuté avec succès (exit code 0)
- [ ] Firebase Console vérifiée (life-journey existe)
- [ ] Test patient (questionnaire accessible)
- [ ] Test praticien (radar graph visible)
- [ ] Aucune erreur dans les logs
- [ ] Statistiques cohérentes (migrés + skippés = total)

---

**Date de création**: 6 novembre 2025  
**Auteur**: GitHub Copilot + Martial Cayre  
**Version**: 1.0
