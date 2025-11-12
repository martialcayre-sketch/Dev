/**
 * Practitioners API Routes
 * Actions on patients performed by practitioners
 */

import express from 'express';
import { admin, db } from '../lib/firebase-admin.js';
import { authenticateToken, requirePractitioner } from '../middleware/auth.js';

const router = express.Router();

/**
 * Helper: serialize timestamp to ISO
 */
function toISO(ts) {
  if (!ts) return null;
  if (ts.toDate) return ts.toDate().toISOString();
  if (ts._seconds !== undefined) return new Date(ts._seconds * 1000).toISOString();
  return ts;
}

/**
 * Ensure the patient belongs to the practitioner
 */
async function assertPatientOwnedByPractitioner(practitionerId, patientId) {
  const pRef = db.collection('patients').doc(patientId);
  const pSnap = await pRef.get();
  if (!pSnap.exists) {
    const err = new Error('Patient not found');
    err.code = 404;
    throw err;
  }
  const ownerId = pSnap.get('practitionerId');
  if (ownerId && ownerId !== practitionerId) {
    const err = new Error('Patient not owned by practitioner');
    err.code = 403;
    throw err;
  }
  return pRef;
}

/**
 * POST /practitioners/:practitionerId/patients/:patientId/archive
 * Archive a patient (soft archive flag)
 */
router.post(
  '/practitioners/:practitionerId/patients/:patientId/archive',
  authenticateToken,
  requirePractitioner,
  async (req, res) => {
    try {
      const { practitionerId, patientId } = req.params;

      const pRef = await assertPatientOwnedByPractitioner(practitionerId, patientId);

      await pRef.set(
        {
          archived: true,
          archivedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      const snap = await pRef.get();
      return res.json({
        ok: true,
        message: 'Patient archived',
        archivedAt: toISO(snap.get('archivedAt')),
      });
    } catch (error) {
      const code = error.code || 500;
      if (code !== 500) {
        return res.status(code).json({ error: error.message });
      }
      console.error('[API] Archive patient error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * DELETE /practitioners/:practitionerId/patients/:patientId
 * Delete a patient if no pending consultations or unpaid payments
 */
router.delete(
  '/practitioners/:practitionerId/patients/:patientId',
  authenticateToken,
  requirePractitioner,
  async (req, res) => {
    try {
      const { practitionerId, patientId } = req.params;

      const pRef = await assertPatientOwnedByPractitioner(practitionerId, patientId);

      // Check constraints in subcollections
      const [consultationsSnap, paymentsSnap] = await Promise.all([
        db.collection(`patients/${patientId}/consultations`).where('status', '==', 'pending').get(),
        db.collection(`patients/${patientId}/payments`).where('status', '==', 'unpaid').get(),
      ]);

      if (!consultationsSnap.empty) {
        return res.status(400).json({
          error: `Cannot delete: ${consultationsSnap.size} pending consultation(s)`,
        });
      }
      if (!paymentsSnap.empty) {
        return res
          .status(400)
          .json({ error: `Cannot delete: ${paymentsSnap.size} unpaid payment(s)` });
      }

      // Delete only the patient document (no deep delete)
      await pRef.delete();

      return res.json({ ok: true, message: 'Patient deleted' });
    } catch (error) {
      const code = error.code || 500;
      if (code !== 500) {
        return res.status(code).json({ error: error.message });
      }
      console.error('[API] Delete patient error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
