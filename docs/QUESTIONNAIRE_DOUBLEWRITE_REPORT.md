# Questionnaire Double-write: Guide et Rapports

- Script d’analyse: `node scripts/generate-doublewrite-report.mjs` (exige l’auth Firebase Admin)
- Exemple d’usage:

```sh
# ATTENTION: lecture en prod – nécessite des droits en lecture Firestore
GCLOUD_PROJECT=neuronutrition-app node scripts/generate-doublewrite-report.mjs
```

- Les rapports sont stockés avec horodatage: `docs/QUESTIONNAIRE_DOUBLEWRITE_REPORT_<project>_<timestamp>.md`
- Interprétation:
  - ✅ «Aucune divergence» → prêt à migrer en écriture unique (supprimer double-write).
  - ⚠️ Lignes listées → corriger les documents manquants côté root avant migration.

## Étapes proposées (migration)

- Figer les écritures (fenêtre de maintenance courte) ou migrer par lot idempotent
- Backfill des manquants `patients/{id}/questionnaires/*` → `questionnaires/*`
- Basculer API/Functions en écriture unique (root uniquement)
- Surveiller erreurs et métriques; supprimer le code de double-write
