# 🔧 Nettoyage Firestore avec Exclusion

## ⚠️ IMPORTANT : Patient Protégé

**Email exclu de toutes les opérations : `annedogne1@gmail.com`**

Ce patient et toutes ses données sont **totalement protégés** et ne seront **jamais modifiés** par les scripts de nettoyage.

## 📋 Scripts Créés

### 1. Script d'Analyse (Safe)

**Fichier:** `scripts/analyze-firestore-health.mjs` + `analyze-firestore-health.ps1`

**Commande:**

```powershell
.\scripts\analyze-firestore-health.ps1
```

**Ce qu'il fait:**

- ✅ Analyse complète de la base Firestore
- ✅ Détecte les problèmes et incohérences
- ✅ Génère un rapport détaillé avec statistiques
- ✅ **NE MODIFIE AUCUNE DONNÉE** (lecture seule)

**Sortie du dernier rapport:**

```
👥 PATIENTS: 4 total
   • 3 avec praticien
   • 1 sans praticien
   • 2 avec questionnaires
   • 2 sans questionnaires

📋 QUESTIONNAIRES: 8 total
   • 5 pending
   • 3 completed
   • 0 mode-de-vie (✓)
   • 2 life-journey (✓)
   • 0 doublons (✓)

🎟️ TOKENS: 3 total
   • 1 valide
   • 2 expirés
   • 1 non utilisé

⚠️ PROBLÈMES: 3 détectés
   • 1 patient sans practitionerId
   • 2 patients sans questionnaires
```

---

### 2. Script de Nettoyage Sécurisé (avec Exclusion)

**Fichier:** `scripts/cleanup-firestore-safe.mjs` + `cleanup-firestore-safe.ps1`

**Commande:**

```powershell
.\scripts\cleanup-firestore-safe.ps1
```

**Ce qu'il fait:**

#### ✅ Actions Appliquées

1. **Suppression des tokens expirés non utilisés**
   - ⚠️ SAUF token de `annedogne1@gmail.com`

2. **Assignation des questionnaires manquants**
   - Assigne les 4 questionnaires par défaut (plaintes-douleurs, life-journey, alimentaire, dnsm)
   - ⚠️ SAUF pour `annedogne1@gmail.com`

3. **Suppression des doublons mode-de-vie/life-journey**
   - Si un patient a les deux, supprime l'ancien mode-de-vie
   - ⚠️ SAUF pour `annedogne1@gmail.com`

4. **Nettoyage des anciennes notifications**
   - Supprime les notifications lues de plus de 30 jours
   - ⚠️ SAUF pour `annedogne1@gmail.com`

#### 🛡️ Protections

- **Email vérifié en lowercase** : `annedogne1@gmail.com` === `ANNEDOGNE1@GMAIL.COM`
- **Skip avec log** : Chaque action skippée est loggée
- **Transaction safe** : Utilise des batches Firestore atomiques
- **Idempotent** : Peut être exécuté plusieurs fois sans danger

---

### 3. Script de Nettoyage Complet (sans exclusion)

**Fichier:** `scripts/cleanup-firestore.mjs`

⚠️ **NE PAS UTILISER POUR L'INSTANT**

Ce script fait les mêmes actions mais **SANS exclusion**. Il modifiera également `annedogne1@gmail.com`.

---

## 🚀 Pour Exécuter le Nettoyage

### Étape 1 : Vérifier l'état actuel

```powershell
cd C:\Dev
.\scripts\analyze-firestore-health.ps1
```

Lisez le rapport et notez les problèmes détectés.

### Étape 2 : Lancer le nettoyage sécurisé

```powershell
.\scripts\cleanup-firestore-safe.ps1
```

**Le script vous demandera confirmation :**

```
Voulez-vous continuer? (oui/non): oui
```

### Étape 3 : Vérifier les résultats

```powershell
.\scripts\analyze-firestore-health.ps1
```

Comparez avec le rapport initial.

---

## 📊 Exemple de Sortie du Nettoyage

```
════════════════════════════════════════════════════════════
  🔧 NETTOYAGE ET RÉPARATION FIRESTORE
  ⚠️  AVEC EXCLUSION: annedogne1@gmail.com
════════════════════════════════════════════════════════════

🗑️  Suppression des tokens expirés non utilisés...
   ⚠️  EXCLUSION: annedogne1@gmail.com
   ⏭️  Token skippé: abc123 (annedogne1@gmail.com)
  ✓ 1 tokens expirés supprimés
  ⚠️  1 tokens exclus (annedogne1@gmail.com)

📋 Assignation des questionnaires manquants...
   ⚠️  EXCLUSION: annedogne1@gmail.com
  📝 Assignation des questionnaires au patient xyz789 (patient2@test.com)...
  ✓ 4 questionnaires assignés
  ✓ 2 patients ont reçu des questionnaires
  ⚠️  0 patients exclus (annedogne1@gmail.com)

🔄 Suppression des doublons mode-de-vie/life-journey...
   ⚠️  EXCLUSION: annedogne1@gmail.com
  ℹ️  Aucun doublon détecté

🔔 Nettoyage des anciennes notifications (> 30 jours)...
   ⚠️  EXCLUSION: annedogne1@gmail.com
  ℹ️  Aucune notification à nettoyer

════════════════════════════════════════════════════════════
  📊 RÉSUMÉ DU NETTOYAGE
════════════════════════════════════════════════════════════

⚠️  EMAIL EXCLU: annedogne1@gmail.com

✅ Tokens expirés supprimés:       1
⏭️  Tokens exclus:                 1
✅ Questionnaires assignés:        8
✅ Patients réparés:               2
⏭️  Patients exclus:               0
✅ Doublons supprimés:             0
✅ Notifications nettoyées:        0

════════════════════════════════════════════════════════════

✅ 11 actions de nettoyage effectuées avec succès !
⏭️  1 éléments exclus (annedogne1@gmail.com)
```

---

## 🔍 Vérifications Post-Nettoyage

### 1. Firebase Console

Vérifiez manuellement que `annedogne1@gmail.com` n'a pas été modifié :

1. Ouvrez : https://console.firebase.google.com/project/neuronutrition-app/firestore
2. Naviguez vers `patients` collection
3. Trouvez le patient avec email `annedogne1@gmail.com`
4. Vérifiez que :
   - ✅ Ses questionnaires n'ont pas changé
   - ✅ Son token existe toujours (si applicable)
   - ✅ Ses notifications sont intactes

### 2. Autres Patients

Vérifiez qu'ils ont été nettoyés correctement :

1. Les patients sans questionnaires en ont maintenant
2. Les tokens expirés ont été supprimés
3. Aucun doublon mode-de-vie/life-journey

### 3. Test Fonctionnel

1. Connectez-vous avec un compte patient (autre que Anne)
2. Vérifiez `/dashboard/questionnaires`
3. Confirmez que les 4 questionnaires sont assignés

---

## 🛡️ Sécurité et Garanties

### Exclusion Garantie

- **Email hardcodé** : `const EXCLUDED_EMAIL = 'annedogne1@gmail.com'`
- **Vérification systématique** avant chaque opération
- **Log de chaque skip** pour traçabilité

### Atomicité

- Utilisation de **Firestore batches**
- En cas d'erreur, les modifications sont annulées (rollback)

### Idempotence

- Le script peut être exécuté plusieurs fois
- Ne créera pas de doublons
- Ne supprimera pas des données déjà nettoyées

### Rollback Manuel

Si besoin de revenir en arrière :

1. Les tokens supprimés peuvent être recréés depuis l'app praticien
2. Les questionnaires peuvent être réassignés via Cloud Function
3. Aucune donnée de patient n'est supprimée (sauf notifications > 30j)

---

## 📝 Logs et Traçabilité

Tous les événements sont loggés :

- ✅ Actions réussies (vert)
- ⏭️ Éléments skippés (jaune)
- ❌ Erreurs (rouge)
- ℹ️ Informations (blanc)

**Exemple de log avec exclusion :**

```
⏭️  Token skippé: Hd43QF2A73s97iQLLy8V (annedogne1@gmail.com)
⏭️  Patient skippé: abc123xyz (annedogne1@gmail.com)
```

---

## ⚙️ Configuration

### Modifier l'Email Exclu

Si vous devez exclure un autre email, modifiez dans `cleanup-firestore-safe.mjs` :

```javascript
// Ligne 23
const EXCLUDED_EMAIL = 'autreemail@example.com';
```

### Ajouter des Exclusions Multiples

Remplacez par un array :

```javascript
const EXCLUDED_EMAILS = ['annedogne1@gmail.com', 'autrepatient@test.com'];

// Dans les conditions
if (EXCLUDED_EMAILS.includes(patientEmail.toLowerCase())) {
  // Skip
}
```

---

## 📚 Documentation Complète

- [LIFE_JOURNEY_INTEGRATION.md](./LIFE_JOURNEY_INTEGRATION.md) - Intégration Life Journey
- [MIGRATION_PATIENTS_LIFE_JOURNEY.md](./MIGRATION_PATIENTS_LIFE_JOURNEY.md) - Migration mode-de-vie → life-journey
- [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) - Contexte global du projet

---

**Date:** 6 novembre 2025  
**Auteur:** GitHub Copilot + Martial Cayre  
**Version:** 1.0  
**Status:** ✅ Prêt à utiliser
