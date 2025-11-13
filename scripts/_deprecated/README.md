# Scripts dépréciés

Ces scripts sont conservés à des fins d’archive et ne doivent plus être utilisés en production.

Contexte:

- Passage définitif au stockage root-only des questionnaires (`questionnaires/{templateId}_{patientUid}`).
- Fin du « double‑write » et purge des sous‑collections `patients/{uid}/questionnaires`.

Alternatives maintenues:

- Audit: `scripts/audit-questionnaires.mjs`
- Backfill/normalisation: `scripts/backfill-questionnaires.mjs`
- Purge sécurisée legacy: `scripts/purge-legacy-questionnaires.mjs`

Fichiers archivés ici:

- `analyze-questionnaire-doublewrite.mjs`
- `migrate-patient-questionnaires.mjs`
- `check-annedogne-questionnaires.mjs`
- `fix-annedogne-questionnaires.mjs`
- `migrate-mode-de-vie-to-life-journey.mjs`
- `generate-doublewrite-report.mjs`
- `assign-questionnaires-annedogne.mjs`

Note: la plupart de ces scripts s’arrêtent immédiatement avec un message DEPRECATED.
