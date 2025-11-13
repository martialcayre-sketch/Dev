#!/usr/bin/env node
/**
 * Backfill des questionnaires: copie depuis patients/{uid}/questionnaires vers collection root 'questionnaires'.
 * - Crée des documents root avec ID `${templateId}_${patientUid}` si manquants.
 * - Merge les données existantes, préserve assignedAt/status/responses/etc.
 * - Idempotent: ne remplace pas si root existe déjà (sauf --force).
 *
 * Usage:
 *   node scripts/backfill-questionnaires.mjs --patientUid <uid>
 *   node scripts/backfill-questionnaires.mjs --email <email>
 *   node scripts/backfill-questionnaires.mjs --all --limit 100
 *   node scripts/backfill-questionnaires.mjs --dry-run
 *   node scripts/backfill-questionnaires.mjs --force
 */

import admin from 'firebase-admin';
import fs from 'node:fs';
import process from 'node:process';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    if (a.includes('=')) {
      const [k, v] = a.split('=');
      args[k.slice(2)] = v;
    } else {
      const k = a.slice(2);
      if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
        args[k] = argv[i + 1];
        i++;
      } else {
        args[k] = true;
      }
    }
  }
  return args;
}

async function initAdmin() {
  if (admin.apps && admin.apps.length) return;
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credPath || !fs.existsSync(credPath)) {
    // Essayer ADC si pas de JSON
    try {
      admin.initializeApp({ credential: admin.credential.applicationDefault() });
      return;
    } catch (e) {
      console.error(
        'Credentials manquants. Définir GOOGLE_APPLICATION_CREDENTIALS ou ADC via gcloud.'
      );
      process.exit(1);
    }
  }
  const serviceAccount = JSON.parse(fs.readFileSync(credPath, 'utf-8'));
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

async function getPatientByEmail(email) {
  const snap = await admin
    .firestore()
    .collection('patients')
    .where('email', '==', email)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return { id: snap.docs[0].id, data: snap.docs[0].data() };
}

async function listPatients(limit) {
  const snap = await admin.firestore().collection('patients').limit(limit).get();
  return snap.docs.map((d) => ({ id: d.id, data: d.data() }));
}

async function backfillPatient(patient, opts) {
  const db = admin.firestore();
  const patientUid = patient.id;
  const subCol = db.collection('patients').doc(patientUid).collection('questionnaires');
  const subSnap = await subCol.get();
  const results = [];
  for (const doc of subSnap.docs) {
    const rawId = doc.id;
    const baseTemplateId = rawId.includes('_') ? rawId.split('_').pop() : rawId;
    const targetId = `${baseTemplateId}_${patientUid}`;
    const rootRef = db.collection('questionnaires').doc(targetId);
    const rootDoc = await rootRef.get();
    if (rootDoc.exists && !opts.force) {
      results.push({ templateId: baseTemplateId, targetId, action: 'skip-exists' });
      continue;
    }
    const data = doc.data();
    const payload = {
      ...data,
      templateId: baseTemplateId,
      patientUid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      assignedAt: data.assignedAt || admin.firestore.FieldValue.serverTimestamp(),
    };
    if (opts.dryRun) {
      results.push({
        templateId: baseTemplateId,
        targetId,
        action: rootDoc.exists ? 'would-merge' : 'would-create',
      });
      continue;
    }
    if (rootDoc.exists) {
      await rootRef.set(payload, { merge: true });
      results.push({ templateId: baseTemplateId, targetId, action: 'merged' });
    } else {
      await rootRef.set({
        ...payload,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      results.push({ templateId: baseTemplateId, targetId, action: 'created' });
    }

    // Cleanup: if sub ID was composite including patientUid, we may have created wrong docs earlier
    if (rawId.includes('_') && rawId !== baseTemplateId) {
      // Variant 1: `${rawId}_${patientUid}` (e.g., `kNfy..._dnsm_kNfy...`)
      const wrongId1 = `${rawId}_${patientUid}`;
      if (wrongId1 !== targetId) {
        const wrongRef1 = db.collection('questionnaires').doc(wrongId1);
        const wrongSnap1 = await wrongRef1.get();
        if (wrongSnap1.exists && !opts.dryRun) {
          await wrongRef1.delete();
          results.push({ templateId: baseTemplateId, targetId: wrongId1, action: 'deleted-wrong' });
        }
      }
      // Variant 2: `${patientUid}_${baseTemplateId}` (e.g., `kNfy..._dnsm`)
      const wrongId2 = `${patientUid}_${baseTemplateId}`;
      if (wrongId2 !== targetId) {
        const wrongRef2 = db.collection('questionnaires').doc(wrongId2);
        const wrongSnap2 = await wrongRef2.get();
        if (wrongSnap2.exists && !opts.dryRun) {
          await wrongRef2.delete();
          results.push({ templateId: baseTemplateId, targetId: wrongId2, action: 'deleted-wrong' });
        }
      }
    }
  }
  return results;
}

async function main() {
  const args = parseArgs(process.argv);
  // Eviter l'émulateur si présent
  delete process.env.FIRESTORE_EMULATOR_HOST;
  await initAdmin();

  const limit = args.limit ? parseInt(String(args.limit), 10) : 100;
  const opts = { dryRun: !!args['dry-run'], force: !!args.force };

  const patients = [];
  if (args.patientUid) {
    const doc = await admin.firestore().collection('patients').doc(String(args.patientUid)).get();
    if (!doc.exists) {
      console.error('patientUid introuvable');
      process.exit(1);
    }
    patients.push({ id: doc.id, data: doc.data() });
  } else if (args.email) {
    const p = await getPatientByEmail(String(args.email));
    if (!p) {
      console.error('email introuvable');
      process.exit(1);
    }
    patients.push(p);
  } else if (args.all) {
    patients.push(...(await listPatients(limit)));
  } else {
    console.error('Spécifier --patientUid, --email ou --all');
    process.exit(1);
  }

  let totalCreated = 0,
    totalMerged = 0,
    totalSkipped = 0;
  for (const p of patients) {
    const res = await backfillPatient(p, opts);
    const created = res.filter((r) => r.action === 'created').length;
    const merged = res.filter((r) => r.action === 'merged').length;
    const skipped = res.filter((r) => r.action.startsWith('skip')).length;
    totalCreated += created;
    totalMerged += merged;
    totalSkipped += skipped;
    console.log(`[${p.id}] created=${created} merged=${merged} skipped=${skipped}`);
    if (args.verbose) {
      for (const r of res) console.log(`  - ${r.templateId} -> ${r.targetId} : ${r.action}`);
    }
  }
  console.log(`DONE created=${totalCreated} merged=${totalMerged} skipped=${totalSkipped}`);
}

main().catch((err) => {
  console.error('Erreur backfill:', err);
  process.exit(1);
});
