/**
 * Questionnaires API Routes
 * Handles CRUD operations for patient questionnaires
 */

import express from 'express';
import { admin, db } from '../lib/firebase-admin.js';
import { authenticateToken, requirePatient, requirePractitioner } from '../middleware/auth.js';

const router = express.Router();

/**
 * Helper pour calculer le % de progression
 */
function calculateProgress(responses, questions) {
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return 0;
  }
  if (!responses || Object.keys(responses).length === 0) {
    return 0;
  }
  const answered = Object.values(responses).filter((v) => v !== null && v !== undefined).length;
  return Math.round((answered / questions.length) * 100);
}

/**
 * Helper pour serialiser les timestamps Firestore en ISO strings
 */
function serializeTimestamp(timestamp) {
  if (!timestamp) return null;
  if (timestamp.toDate) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp._seconds !== undefined) {
    return new Date(timestamp._seconds * 1000).toISOString();
  }
  return timestamp;
}

/**
 * Helper pour serialiser un document questionnaire
 */
function serializeQuestionnaire(doc) {
  const data = doc.data ? doc.data() : doc;
  return {
    id: doc.id || data.id,
    ...data,
    assignedAt: serializeTimestamp(data.assignedAt),
    submittedAt: serializeTimestamp(data.submittedAt),
    completedAt: serializeTimestamp(data.completedAt),
    updatedAt: serializeTimestamp(data.updatedAt),
    progress: calculateProgress(data.responses, data.questions),
  };
}

/**
 * GET /patients/:patientId/questionnaires
 * Liste tous les questionnaires d'un patient (from root collection)
 */
router.get(
  '/patients/:patientId/questionnaires',
  authenticateToken,
  requirePatient,
  async (req, res) => {
    try {
      const { patientId } = req.params;

      console.log(`[API] GET /patients/${patientId}/questionnaires`);

      const questionnairesSnap = await db
        .collection('questionnaires')
        .where('patientUid', '==', patientId)
        .get();

      console.log(`[API] Found ${questionnairesSnap.docs.length} questionnaires (root)`);

      let questionnaires = questionnairesSnap.docs
        .map((doc) => serializeQuestionnaire(doc))
        .sort((a, b) => {
          const aTime = a.assignedAt ? new Date(a.assignedAt).getTime() : 0;
          const bTime = b.assignedAt ? new Date(b.assignedAt).getTime() : 0;
          return bTime - aTime;
        });

      if (questionnaires.length === 0) {
        console.log('[API] Root empty, fallback to subcollection');
        const subSnap = await db
          .collection('patients')
          .doc(patientId)
          .collection('questionnaires')
          .get();
        questionnaires = subSnap.docs
          .map((doc) => serializeQuestionnaire(doc))
          .sort((a, b) => {
            const aTime = a.assignedAt ? new Date(a.assignedAt).getTime() : 0;
            const bTime = b.assignedAt ? new Date(b.assignedAt).getTime() : 0;
            return bTime - aTime;
          });
        console.log(`[API] Fallback returned ${questionnaires.length} items`);
      }

      return res.json({ questionnaires });
    } catch (error) {
      console.error('[API] GET /patients/:patientId/questionnaires error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /patients/:patientId/questionnaires/:questionnaireId
 * Détails d'un questionnaire spécifique (from root collection)
 */
router.get(
  '/patients/:patientId/questionnaires/:questionnaireId',
  authenticateToken,
  requirePatient,
  async (req, res) => {
    try {
      const { patientId, questionnaireId } = req.params;

      console.log(`[API] GET /patients/:patientId/questionnaires/${questionnaireId}`);

      let qDoc = await db.collection('questionnaires').doc(questionnaireId).get();

      if (!qDoc.exists) {
        console.log('[API] Root questionnaire missing, fallback subcollection');
        const subDoc = await db
          .collection('patients')
          .doc(patientId)
          .collection('questionnaires')
          .doc(questionnaireId)
          .get();
        if (!subDoc.exists) {
          return res.status(404).json({ error: 'Questionnaire not found' });
        }
        const data = subDoc.data();
        try {
          await db
            .collection('questionnaires')
            .doc(questionnaireId)
            .set(
              {
                ...data,
                patientUid: patientId,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              },
              { merge: true }
            );
        } catch (e) {
          console.warn('[API] Backfill root failed:', e);
        }
        return res.json({ questionnaire: serializeQuestionnaire({ id: subDoc.id, ...data }) });
      }

      const data = qDoc.data();
      if (data?.patientUid && data.patientUid !== patientId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      return res.json({ questionnaire: serializeQuestionnaire(qDoc) });
    } catch (error) {
      console.error('[API] GET /patients/:patientId/questionnaires/:id error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * PATCH /patients/:patientId/questionnaires/:questionnaireId/responses
 * Auto-save incrémental des réponses (double-write to both collections)
 */
router.patch(
  '/patients/:patientId/questionnaires/:questionnaireId/responses',
  authenticateToken,
  requirePatient,
  async (req, res) => {
    try {
      const { patientId, questionnaireId } = req.params;
      const { responses } = req.body;

      console.log(`[API] PATCH /patients/${patientId}/questionnaires/${questionnaireId}/responses`);

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
      const existing = qDoc.data()?.responses || {};
      const merged = { ...existing, ...(responses || {}) };

      const updateData = {
        responses: merged,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: currentStatus === 'pending' ? 'in_progress' : currentStatus,
      };

      // Double write to both collections (use set with merge to create if missing)
      await Promise.all([
        qRefRoot.set(updateData, { merge: true }),
        qRefSub.set(updateData, { merge: true }),
      ]);

      return res.json({
        ok: true,
        savedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[API] PATCH /responses error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * POST /patients/:patientId/questionnaires/:questionnaireId/submit
 * Submit questionnaire for practitioner review
 */
router.post(
  '/patients/:patientId/questionnaires/:questionnaireId/submit',
  authenticateToken,
  requirePatient,
  async (req, res) => {
    try {
      const { patientId, questionnaireId } = req.params;

      console.log(`[API] POST /patients/${patientId}/questionnaires/${questionnaireId}/submit`);

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

      // Double write to both collections (use set with merge to create if missing)
      await Promise.all([
        qRefRoot.set(updateData, { merge: true }),
        qRefSub.set(updateData, { merge: true }),
      ]);

      return res.json({
        ok: true,
        submittedAt: new Date().toISOString(),
        message: 'Questionnaire submitted successfully',
      });
    } catch (error) {
      console.error('[API] POST /submit error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * POST /patients/:patientId/questionnaires/:questionnaireId/complete
 * Mark questionnaire as completed (practitioner action)
 */
router.post(
  '/patients/:patientId/questionnaires/:questionnaireId/complete',
  authenticateToken,
  requirePractitioner,
  async (req, res) => {
    try {
      const { patientId, questionnaireId } = req.params;

      console.log(`[API] POST /patients/${patientId}/questionnaires/${questionnaireId}/complete`);

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

      // Double write to both collections (use set with merge to create if missing)
      await Promise.all([
        qRefRoot.set(updateData, { merge: true }),
        qRefSub.set(updateData, { merge: true }),
      ]);

      return res.json({
        ok: true,
        completedAt: new Date().toISOString(),
        message: 'Questionnaire marked as completed',
      });
    } catch (error) {
      console.error('[API] POST /complete error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /practitioners/:practitionerId/questionnaires
 * Liste tous les questionnaires de tous les patients d'un praticien (from root collection)
 */
router.get(
  '/practitioners/:practitionerId/questionnaires',
  authenticateToken,
  requirePractitioner,
  async (req, res) => {
    try {
      const { practitionerId } = req.params;
      const { status, limit = '50', offset = '0' } = req.query;

      console.log(`[API] GET /practitioners/${practitionerId}/questionnaires`);

      // Query root collection directly (much more efficient!)
      let query = db.collection('questionnaires').where('practitionerId', '==', practitionerId);

      if (status) {
        query = query.where('status', '==', status);
      }

      query = query.orderBy('assignedAt', 'desc');

      const limitNum = parseInt(limit, 10);
      const offsetNum = parseInt(offset, 10);

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
              if (patientSnap.exists()) {
                const patientData = patientSnap.data();
                patientName = patientData.displayName || patientData.email || patientId;
                patientEmail = patientData.email || '';
              }
            } catch (err) {
              console.warn(`[API] Failed to fetch patient ${patientId}:`, err);
            }
          }

          return {
            ...serializeQuestionnaire(qDoc),
            patientId,
            patientName,
            patientEmail,
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
    } catch (error) {
      console.error('[API] GET /practitioners/:id/questionnaires error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /patients/:patientId/questionnaires/:questionnaireId/scores/dnsm
 * Calculer les scores DNSM pour un questionnaire
 */
router.get(
  '/patients/:patientId/questionnaires/:questionnaireId/scores/dnsm',
  authenticateToken,
  async (req, res) => {
    try {
      const { patientId, questionnaireId } = req.params;

      console.log(`[API] GET DNSM scores for ${questionnaireId}`);

      // Récupérer le questionnaire
      const qDoc = await db.collection('questionnaires').doc(questionnaireId).get();

      if (!qDoc.exists) {
        // Fallback subcollection
        const subDoc = await db
          .collection('patients')
          .doc(patientId)
          .collection('questionnaires')
          .doc(questionnaireId)
          .get();

        if (!subDoc.exists) {
          return res.status(404).json({ error: 'Questionnaire not found' });
        }

        const responses = subDoc.data()?.responses || {};
        const analysis = DNSMScoringService.analyze(responses);

        return res.json({
          ok: true,
          questionnaireId,
          patientId,
          ...analysis,
        });
      }

      const data = qDoc.data();

      // Vérifier que c'est bien un questionnaire DNSM
      if (data.id !== 'dnsm' && data.title !== 'DNSM') {
        return res.status(400).json({ error: 'This endpoint is only for DNSM questionnaires' });
      }

      // Calculer les scores
      const responses = data.responses || {};
      const analysis = DNSMScoringService.analyze(responses);

      return res.json({
        ok: true,
        questionnaireId,
        patientId,
        ...analysis,
      });
    } catch (error) {
      console.error('[API] GET DNSM scores error:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
);

export default router;
