# Questionnaire Double-write: Guide et Rapports (ARCHIVÉ)

> ⚠️ **DÉPRÉCIÉ** : Ce document est archivé. L'architecture double-write a été abandonnée en novembre 2025 au profit de l'architecture root-only.
>
> Voir [QUESTIONNAIRE_STORAGE_OPTIMIZATION.md](./QUESTIONNAIRE_STORAGE_OPTIMIZATION.md) pour l'architecture actuelle.

---

**Document historique conservé pour référence.**

- Script d'analyse: `node scripts/generate-doublewrite-report.mjs` (exige l'auth Firebase Admin)
- Exemple d'usage:

```sh
# ATTENTION: lecture en prod – nécessite des droits en lecture Firestore
GCLOUD_PROJECT=neuronutrition-app node scripts/generate-doublewrite-report.mjs
```

- Les rapports sont stockés avec horodatage: `docs/QUESTIONNAIRE_DOUBLEWRITE_REPORT_<project>_<timestamp>.md`
- Interprétation:
  - ✅ «Aucune divergence» → prêt à migrer en écriture unique (supprimer double-write).
  - ⚠️ Lignes listées → corriger les documents manquants côté root avant migration.

## Étapes proposées (migration) - OBSOLÈTE

> ⚠️ **Note** : Ces étapes ont été complétées en novembre 2025. L'architecture root-only est déployée en production.

- ~~Figer les écritures (fenêtre de maintenance courte) ou migrer par lot idempotent~~
- ~~Backfill des manquants `patients/{id}/questionnaires/*` → `questionnaires/*`~~
- ~~Basculer API/Functions en écriture unique (root uniquement)~~
- ~~Surveiller erreurs et métriques; supprimer le code de double-write~~

**État actuel** : Les scripts utilisés pour cette migration sont maintenant dans `scripts/_deprecated/` et remplacés par `audit-questionnaires.mjs`, `backfill-questionnaires.mjs`, et `purge-legacy-questionnaires.mjs`.
