# 🛠️ Scripts de gestion des questionnaires

<!-- markdownlint-disable MD024 -->

Documentation des scripts d'audit, backfill et purge pour la gestion des questionnaires.

## 📋 Vue d'ensemble

Suite à la migration vers l'architecture root-only (`questionnaires/{templateId}_{patientUid}`), plusieurs scripts ont été créés pour assurer l'intégrité des données et faciliter les opérations de maintenance.

---

## ✅ Scripts actifs

### 1. `audit-questionnaires.mjs`

**Objectif** : Audit complet de la cohérence entre collection root et sous-collections legacy.

**Localisation** : `scripts/audit-questionnaires.mjs`

#### Fonctionnalités

- Compare le nombre de questionnaires dans la collection root vs sous-collections
- Identifie les questionnaires présents uniquement dans root ou uniquement dans sub
- Détecte les divergences de statut entre les deux sources
- Export CSV pour analyse

#### Usage

```bash
# Audit d'un patient par email
node scripts/audit-questionnaires.mjs --email patient@example.com

# Audit d'un patient par UID
node scripts/audit-questionnaires.mjs --patientUid 5KUYcrPe...

# Audit global (tous les patients)
node scripts/audit-questionnaires.mjs --all --limit 500

# Avec export CSV
node scripts/audit-questionnaires.mjs --all --limit 500 --csv audit.csv

# Mode verbose
node scripts/audit-questionnaires.mjs --all --verbose
```

#### Format de sortie CSV

```csv
patientUid,email,hasQuestionnairesAssigned,pendingQuestionnairesCount,rootCount,subCount,onlyInRoot,onlyInSub,mismatchCount,mismatches
5KUYcrPe...,patient@example.com,true,4,4,0,dnsm|nutri-assessment,,0,
```

#### Colonnes

- `patientUid` : UID du patient
- `email` : Email du patient
- `rootCount` : Nombre de questionnaires dans la collection root
- `subCount` : Nombre de questionnaires dans la sous-collection legacy
- `onlyInRoot` : IDs des questionnaires uniquement dans root (séparés par `|`)
- `onlyInSub` : IDs des questionnaires uniquement dans sub
- `mismatchCount` : Nombre de divergences de statut
- `mismatches` : Détails des divergences (`templateId:rootStatus->subStatus`)

#### Authentification

- Variable d'environnement `GOOGLE_APPLICATION_CREDENTIALS` pointant vers le JSON de service account
- Ou Application Default Credentials (ADC) via `gcloud auth application-default login`

---

### 2. `backfill-questionnaires.mjs`

**Objectif** : Copier les questionnaires depuis les sous-collections legacy vers la collection root.

**Localisation** : `scripts/backfill-questionnaires.mjs`

#### Fonctionnalités

- Copie les questionnaires de `patients/{uid}/questionnaires/` vers `questionnaires/{templateId}_{patientUid}`
- Normalisation des IDs (retire les préfixes `{patientUid}_` si présents)
- Nettoyage automatique des documents root mal nommés
- Idempotent : ne remplace pas les documents existants sauf si `--force`

#### Usage

```bash
# Backfill pour un patient par email
node scripts/backfill-questionnaires.mjs --email patient@example.com

# Backfill pour un patient par UID
node scripts/backfill-questionnaires.mjs --patientUid 5KUYcrPe...

# Backfill global (tous les patients)
node scripts/backfill-questionnaires.mjs --all --limit 500

# Avec force (écrase les documents existants)
node scripts/backfill-questionnaires.mjs --email patient@example.com --force

# Dry-run (simulation sans écriture)
node scripts/backfill-questionnaires.mjs --all --dry-run

# Mode verbose
node scripts/backfill-questionnaires.mjs --all --verbose
```

#### Normalisation des IDs

Le script détecte et corrige les IDs mal formés :

- **Sous-collection** : `{patientUid}_dnsm` → **Root** : `dnsm_{patientUid}`
- **Sous-collection** : `dnsm` → **Root** : `dnsm_{patientUid}`

Il supprime aussi les documents root créés avec des IDs erronés (ex: `{patientUid}_dnsm_{patientUid}`).

#### Actions

- `created` : Document créé dans root
- `merged` : Document existant mis à jour (si `--force`)
- `skip-exists` : Document déjà présent, pas d'action
- `would-create` / `would-merge` : Actions prévues en dry-run
- `deleted-wrong` : Document root mal nommé supprimé

#### Sortie

```
[5KUYcrPe...] created=4 merged=0 skipped=0
DONE created=4 merged=0 skipped=0
```

---

### 3. `purge-legacy-questionnaires.mjs`

**Objectif** : Suppression sécurisée des sous-collections legacy après migration.

**Localisation** : `scripts/purge-legacy-questionnaires.mjs`

#### Fonctionnalités

- **Dry-run par défaut** : aucune suppression sans confirmation explicite
- Export CSV des éléments à supprimer pour vérification
- Sécurité : ne supprime que si le document root correspondant existe
- Support batch pour performance

#### Usage

```bash
# Dry-run (par défaut, aucune suppression)
node scripts/purge-legacy-questionnaires.mjs --email patient@example.com --csv purge.csv

# Dry-run global avec verbose
node scripts/purge-legacy-questionnaires.mjs --all --limit 500 --csv purge-dryrun.csv --verbose

# Suppression réelle (ATTENTION: irréversible)
node scripts/purge-legacy-questionnaires.mjs --all --limit 500 --csv purge-live.csv --confirm delete

# Pour un patient spécifique
node scripts/purge-legacy-questionnaires.mjs --patientUid 5KUYcrPe... --confirm delete
```

#### Format CSV

```csv
patientUid,email,subPath,templateId,status,assignedAt,rootExists,action
5KUYcrPe...,patient@example.com,patients/.../questionnaires/dnsm,dnsm,pending,2025-11-10,true,delete
```

#### Actions

- `would-delete` : Suppression prévue (dry-run)
- `delete` : Suppression effectuée
- `skip-no-root` : Document sub ignoré car pas de root correspondant (sécurité)

#### Sécurité

Le script vérifie **TOUJOURS** que le document root `{templateId}_{patientUid}` existe avant de supprimer le document sub. Si le root n'existe pas, le document sub est conservé (action `skip-no-root`).

---

## ⚠️ Scripts dépréciés

Les scripts suivants sont archivés dans `scripts/_deprecated/` et ne doivent plus être utilisés :

- `analyze-questionnaire-doublewrite.mjs` → Remplacé par `audit-questionnaires.mjs`
- `migrate-patient-questionnaires.mjs` → Remplacé par `backfill-questionnaires.mjs`
- `check-annedogne-questionnaires.mjs` → Utiliser `audit-questionnaires.mjs`
- `fix-annedogne-questionnaires.mjs` → Utiliser `backfill-questionnaires.mjs`
- `migrate-mode-de-vie-to-life-journey.mjs` → Migration terminée
- `generate-doublewrite-report.mjs` → Plus nécessaire
- `assign-questionnaires-annedogne.mjs` → Utiliser callable `assignQuestionnaires`

Tous ces scripts affichent un message de dépréciation et quittent immédiatement.

---

## 🔄 Workflow typique de migration

### 1. Audit initial

```bash
# Générer un audit de l'état actuel
node scripts/audit-questionnaires.mjs --all --limit 500 --csv audit-before.csv
```

### 2. Backfill

```bash
# Dry-run pour vérifier
node scripts/backfill-questionnaires.mjs --all --limit 500 --dry-run --verbose

# Exécution réelle
node scripts/backfill-questionnaires.mjs --all --limit 500 --verbose
```

### 3. Vérification post-backfill

```bash
# Audit pour vérifier la cohérence
node scripts/audit-questionnaires.mjs --all --limit 500 --csv audit-after-backfill.csv

# Vérifier que rootCount == subCount pour tous les patients
```

### 4. Purge sécurisée

```bash
# Dry-run avec export CSV
node scripts/purge-legacy-questionnaires.mjs --all --limit 500 --csv purge-dryrun.csv --verbose

# Vérifier le CSV, puis exécuter la purge réelle
node scripts/purge-legacy-questionnaires.mjs --all --limit 500 --csv purge-live.csv --confirm delete
```

### 5. Audit final

```bash
# Vérifier que subCount=0 pour tous les patients
node scripts/audit-questionnaires.mjs --all --limit 500 --csv audit-final.csv
```

---

## 📊 Exemple de résultats

### Audit initial (avant backfill)

```
patientUid,email,rootCount,subCount,onlyInRoot,onlyInSub
5KUYcrPe...,patient@example.com,0,4,,dnsm|nutri-assessment|plaintes-et-douleurs|life-journey
```

### Après backfill

```
patientUid,email,rootCount,subCount,onlyInRoot,onlyInSub
5KUYcrPe...,patient@example.com,4,4,,,
```

### Après purge

```
patientUid,email,rootCount,subCount,onlyInRoot,onlyInSub
5KUYcrPe...,patient@example.com,4,0,dnsm|nutri-assessment|plaintes-et-douleurs|life-journey,
```

---

## 🔧 Configuration et prérequis

### Service Account

1. Créer un service account dans Firebase Console avec rôle `Cloud Datastore User`
2. Télécharger la clé JSON
3. Exporter la variable d'environnement :

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
```

### Application Default Credentials (alternative)

```bash
gcloud auth application-default login
```

### Désactiver l'émulateur

Les scripts désactivent automatiquement `FIRESTORE_EMULATOR_HOST` pour éviter les conflits, mais assurez-vous de ne pas avoir d'autres variables d'environnement emulator actives.

---

## 🚨 Bonnes pratiques

1. **Toujours commencer par un audit** avant toute modification
2. **Utiliser dry-run** pour valider les actions avant exécution
3. **Exporter les CSV** pour traçabilité et analyse
4. **Tester sur un patient unique** avant un traitement global
5. **Sauvegarder les CSV de purge** avant suppression définitive
6. **Vérifier les logs** en mode `--verbose` pour identifier les problèmes
7. **Ne jamais forcer** (`--force`) sans vérification préalable

---

## 📈 Monitoring et alertes

### Audit périodique recommandé

```bash
# Cron job quotidien
0 2 * * * cd /path/to/project && node scripts/audit-questionnaires.mjs --all --limit 1000 --csv audit-$(date +\%Y\%m\%d).csv
```

### Alertes à mettre en place

- **rootCount == 0 && subCount > 0** : Patient non migré
- **mismatchCount > 0** : Incohérence de statut
- **onlyInSub non vide** : Documents manquants dans root

---

## 🔗 Voir aussi

- [QUESTIONNAIRE_STORAGE_OPTIMIZATION.md](./QUESTIONNAIRE_STORAGE_OPTIMIZATION.md) - Architecture et migration
- [API_BACKEND_QUESTIONNAIRES.md](./API_BACKEND_QUESTIONNAIRES.md) - API Cloud Functions
- `scripts/_deprecated/README.md` - Scripts archivés

---

**Dernière mise à jour** : 13 novembre 2025  
**Version** : 1.0.0  
**Statut** : ✅ Production
