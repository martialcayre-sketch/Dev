#!/usr/bin/env node
/**
 * Purge sécurisée des questionnaires legacy (sous-collections patients/{uid}/questionnaires).
 * - Dry-run par défaut: export CSV des éléments à supprimer, aucun delete.
 * - Suppression uniquement si --confirm delete est fourni.
 * - Sécurité: ne supprime que si le doc root `${templateId}_${patientUid}` existe.
 *
 * Usage:
 *   node scripts/purge-legacy-questionnaires.mjs --email <email> [--csv out.csv]
 *   node scripts/purge-legacy-questionnaires.mjs --patientUid <uid> [--csv out.csv]
 *   node scripts/purge-legacy-questionnaires.mjs --all --limit 500 [--csv out.csv]
 *   Options: --dry-run (par défaut), --confirm delete, --verbose
 */

import admin from 'firebase-admin';
import fs from 'node:fs';
import path from 'node:path';
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

function toCSV(rows) {
  const header = [
    'patientUid',
    'email',
    'subPath',
    'templateId',
    'status',
    'assignedAt',
    'rootExists',
    'action',
  ];
  const lines = [header.join(',')];
  for (const r of rows) {
    const line = header
      .map((h) => {
        const v = r[h];
        if (v === undefined || v === null) return '';
        const s = String(v).replace(/"/g, '""');
        return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
      })
      .join(',');
    lines.push(line);
  }
  return lines.join('\n');
}

async function collectTargets(args) {
  const targets = [];
  if (args.patientUid) {
    const doc = await admin.firestore().collection('patients').doc(String(args.patientUid)).get();
    if (!doc.exists) {
      console.error('patientUid introuvable');
      process.exit(1);
    }
    targets.push({ id: doc.id, data: doc.data() });
  } else if (args.email) {
    const p = await getPatientByEmail(String(args.email));
    if (!p) {
      console.error('email introuvable');
      process.exit(1);
    }
    targets.push(p);
  } else if (args.all) {
    const limit = args.limit ? parseInt(String(args.limit), 10) : 100;
    targets.push(...(await listPatients(limit)));
  } else {
    console.error('Spécifier --patientUid, --email ou --all');
    process.exit(1);
  }
  return targets;
}

async function purgeForPatient(patient, opts) {
  const db = admin.firestore();
  const patientUid = patient.id;
  const email = patient.data?.email || '';
  const subCol = db.collection('patients').doc(patientUid).collection('questionnaires');
  const subSnap = await subCol.get();
  const rows = [];
  let deleted = 0,
    skipped = 0;
  for (const doc of subSnap.docs) {
    const rawId = doc.id;
    const baseTemplateId = rawId.startsWith(patientUid + '_')
      ? rawId.slice(patientUid.length + 1)
      : rawId;
    const rootId = `${baseTemplateId}_${patientUid}`;
    const rootRef = db.collection('questionnaires').doc(rootId);
    const rootExists = (await rootRef.get()).exists;
    const subPath = `patients/${patientUid}/questionnaires/${rawId}`;
    const status = doc.get('status') || null;
    const assignedAt = doc.get('assignedAt') || null;

    const action = !rootExists ? 'skip-no-root' : opts.dryRun ? 'would-delete' : 'delete';
    rows.push({
      patientUid,
      email,
      subPath,
      templateId: baseTemplateId,
      status,
      assignedAt,
      rootExists,
      action,
    });

    if (!rootExists) {
      skipped++;
      continue;
    }
    if (!opts.dryRun && opts.confirm === 'delete') {
      await doc.ref.delete();
      deleted++;
    }
  }
  return { rows, deleted, skipped, count: subSnap.size };
}

async function main() {
  const args = parseArgs(process.argv);
  delete process.env.FIRESTORE_EMULATOR_HOST;
  await initAdmin();

  const opts = {
    dryRun: args['dry-run'] !== false && !args.confirm,
    confirm: args.confirm ? String(args.confirm) : '',
    verbose: !!args.verbose,
  };

  const patients = await collectTargets(args);
  const allRows = [];
  let totalDeleted = 0,
    totalSkipped = 0,
    totalDocs = 0;
  for (const p of patients) {
    const { rows, deleted, skipped, count } = await purgeForPatient(p, opts);
    totalDeleted += deleted;
    totalSkipped += skipped;
    totalDocs += count;
    allRows.push(...rows);
    console.log(`[${p.id}] subDocs=${count} deleted=${deleted} skipped=${skipped}`);
    if (opts.verbose) {
      for (const r of rows)
        console.log(`  - ${r.subPath} -> ${r.action} (rootExists=${r.rootExists})`);
    }
  }

  if (args.csv) {
    const outPath = path.resolve(String(args.csv));
    fs.writeFileSync(outPath, toCSV(allRows));
    console.log('CSV écrit:', outPath);
  }

  const mode = opts.dryRun ? 'DRY-RUN' : 'LIVE';
  console.log(
    `DONE [${mode}] patients=${patients.length} subDocs=${totalDocs} deleted=${totalDeleted} skipped=${totalSkipped}`
  );

  if (!opts.dryRun && opts.confirm !== 'delete') {
    console.log('Astuce: utiliser --confirm delete pour confirmer la suppression.');
  }
}

main().catch((err) => {
  console.error('Erreur purge:', err);
  process.exit(1);
});
