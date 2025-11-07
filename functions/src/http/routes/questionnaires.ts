import express, { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';

const router = express.Router();
const db = admin.firestore();

/**
 * GET /api/patients/:patientId/questionnaires
 * Liste tous les questionnaires d'un patient (from root collection)
 */
router.get('/patients/:patientId/questionnaires', async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;

    // TODO: Vérifier authentification (middleware)
    // TODO: Vérifier que l'utilisateur est le patient OU son praticien

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

    return res.json({ questionnaires });
  } catch (error: any) {
    logger.error('GET /patients/:patientId/questionnaires error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

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
        return res.status(404).json({ error: 'Questionnaire not found' });
      }

      return res.json({
        id: qDoc.id,
        ...qDoc.data(),
      });
    } catch (error: any) {
      logger.error('GET /patients/:patientId/questionnaires/:id error:', error);
      return res.status(500).json({ error: 'Internal server error' });
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
        return res.status(404).json({ error: 'Questionnaire not found' });
      }

      const currentStatus = qDoc.data()?.status;
      if (currentStatus === 'submitted' || currentStatus === 'completed') {
        return res
          .status(403)
          .json({ error: 'Cannot modify submitted or completed questionnaire' });
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

      return res.json({
        ok: true,
        savedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('PATCH /responses error:', error);
      return res.status(500).json({ error: 'Internal server error' });
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
    const { status, limit = '50', offset = '0' } = req.query;

    // TODO: Vérifier que l'utilisateur est le praticien

    // Query root collection directly (much more efficient!)
    let query = db
      .collection('questionnaires')
      .where('practitionerId', '==', practitionerId) as admin.firestore.Query;

    if (status) {
      query = query.where('status', '==', status);
    }

    query = query.orderBy('assignedAt', 'desc');

    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);

    if (limitNum > 0) {
      query = query.limit(limitNum);
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

    // Apply offset manually (since Firestore doesn't have native offset)
    const paginated = questionnaires.slice(offsetNum, offsetNum + limitNum);

    return res.json({
      questionnaires: paginated,
      total: questionnaires.length,
      hasMore: offsetNum + limitNum < questionnaires.length,
    });
  } catch (error: any) {
    logger.error('GET /practitioners/:id/questionnaires error:', error);
    return res.status(500).json({ error: 'Internal server error' });
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
        return res.status(404).json({ error: 'Questionnaire not found' });
      }

      const currentStatus = qDoc.data()?.status;
      if (currentStatus === 'submitted' || currentStatus === 'completed') {
        return res.status(400).json({ error: 'Questionnaire already submitted or completed' });
      }

      const updateData = {
        status: 'submitted',
        submittedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Double write to both collections
      await Promise.all([qRefRoot.update(updateData), qRefSub.update(updateData)]);

      return res.json({
        ok: true,
        submittedAt: new Date().toISOString(),
        message: 'Questionnaire submitted successfully',
      });
    } catch (error: any) {
      logger.error('POST /submit error:', error);
      return res.status(500).json({ error: 'Internal server error' });
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
        return res.status(404).json({ error: 'Questionnaire not found' });
      }

      const updateData = {
        status: 'completed',
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Double write to both collections
      await Promise.all([qRefRoot.update(updateData), qRefSub.update(updateData)]);

      return res.json({
        ok: true,
        completedAt: new Date().toISOString(),
        message: 'Questionnaire marked as completed',
      });
    } catch (error: any) {
      logger.error('POST /complete error:', error);
      return res.status(500).json({ error: 'Internal server error' });
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
