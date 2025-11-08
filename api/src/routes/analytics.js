/**
 * Analytics Routes - Scores, interprétations et visualisations
 * Utilise le ScoringService pour calculer les scores et générer les insights
 */

import express from 'express';
import { db } from '../lib/firebase-admin.js';
import ScoringService from '../services/scoring.js';

const router = express.Router();
const scoringService = new ScoringService();

/**
 * GET /patients/:patientId/scores
 * Calcule et retourne tous les scores du patient (DayFlow, Life Journey, etc.)
 */
router.get('/patients/:patientId/scores', async (req, res) => {
  try {
    const { patientId } = req.params;

    console.log(`[API] GET /patients/${patientId}/scores`);

    // Charger tous les questionnaires du patient
    const questionnairesSnap = await db
      .collection('questionnaires')
      .where('patientUid', '==', patientId)
      .get();

    const questionnaires = questionnairesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Calculer les scores via le service
    const scores = await scoringService.calculatePatientScores(questionnaires);

    return res.json(scores);
  } catch (error) {
    console.error('[API] GET /scores error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /patients/:patientId/dashboard
 * Retourne toutes les données nécessaires pour le dashboard patient
 * (profil + questionnaires + scores + prochaine consultation)
 */
router.get('/patients/:patientId/dashboard', async (req, res) => {
  try {
    const { patientId } = req.params;

    console.log(`[API] GET /patients/${patientId}/dashboard`);

    // Charger en parallèle : profil, questionnaires, consultation
    const [patientDoc, questionnairesSnap, consultationSnap, identificationDoc, anamneseDoc] =
      await Promise.all([
        db.collection('patients').doc(patientId).get(),
        db.collection('questionnaires').where('patientUid', '==', patientId).get(),
        db
          .collection('patients')
          .doc(patientId)
          .collection('consultations')
          .where('scheduledAt', '>=', new Date())
          .orderBy('scheduledAt', 'asc')
          .limit(1)
          .get(),
        db
          .collection('patients')
          .doc(patientId)
          .collection('consultation')
          .doc('identification')
          .get(),
        db.collection('patients').doc(patientId).collection('consultation').doc('anamnese').get(),
      ]);

    // Profil
    const profile = patientDoc.exists ? { uid: patientId, ...patientDoc.data() } : null;

    // Questionnaires
    const questionnaires = questionnairesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Scores
    const scores = await scoringService.calculatePatientScores(questionnaires);

    // Filtrer questionnaires non complétés pour le dashboard
    const pendingQuestionnaires = questionnaires
      .filter((q) => q.status !== 'completed')
      .sort((a, b) => {
        const aTime = a.assignedAt?.toMillis?.() || 0;
        const bTime = b.assignedAt?.toMillis?.() || 0;
        return bTime - aTime;
      });

    // Prochaine consultation
    const nextConsultation = consultationSnap.empty
      ? null
      : {
          id: consultationSnap.docs[0].id,
          ...consultationSnap.docs[0].data(),
        };

    // Statut consultation
    const hasIdentification = identificationDoc.exists;
    const hasAnamnese = anamneseDoc.exists;

    return res.json({
      profile,
      pendingQuestionnaires,
      scores,
      nextConsultation,
      consultationStatus: {
        hasIdentification,
        hasAnamnese,
      },
    });
  } catch (error) {
    console.error('[API] GET /dashboard error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /practitioners/:practitionerId/dashboard
 * Dashboard praticien : patients, consultations, questionnaires en attente
 */
router.get('/practitioners/:practitionerId/dashboard', async (req, res) => {
  try {
    const { practitionerId } = req.params;
    const { limit = '50' } = req.query;

    console.log(`[API] GET /practitioners/${practitionerId}/dashboard`);

    const limitNum = parseInt(limit, 10);

    // Charger en parallèle : patients, consultations, questionnaires soumis
    const [patientsSnap, consultationsSnap, questionnairesSnap] = await Promise.all([
      db
        .collection('patients')
        .where('practitionerId', '==', practitionerId)
        .orderBy('createdAt', 'desc')
        .limit(limitNum)
        .get(),
      db
        .collection('consultations')
        .where('practitionerId', '==', practitionerId)
        .where('scheduledAt', '>=', new Date())
        .orderBy('scheduledAt', 'asc')
        .limit(10)
        .get(),
      db
        .collection('questionnaires')
        .where('practitionerId', '==', practitionerId)
        .where('status', '==', 'submitted')
        .orderBy('submittedAt', 'desc')
        .limit(20)
        .get(),
    ]);

    const patients = patientsSnap.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }));

    const upcomingConsultations = consultationsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const submittedQuestionnaires = questionnairesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Stats
    const totalPatients = patients.length;
    const activePatients = patients.filter((p) => p.status === 'approved').length;
    const pendingApprovals = patients.filter((p) => p.approvalStatus === 'pending').length;

    return res.json({
      stats: {
        totalPatients,
        activePatients,
        pendingApprovals,
        upcomingConsultations: upcomingConsultations.length,
        submittedQuestionnaires: submittedQuestionnaires.length,
      },
      patients: patients.slice(0, 10), // Top 10 patients récents
      upcomingConsultations,
      submittedQuestionnaires,
    });
  } catch (error) {
    console.error('[API] GET /practitioners/dashboard error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /patients/:patientId/analytics/lifejourney
 * Analyse détaillée du Life Journey avec radar data
 */
router.get('/patients/:patientId/analytics/lifejourney', async (req, res) => {
  try {
    const { patientId } = req.params;

    console.log(`[API] GET /patients/${patientId}/analytics/lifejourney`);

    // Charger le questionnaire life-journey
    const qSnap = await db.collection('questionnaires').doc('life-journey').get();

    if (!qSnap.exists) {
      return res.status(404).json({ error: 'Life Journey questionnaire not found' });
    }

    const questionnaire = qSnap.data();

    if (!questionnaire.responses) {
      return res.status(404).json({ error: 'No responses found' });
    }

    // Calculer les scores
    const scores = scoringService.lifeJourneyService.calculateScores(questionnaire.responses);
    const globalScore = scoringService.lifeJourneyService.calculateGlobalScore(scores);
    const radarData = scoringService.lifeJourneyService.getRadarData(scores);
    const interpretation = scoringService.lifeJourneyService.interpretResults(scores, globalScore);

    return res.json({
      scores,
      globalScore,
      radarData,
      interpretation,
      completedAt: questionnaire.completedAt || questionnaire.submittedAt,
    });
  } catch (error) {
    console.error('[API] GET /analytics/lifejourney error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /patients/:patientId/analytics/dayflow
 * Analyse détaillée du DayFlow avec axes et conseils
 */
router.get('/patients/:patientId/analytics/dayflow', async (req, res) => {
  try {
    const { patientId } = req.params;

    console.log(`[API] GET /patients/${patientId}/analytics/dayflow`);

    // Charger le questionnaire dayflow-alim
    const qSnap = await db.collection('questionnaires').doc('dayflow-alim').get();

    if (!qSnap.exists) {
      return res.status(404).json({ error: 'DayFlow questionnaire not found' });
    }

    const questionnaire = qSnap.data();

    if (!questionnaire.responses?.scores?.axes) {
      return res.status(404).json({ error: 'No scores found' });
    }

    // Générer l'interprétation
    const interpretation = scoringService.dayFlowService.interpretDayFlow(
      questionnaire.responses.scores.axes
    );

    return res.json({
      scores: questionnaire.responses.scores.axes,
      interpretation,
      completedAt: questionnaire.completedAt || questionnaire.submittedAt,
    });
  } catch (error) {
    console.error('[API] GET /analytics/dayflow error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
