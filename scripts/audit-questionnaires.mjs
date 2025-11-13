#!/usr/bin/env node
/**
 * Audit des questionnaires Firestore: compare root collection vs sous-collection patient.
 * Usage:
 *   node scripts/audit-questionnaires.mjs --email martialcayre@live.fr
 *   node scripts/audit-questionnaires.mjs --patientUid <uid>
 *   node scripts/audit-questionnaires.mjs --all --limit 100
 *   node scripts/audit-questionnaires.mjs --emails file.txt (une adresse par ligne)
 *   node scripts/audit-questionnaires.mjs --csv result.csv
 *
 * Prérequis auth:
 *   Exporter GOOGLE_APPLICATION_CREDENTIALS=/chemin/service-account.json
 *   Le compte doit avoir accès Firestore (roles firestore.user ou editor).
 */

import admin from 'firebase-admin';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      if (a.includes('=')) {
        const [key, val] = a.split('=');
        args[key.slice(2)] = val;
      } else {
        const key = a.slice(2);
        // Check if next arg is a value (not starting with --)
        if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
          args[key] = argv[i + 1];
          i++; // skip next
        } else {
          args[key] = true;
        }
      }
    }
  }
  return args;
}

async function initAdmin() {
  if (admin.apps && admin.apps.length) return;
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credPath || !fs.existsSync(credPath)) {
    console.error('ERREUR: GOOGLE_APPLICATION_CREDENTIALS manquant ou invalide');
    process.exit(1);
  }
  const serviceAccount = JSON.parse(fs.readFileSync(credPath, 'utf-8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

async function fetchPatientByEmail(email) {
  const snap = await admin
    .firestore()
    .collection('patients')
    .where('email', '==', email)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return { id: snap.docs[0].id, data: snap.docs[0].data() };
}

async function fetchAllPatients(limit) {
  const col = admin.firestore().collection('patients').limit(limit);
  const snap = await col.get();
  return snap.docs.map((d) => ({ id: d.id, data: d.data() }));
}

async function auditPatient(patient) {
  const db = admin.firestore();
  const patientUid = patient.id;
  const pdata = patient.data;
  const rootSnap = await db
    .collection('questionnaires')
    .where('patientUid', '==', patientUid)
    .get();
  const rootList = rootSnap.docs.map((d) => {
    const dt = d.data();
    const rawId = d.id;
    const templateId = rawId.includes('_') ? rawId.split('_')[0] : rawId;
    return { rawId, templateId, status: dt.status || null };
  });
  const subSnap = await db
    .collection('patients')
    .doc(patientUid)
    .collection('questionnaires')
    .get();
  const subList = subSnap.docs.map((d) => {
    const raw = d.id;
    const normalized = raw.startsWith(patientUid + '_') ? raw.slice(patientUid.length + 1) : raw;
    return {
      rawId: raw,
      templateId: normalized,
      status: d.data().status || null,
    };
  });
  const rootIds = new Set(rootList.map((r) => r.templateId));
  const subIds = new Set(subList.map((s) => s.templateId));
  const onlyInRoot = [...rootIds].filter((i) => !subIds.has(i));
  const onlyInSub = [...subIds].filter((i) => !rootIds.has(i));
  const mismatches = [];
  for (const id of [...rootIds].filter((i) => subIds.has(i))) {
    const r = rootList.find((x) => x.templateId === id);
    const s = subList.find((x) => x.templateId === id);
    if (r?.status !== s?.status)
      mismatches.push({ templateId: id, rootStatus: r?.status, subStatus: s?.status });
  }
  return {
    patientUid,
    email: pdata.email || '',
    hasQuestionnairesAssigned: !!pdata.hasQuestionnairesAssigned,
    pendingQuestionnairesCount: pdata.pendingQuestionnairesCount || 0,
    rootCount: rootList.length,
    subCount: subList.length,
    onlyInRoot: onlyInRoot.join('|'),
    onlyInSub: onlyInSub.join('|'),
    mismatchCount: mismatches.length,
    mismatches: mismatches.map((m) => `${m.templateId}:${m.rootStatus}->${m.subStatus}`).join('|'),
  };
}

function toCSV(rows) {
  const header = [
    'patientUid',
    'email',
    'hasQuestionnairesAssigned',
    'pendingQuestionnairesCount',
    'rootCount',
    'subCount',
    'onlyInRoot',
    'onlyInSub',
    'mismatchCount',
    'mismatches',
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

async function main() {
  const args = parseArgs(process.argv);
  await initAdmin();

  const emailsFile = args.emails ? String(args.emails) : null;
  let targets = [];

  if (args.email) {
    targets.push(String(args.email));
  }
  if (emailsFile) {
    if (!fs.existsSync(emailsFile)) {
      console.error('Fichier emails introuvable:', emailsFile);
      process.exit(1);
    }
    const content = fs
      .readFileSync(emailsFile, 'utf-8')
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    targets.push(...content);
  }

  const rows = [];

  if (args.patientUid) {
    const doc = await admin.firestore().collection('patients').doc(String(args.patientUid)).get();
    if (!doc.exists) {
      console.error('patientUid introuvable');
      process.exit(1);
    }
    const patient = { id: doc.id, data: doc.data() };
    rows.push(await auditPatient(patient));
  } else if (targets.length) {
    for (const email of targets) {
      const p = await fetchPatientByEmail(email);
      if (!p) {
        console.warn('Patient email non trouvé:', email);
        continue;
      }
      rows.push(await auditPatient(p));
    }
  } else if (args.all) {
    const limit = args.limit ? parseInt(String(args.limit), 10) : 100;
    const patients = await fetchAllPatients(limit);
    for (const p of patients) {
      rows.push(await auditPatient(p));
    }
  } else {
    console.error('Aucun mode sélectionné. Utilisez --email, --patientUid ou --all');
    process.exit(1);
  }

  if (args.csv) {
    const outPath = path.resolve(String(args.csv));
    fs.writeFileSync(outPath, toCSV(rows));
    console.log('CSV écrit:', outPath);
  } else {
    console.log(toCSV(rows));
  }
}

main().catch((err) => {
  console.error('Erreur audit:', err);
  process.exit(1);
});
