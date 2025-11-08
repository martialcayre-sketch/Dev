/**
 * Consultation Routes - Gestion des fiches patient
 * Identification, Anamnèse, et autres données de consultation
 */

import express from 'express';
import { db } from '../lib/firebase-admin.js';

const router = express.Router();

/**
 * GET /patients/:patientId/consultation
 * Récupère toutes les données de consultation (identification + anamnèse)
 */
router.get('/patients/:patientId/consultation', async (req, res) => {
  try {
    const { patientId } = req.params;

    console.log(`[API] GET /patients/${patientId}/consultation`);

    // Charger identification et anamnèse en parallèle
    const [identificationSnap, anamneseSnap] = await Promise.all([
      db
        .collection('patients')
        .doc(patientId)
        .collection('consultation')
        .doc('identification')
        .get(),
      db.collection('patients').doc(patientId).collection('consultation').doc('anamnese').get(),
    ]);

    return res.json({
      identification: identificationSnap.exists ? identificationSnap.data() : null,
      anamnese: anamneseSnap.exists ? anamneseSnap.data() : null,
    });
  } catch (error) {
    console.error('[API] GET /consultation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /patients/:patientId/consultation/identification
 * Récupère la fiche d'identification
 */
router.get('/patients/:patientId/consultation/identification', async (req, res) => {
  try {
    const { patientId } = req.params;

    console.log(`[API] GET /patients/${patientId}/consultation/identification`);

    const doc = await db
      .collection('patients')
      .doc(patientId)
      .collection('consultation')
      .doc('identification')
      .get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Identification not found' });
    }

    return res.json(doc.data());
  } catch (error) {
    console.error('[API] GET /consultation/identification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /patients/:patientId/consultation/identification
 * Crée ou met à jour la fiche d'identification
 */
router.put('/patients/:patientId/consultation/identification', async (req, res) => {
  try {
    const { patientId } = req.params;
    const data = req.body;

    console.log(`[API] PUT /patients/${patientId}/consultation/identification`);

    // Validation basique
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid data' });
    }

    // Ajouter updatedAt
    const payload = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await db
      .collection('patients')
      .doc(patientId)
      .collection('consultation')
      .doc('identification')
      .set(payload, { merge: true });

    return res.json({
      ok: true,
      message: 'Identification saved successfully',
      updatedAt: payload.updatedAt,
    });
  } catch (error) {
    console.error('[API] PUT /consultation/identification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /patients/:patientId/consultation/anamnese
 * Récupère la fiche d'anamnèse
 */
router.get('/patients/:patientId/consultation/anamnese', async (req, res) => {
  try {
    const { patientId } = req.params;

    console.log(`[API] GET /patients/${patientId}/consultation/anamnese`);

    const doc = await db
      .collection('patients')
      .doc(patientId)
      .collection('consultation')
      .doc('anamnese')
      .get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Anamnese not found' });
    }

    return res.json(doc.data());
  } catch (error) {
    console.error('[API] GET /consultation/anamnese error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /patients/:patientId/consultation/anamnese
 * Crée ou met à jour la fiche d'anamnèse
 */
router.put('/patients/:patientId/consultation/anamnese', async (req, res) => {
  try {
    const { patientId } = req.params;
    const data = req.body;

    console.log(`[API] PUT /patients/${patientId}/consultation/anamnese`);

    // Validation basique
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid data' });
    }

    // Ajouter updatedAt
    const payload = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await db
      .collection('patients')
      .doc(patientId)
      .collection('consultation')
      .doc('anamnese')
      .set(payload, { merge: true });

    return res.json({
      ok: true,
      message: 'Anamnese saved successfully',
      updatedAt: payload.updatedAt,
    });
  } catch (error) {
    console.error('[API] PUT /consultation/anamnese error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /patients/:patientId/profile
 * Récupère le profil patient complet
 */
router.get('/patients/:patientId/profile', async (req, res) => {
  try {
    const { patientId } = req.params;

    console.log(`[API] GET /patients/${patientId}/profile`);

    const patientDoc = await db.collection('patients').doc(patientId).get();

    if (!patientDoc.exists) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    return res.json({
      uid: patientId,
      ...patientDoc.data(),
    });
  } catch (error) {
    console.error('[API] GET /patient/profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
