/**
 * Admin API Routes
 * Protected endpoints for administrative operations
 */

import express from 'express';
import { admin, db } from '../lib/firebase-admin.js';

const router = express.Router();

/**
 * Middleware to verify admin secret header
 */
function requireAdminSecret(req, res, next) {
  const secret = req.headers['x-admin-secret'];
  const expectedSecret = process.env.ADMIN_SECRET || 'change-me-in-production';

  if (!secret || secret !== expectedSecret) {
    console.warn('[ADMIN] Unauthorized admin access attempt');
    return res.status(403).json({ error: 'Forbidden: Invalid admin secret' });
  }

  next();
}

function serializeTimestamp(ts) {
  if (!ts) return null;
  if (ts.toDate) return ts.toDate().toISOString();
  if (ts._seconds !== undefined) return new Date(ts._seconds * 1000).toISOString();
  return ts;
}

function serializeDoc(doc) {
  if (!doc) return null;
  const data = doc.data ? doc.data() : doc;
  if (!data) return null;
  const out = { ...data };
  ['assignedAt', 'submittedAt', 'completedAt', 'updatedAt', 'createdAt'].forEach((k) => {
    if (k in out) out[k] = serializeTimestamp(out[k]);
  });
  return out;
}

/**
 * GET /admin/patients/search?query=...
 * Recherche simple par displayName ou email (contient, insensible à la casse, filtrage en mémoire, limite 50)
 */
router.get('/admin/patients/search', requireAdminSecret, async (req, res) => {
  try {
    const q = String(req.query.query || '')
      .trim()
      .toLowerCase();
    const limit = parseInt(req.query.limit || '50', 10);
    if (!q) return res.status(400).json({ error: 'Missing query' });

    const snap = await db.collection('patients').limit(limit).get();
    const results = [];
    for (const docSnap of snap.docs) {
      const d = docSnap.data();
      const display = (d.displayName || '').toLowerCase();
      const email = (d.email || '').toLowerCase();
      if (display.includes(q) || email.includes(q)) {
        results.push({
          id: docSnap.id,
          displayName: d.displayName || null,
          email: d.email || null,
        });
      }
    }
    return res.json({ ok: true, count: results.length, results });
  } catch (error) {
    console.error('[ADMIN] search error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /admin/questionnaires/:qid/raw?patientId=...
 * Retourne le document root et sous-collection bruts (sérialisés) pour debug
 */
router.get('/admin/questionnaires/:qid/raw', requireAdminSecret, async (req, res) => {
  try {
    const { qid } = req.params;
    const { patientId } = req.query;
    if (!patientId) return res.status(400).json({ error: 'Missing patientId' });

    const rootRef = db.collection('questionnaires').doc(qid);
    const subRef = db
      .collection('patients')
      .doc(String(patientId))
      .collection('questionnaires')
      .doc(qid);

    const [rootSnap, subSnap] = await Promise.all([rootRef.get(), subRef.get()]);

    const root = rootSnap.exists ? serializeDoc(rootSnap) : null;
    const sub = subSnap.exists ? serializeDoc(subSnap) : null;

    return res.json({
      ok: true,
      qid,
      patientId,
      rootExists: rootSnap.exists,
      subExists: subSnap.exists,
      root,
      sub,
      notes:
        'root = /questionnaires/{qid}, sub = /patients/{patientId}/questionnaires/{qid}. Dates au format ISO.',
    });
  } catch (error) {
    console.error('[ADMIN] raw questionnaire error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /admin/questionnaires/backfill
 * Sync subcollection questionnaires to root collection
 * Protected by X-Admin-Secret header
 *
 * Query params:
 *   - dry: true/false (default: true) - dry run without writes
 *   - limit: number (default: 50) - max patients to process
 */
router.post('/admin/questionnaires/backfill', requireAdminSecret, async (req, res) => {
  try {
    const dry = req.query.dry !== 'false'; // default true
    const limit = parseInt(req.query.limit || '50', 10);

    console.log(`[ADMIN] Backfill start (dry=${dry}, limit=${limit})`);

    const patientsSnap = await db.collection('patients').limit(limit).get();

    let processed = 0;
    let created = 0;
    let merged = 0;
    const errors = [];

    for (const pDoc of patientsSnap.docs) {
      const patientId = pDoc.id;
      const practitionerId = pDoc.get('practitionerId') || null;

      try {
        const subSnap = await db
          .collection('patients')
          .doc(patientId)
          .collection('questionnaires')
          .get();

        if (subSnap.empty) continue;

        for (const qDoc of subSnap.docs) {
          processed++;
          const qid = qDoc.id;
          const data = qDoc.data();

          const rootRef = db.collection('questionnaires').doc(qid);
          const rootSnap = await rootRef.get();

          const basePayload = {
            patientUid: patientId,
            practitionerId: practitionerId || data.practitionerId || null,
            title: data.title || 'Questionnaire',
            category: data.category || null,
            status: data.status || 'pending',
            assignedAt: data.assignedAt || admin.firestore.FieldValue.serverTimestamp(),
            submittedAt: data.submittedAt || null,
            completedAt: data.completedAt || null,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            responses: data.responses || {},
            questions: data.questions || [],
          };

          if (!rootSnap.exists) {
            console.log(`[ADMIN] CREATE root questionnaire ${qid}`);
            if (!dry) {
              await rootRef.set(basePayload, { merge: true });
            }
            created++;
          } else {
            const mergePayload = {
              ...basePayload,
              assignedAt: rootSnap.get('assignedAt') || basePayload.assignedAt,
            };
            console.log(`[ADMIN] MERGE root questionnaire ${qid}`);
            if (!dry) {
              await rootRef.set(mergePayload, { merge: true });
            }
            merged++;
          }
        }
      } catch (err) {
        console.error(`[ADMIN] Error processing patient ${patientId}:`, err);
        errors.push({ patientId, error: err.message });
      }
    }

    const result = {
      ok: true,
      dry,
      processed,
      created,
      merged,
      errors: errors.length > 0 ? errors : undefined,
      message: dry
        ? `Dry run completed. Would create ${created}, merge ${merged} questionnaires.`
        : `Backfill completed. Created ${created}, merged ${merged} questionnaires.`,
    };

    console.log('[ADMIN] Backfill result:', result);
    return res.json(result);
  } catch (error) {
    console.error('[ADMIN] Backfill error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

export default router;
