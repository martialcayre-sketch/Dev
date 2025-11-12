// Import local copy instead of workspace dependency
import type { Questionnaire } from '@neuronutrition/shared-questionnaires';
import { getAllQuestionnaires, getQuestionnaireById } from '@neuronutrition/shared-questionnaires';
import express, { Request, Response } from 'express';
import { makeOk, makeError } from '../utils/response';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import fs from 'node:fs';
import path from 'node:path';
import { AuthenticatedRequest, requireOwnerOrPractitioner, verifyAuth } from '../middleware/auth';

const router = express.Router();
const db = admin.firestore();

/**
 * GET /api/patients/:patientId/questionnaires
 * Liste tous les questionnaires d'un patient (from root collection)
 */
router.get(
  '/patients/:patientId/questionnaires',
  verifyAuth,
  requireOwnerOrPractitioner('patientId'),
  async (req: AuthenticatedRequest & { id?: string }, res: Response) => {
    try {
      const { patientId } = req.params;

      logger.info(`[GET] Fetching questionnaires for patient: ${patientId}`);

      const questionnairesSnap = await db
        .collection('questionnaires')
        .where('patientUid', '==', patientId)
        .get();

      logger.info(`[GET] Found ${questionnairesSnap.docs.length} questionnaires`);

      // Sort manually after fetching (avoids index requirement)
      const questionnaires = questionnairesSnap.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Calculer progression si possible
          progress: calculateProgress(doc.data().responses, doc.data().questions),
        }))
        .sort((a: any, b: any) => {
          // Sort by assignedAt desc (most recent first)
          const aTime = a.assignedAt?.toMillis?.() || 0;
          const bTime = b.assignedAt?.toMillis?.() || 0;
          return bTime - aTime;
        });

      return res.json(makeOk({ questionnaires }, (req as any).id));
    } catch (error: any) {
      logger.error('GET /patients/:patientId/questionnaires error:', error);
      return res.status(500).json(makeError('internal', 'Internal server error', (req as any).id));
    }
  }
);

/**
 * GET /api/patients/:patientId/questionnaires/:questionnaireId
 * Détails d'un questionnaire spécifique (from root collection)
 */
router.get(
  '/patients/:patientId/questionnaires/:questionnaireId',
  async (req: Request, res: Response) => {
    try {
      const { questionnaireId } = req.params;

      // TODO: Vérifier authentification
      // TODO: Vérifier permissions

      const qDoc = await db.collection('questionnaires').doc(questionnaireId).get();

      if (!qDoc.exists) {
        return res.status(404).json(makeError('not_found', 'Questionnaire not found', (req as any).id));
      }

      return res.json(makeOk({
        id: qDoc.id,
        ...qDoc.data(),
      }, (req as any).id));
    } catch (error: any) {
      logger.error('GET /patients/:patientId/questionnaires/:id error:', error);
      return res.status(500).json(makeError('internal', 'Internal server error', (req as any).id));
    }
  }
);

/**
 * PATCH /api/patients/:patientId/questionnaires/:questionnaireId/responses
 * Auto-save incrémental des réponses (double-write to both collections)
 */
router.patch(
  '/patients/:patientId/questionnaires/:questionnaireId/responses',
  express.json(),
  async (req: Request, res: Response) => {
    try {
      const { patientId, questionnaireId } = req.params;
      const { responses } = req.body;

      // TODO: Vérifier que l'utilisateur est bien le patient
      // TODO: Vérifier que le questionnaire n'est pas submitted/completed

      const qRefRoot = db.collection('questionnaires').doc(questionnaireId);
      const qRefSub = db
        .collection('patients')
        .doc(patientId)
        .collection('questionnaires')
        .doc(questionnaireId);

      const qDoc = await qRefRoot.get();
      if (!qDoc.exists) {
        return res.status(404).json(makeError('not_found', 'Questionnaire not found', (req as any).id));
      }

      const currentStatus = qDoc.data()?.status;
      if (currentStatus === 'submitted' || currentStatus === 'completed') {
        return res
          .status(403)
          .json(makeError('forbidden', 'Cannot modify submitted or completed questionnaire', (req as any).id));
      }

      // Merge manuel avec réponses existantes
      const existing = (qDoc.data() && (qDoc.data() as any).responses) || {};
      const merged = { ...existing, ...(responses || {}) };

      const updateData = {
        responses: merged,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: currentStatus === 'pending' ? 'in_progress' : currentStatus,
      };

      // Double write to both collections
      await Promise.all([qRefRoot.update(updateData), qRefSub.update(updateData)]);

      return res.json(makeOk({
        savedAt: new Date().toISOString(),
      }, (req as any).id));
    } catch (error: any) {
      logger.error('PATCH /responses error:', error);
      return res.status(500).json(makeError('internal', 'Internal server error', (req as any).id));
    }
  }
);

/**
 * GET /api/practitioners/:practitionerId/questionnaires
 * Liste tous les questionnaires de tous les patients d'un praticien (from root collection)
 */
router.get('/practitioners/:practitionerId/questionnaires', async (req: Request, res: Response) => {
  try {
    const { practitionerId } = req.params;
    const { status, limit = '50', cursor } = req.query as any;

    // TODO: Vérifier que l'utilisateur est le praticien

    // Query root collection directly (much more efficient!)
    let query = db
      .collection('questionnaires')
      .where('practitionerId', '==', practitionerId) as admin.firestore.Query;

    if (status) {
      query = query.where('status', '==', status);
    }

    query = query.orderBy('assignedAt', 'desc').orderBy(admin.firestore.FieldPath.documentId());

    const limitNum = parseInt(limit as string, 10);
    if (limitNum > 0) {
      query = query.limit(limitNum);
    }

    // Cursor-based pagination: base64(assignedAtISO|docId)
    if (cursor && typeof cursor === 'string') {
      try {
        const raw = Buffer.from(cursor, 'base64').toString('utf-8');
        const [assignedAtIso, docId] = raw.split('|');
        if (assignedAtIso && docId) {
          const ts = admin.firestore.Timestamp.fromDate(new Date(assignedAtIso));
          query = query.startAfter(ts, docId);
        }
      } catch {}
    }

    const questionnairesSnap = await query.get();

    // Fetch patient details for each questionnaire
    const questionnaires = await Promise.all(
      questionnairesSnap.docs.map(async (qDoc) => {
        const data = qDoc.data();
        const patientId = data.patientUid;

        let patientName = 'Unknown';
        let patientEmail = '';

        if (patientId) {
          try {
            const patientSnap = await db.collection('patients').doc(patientId).get();
            if (patientSnap.exists) {
              const patientData = patientSnap.data()!;
              patientName = patientData.displayName || patientData.email || patientId;
              patientEmail = patientData.email || '';
            }
          } catch (err) {
            logger.warn(`Failed to fetch patient ${patientId}:`, err);
          }
        }

        return {
          id: qDoc.id,
          patientId,
          patientName,
          patientEmail,
          ...data,
        };
      })
    );

    const paginated = questionnaires.slice(0, limitNum);
    const last: any = paginated[paginated.length - 1];
    const nextCursor =
      last && last.assignedAt && last.id
        ? Buffer.from(
            `${last.assignedAt.toDate ? last.assignedAt.toDate().toISOString() : last.assignedAt}|${
              last.id
            }`,
            'utf-8'
          ).toString('base64')
        : null;

    return res.json(makeOk({
      questionnaires: paginated,
      total: questionnaires.length,
      nextCursor,
      hasMore: !!nextCursor,
    }, (req as any).id));
  } catch (error: any) {
    logger.error('GET /practitioners/:id/questionnaires error:', error);
    return res.status(500).json(makeError('internal', 'Internal server error', (req as any).id));
  }
});

/**
 * POST /api/patients/:patientId/questionnaires/:questionnaireId/submit
 * Submit questionnaire for practitioner review
 */
router.post(
  '/patients/:patientId/questionnaires/:questionnaireId/submit',
  async (req: Request, res: Response) => {
    try {
      const { patientId, questionnaireId } = req.params;

      // TODO: Vérifier que l'utilisateur est bien le patient
      // TODO: Vérifier que toutes les réponses obligatoires sont remplies

      const qRefRoot = db.collection('questionnaires').doc(questionnaireId);
      const qRefSub = db
        .collection('patients')
        .doc(patientId)
        .collection('questionnaires')
        .doc(questionnaireId);

      const qDoc = await qRefRoot.get();
      if (!qDoc.exists) {
        return res.status(404).json(makeError('not_found', 'Questionnaire not found', (req as any).id));
      }

      const currentStatus = qDoc.data()?.status;
      if (currentStatus === 'submitted' || currentStatus === 'completed') {
        return res.status(400).json(makeError('already_submitted', 'Questionnaire already submitted or completed', (req as any).id));
      }

      // Idempotency via header Idempotency-Key
      const keyHeader = req.header('Idempotency-Key');
      const idemKey = (keyHeader || '').trim();
      if (idemKey && idemKey.length >= 8 && idemKey.length <= 128) {
        const idemRef = db.collection('idempotency').doc(`submit_${questionnaireId}_${idemKey}`);
        const idemSnap = await idemRef.get();
        if (idemSnap.exists) {
          return res.json(makeOk({ idempotent: true, submittedAt: idemSnap.get('submittedAt') }, (req as any).id));
        }
        await idemRef.set({
          submittedAt: admin.firestore.FieldValue.serverTimestamp(),
          patientId,
          questionnaireId,
        });
      }

      const updateData = {
        status: 'submitted',
        submittedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        idempotencyKey: idemKey || null,
      };

      // Double write to both collections
      await Promise.all([qRefRoot.update(updateData), qRefSub.update(updateData)]);

      return res.json(makeOk({
        submittedAt: new Date().toISOString(),
        message: 'Questionnaire submitted successfully',
      }, (req as any).id));
    } catch (error: any) {
      logger.error('POST /submit error:', error);
      return res.status(500).json(makeError('internal', 'Internal server error', (req as any).id));
    }
  }
);

/**
 * POST /api/patients/:patientId/questionnaires/:questionnaireId/complete
 * Mark questionnaire as completed (practitioner action)
 */
router.post(
  '/patients/:patientId/questionnaires/:questionnaireId/complete',
  async (req: Request, res: Response) => {
    try {
      const { patientId, questionnaireId } = req.params;

      // TODO: Vérifier que l'utilisateur est le praticien assigné

      const qRefRoot = db.collection('questionnaires').doc(questionnaireId);
      const qRefSub = db
        .collection('patients')
        .doc(patientId)
        .collection('questionnaires')
        .doc(questionnaireId);

      const qDoc = await qRefRoot.get();
      if (!qDoc.exists) {
        return res.status(404).json(makeError('not_found', 'Questionnaire not found', (req as any).id));
      }

      // Idempotency via header Idempotency-Key
      const keyHeader = req.header('Idempotency-Key');
      const idemKey = (keyHeader || '').trim();
      if (idemKey && idemKey.length >= 8 && idemKey.length <= 128) {
        const idemRef = db.collection('idempotency').doc(`complete_${questionnaireId}_${idemKey}`);
        const idemSnap = await idemRef.get();
        if (idemSnap.exists) {
          return res.json(makeOk({ idempotent: true, completedAt: idemSnap.get('completedAt') }, (req as any).id));
        }
        await idemRef.set({
          completedAt: admin.firestore.FieldValue.serverTimestamp(),
          patientId,
          questionnaireId,
        });
      }

      const updateData = {
        status: 'completed',
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        idempotencyKey: idemKey || null,
      };

      // Double write to both collections
      await Promise.all([qRefRoot.update(updateData), qRefSub.update(updateData)]);

      return res.json(makeOk({
        completedAt: new Date().toISOString(),
        message: 'Questionnaire marked as completed',
      }, (req as any).id));
    } catch (error: any) {
      logger.error('POST /complete error:', error);
      return res.status(500).json(makeError('internal', 'Internal server error', (req as any).id));
    }
  }
);

/**
 * Helper pour calculer le % de progression
 */
function calculateProgress(responses: any, questions: any): number {
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return 0;
  }

  if (!responses || Object.keys(responses).length === 0) {
    return 0;
  }

  const answeredCount = Object.keys(responses).filter((key) => {
    const answer = responses[key];
    return answer !== null && answer !== undefined && answer !== '';
  }).length;

  return Math.round((answeredCount / questions.length) * 100);
}

export default router;
/**
 * Catalog endpoints (read-only)
 * - GET /catalog/questionnaires            -> list curated questionnaires from shared package
 * - GET /catalog/questionnaires/:id        -> details of a curated questionnaire
 * - GET /catalog/extracted                 -> list of extracted questionnaire files (from repo data)
 * - GET /catalog/extracted/:category/:slug -> extracted meta and text
 */

// Curated catalog from shared package (fast, bundled)
router.get('/catalog/questionnaires', (req: Request, res: Response) => {
  try {
    const all = getAllQuestionnaires().map((q: Questionnaire) => ({
      id: q.metadata.id,
      title: q.metadata.title,
      category: q.metadata.category,
      description: q.metadata.description ?? '',
      version: q.metadata.version ?? 1,
      questionsCount: Array.isArray(q.questions) ? q.questions.length : 0,
    }));
    return res.json(makeOk({ questionnaires: all }, (req as any).id));
  } catch (error: any) {
    logger.error('GET /catalog/questionnaires error:', error);
    return res.status(500).json(makeError('internal', 'Internal server error', (req as any).id));
  }
});

router.get('/catalog/questionnaires/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const q = getQuestionnaireById(id);
    if (!q) return res.status(404).json(makeError('not_found', 'Questionnaire not found', (req as any).id));
    return res.json(makeOk(q as any, (req as any).id));
  } catch (error: any) {
    logger.error('GET /catalog/questionnaires/:id error:', error);
    return res.status(500).json(makeError('internal', 'Internal server error', (req as any).id));
  }
});

// Extracted catalog from filesystem (developer productivity/local use)
const extractedRoot = path.resolve(process.cwd(), '..', 'data', 'questionnaires', 'extracted');

router.get('/catalog/extracted', (req: Request, res: Response) => {
  try {
    if (!fs.existsSync(extractedRoot)) {
      return res.json(makeOk({ categories: [], note: 'extracted root not found on runtime' }, (req as any).id));
    }
    const categories = fs
      .readdirSync(extractedRoot, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    const result = categories.map((category) => {
      const dir = path.join(extractedRoot, category);
      const entries = fs
        .readdirSync(dir)
        .filter((f) => f.endsWith('.meta.json'))
        .map((f) => {
          const slug = f.replace(/\.meta\.json$/, '');
          // try to peek meta title if small
          let title = slug;
          try {
            const meta = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8')) as any;
            title = meta.title || meta.name || slug;
          } catch {}
          return { category, slug, title };
        });
      return { category, items: entries };
    });

    return res.json(makeOk({ categories: result }, (req as any).id));
  } catch (error: any) {
    logger.error('GET /catalog/extracted error:', error);
    return res.status(500).json(makeError('internal', 'Internal server error', (req as any).id));
  }
});

router.get('/catalog/extracted/:category/:slug', (req: Request, res: Response) => {
  try {
    const { category, slug } = req.params;
    const dir = path.join(extractedRoot, category);
    const metaPath = path.join(dir, `${slug}.meta.json`);
    const txtPath = path.join(dir, `${slug}.txt`);
    if (!fs.existsSync(metaPath)) {
      return res.status(404).json(makeError('not_found', 'Extracted file not found', (req as any).id));
    }
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    const text = fs.existsSync(txtPath) ? fs.readFileSync(txtPath, 'utf-8') : '';
    return res.json(makeOk({ category, slug, meta, text }, (req as any).id));
  } catch (error: any) {
    logger.error('GET /catalog/extracted/:category/:slug error:', error);
    return res.status(500).json(makeError('internal', 'Internal server error', (req as any).id));
  }
});
