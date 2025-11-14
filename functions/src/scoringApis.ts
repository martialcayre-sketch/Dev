/**
 * 🧠 NeuroNutrition - Cloud Functions pour Scoring et Graphiques
 *
 * APIs centralisées pour calcul de scores et génération de graphiques
 */

import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { ChartGenerationService } from './services/charts/ChartGenerationService';
import {
  UnifiedScoringService,
  type QuestionnaireType,
} from './services/scoring/UnifiedScoringService';

// Ensure Admin SDK is initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * 📊 Cloud Function: Calculer les scores d'un questionnaire
 *
 * ACCÈS: Patient (ses questionnaires) + Praticien (tous questionnaires)
 */
export const calculateQuestionnaireScores = onCall(async (request) => {
  const ctx = request.auth;
  if (!ctx) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }

  const { questionnaireId, questionnaireType } = request.data as {
    questionnaireId?: string;
    questionnaireType?: QuestionnaireType;
  };

  if (!questionnaireId || !questionnaireType) {
    throw new HttpsError('invalid-argument', 'questionnaireId and questionnaireType required');
  }

  try {
    logger.info(`Calculating scores for questionnaire ${questionnaireId} (${questionnaireType})`);

    // 📋 Récupérer le questionnaire
    const questionnaireDoc = await db.collection('questionnaires').doc(questionnaireId).get();

    if (!questionnaireDoc.exists) {
      throw new HttpsError('not-found', 'Questionnaire not found');
    }

    const questionnaireData = questionnaireDoc.data()!;

    // 🔐 Vérification des permissions
    const isPatient = ctx.uid === questionnaireData.patientUid;
    const isPractitioner = await isPractitionerUser(ctx.uid);

    if (!isPatient && !isPractitioner) {
      throw new HttpsError('permission-denied', 'Access denied to this questionnaire');
    }

    // ✅ Calcul des scores
    const scoringResult = UnifiedScoringService.calculateScores(
      questionnaireType,
      questionnaireData.responses || {}
    );

    // 💾 Sauvegarde des résultats dans Firestore
    await db.collection('questionnaires').doc(questionnaireId).update({
      scores: scoringResult.scores,
      interpretations: scoringResult.interpretations,
      lastScoredAt: admin.firestore.FieldValue.serverTimestamp(),
      scoringVersion: scoringResult.version,
    });

    logger.info(`Scores calculated and saved for questionnaire ${questionnaireId}`);

    return {
      success: true,
      data: scoringResult,
    };
  } catch (error: any) {
    logger.error('Error calculating questionnaire scores:', error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError('internal', `Failed to calculate scores: ${error.message}`);
  }
});

/**
 * 📈 Cloud Function: Générer un graphique pour un questionnaire
 *
 * ACCÈS: Patient (ses questionnaires) + Praticien (tous questionnaires)
 */
export const generateQuestionnaireChart = onCall(async (request) => {
  const ctx = request.auth;
  if (!ctx) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }

  const {
    questionnaireId,
    questionnaireType,
    chartType = 'radar',
    format = 'json', // 'json' | 'svg'
  } = request.data as {
    questionnaireId?: string;
    questionnaireType?: QuestionnaireType;
    chartType?: 'radar' | 'bar' | 'line' | 'pie';
    format?: 'json' | 'svg';
  };

  if (!questionnaireId || !questionnaireType) {
    throw new HttpsError('invalid-argument', 'questionnaireId and questionnaireType required');
  }

  try {
    logger.info(`Generating ${chartType} chart for questionnaire ${questionnaireId}`);

    // 📋 Récupérer le questionnaire
    const questionnaireDoc = await db.collection('questionnaires').doc(questionnaireId).get();

    if (!questionnaireDoc.exists) {
      throw new HttpsError('not-found', 'Questionnaire not found');
    }

    const questionnaireData = questionnaireDoc.data()!;

    // 🔐 Vérification des permissions
    const isPatient = ctx.uid === questionnaireData.patientUid;
    const isPractitioner = await isPractitionerUser(ctx.uid);

    if (!isPatient && !isPractitioner) {
      throw new HttpsError('permission-denied', 'Access denied to this questionnaire');
    }

    // 📊 Calcul des scores si pas déjà fait
    let scoringResult;
    if (questionnaireData.scores && questionnaireData.interpretations) {
      scoringResult = {
        questionnaireType,
        scores: questionnaireData.scores,
        interpretations: questionnaireData.interpretations,
        isComplete: true, // Si scores existent, considéré complet
        calculatedAt:
          questionnaireData.lastScoredAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        version: questionnaireData.scoringVersion || '1.0.0',
      };
    } else {
      scoringResult = UnifiedScoringService.calculateScores(
        questionnaireType,
        questionnaireData.responses || {}
      );
    }

    // 🎨 Génération du graphique
    const ageVariant = questionnaireData.ageVariant || 'adult';
    const chart = await ChartGenerationService.generateChart(
      questionnaireType,
      scoringResult,
      questionnaireData.patientUid,
      chartType,
      ageVariant
    );

    // 🎯 Retour selon format demandé
    if (format === 'svg' && chart.svg) {
      return {
        success: true,
        format: 'svg',
        data: chart.svg,
        metadata: chart.metadata,
      };
    } else {
      return {
        success: true,
        format: 'json',
        data: {
          config: chart.config,
          chartData: chart.data,
          metadata: chart.metadata,
        },
      };
    }
  } catch (error: any) {
    logger.error('Error generating chart:', error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError('internal', `Failed to generate chart: ${error.message}`);
  }
});

/**
 * 📊 Cloud Function: Dashboard patient - tous ses scores
 *
 * ACCÈS: Patient uniquement (ses données)
 */
export const getPatientScoresDashboard = onCall(async (request) => {
  const ctx = request.auth;
  if (!ctx) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }

  const patientUid = ctx.uid;

  try {
    logger.info(`Loading scores dashboard for patient ${patientUid}`);

    // 📋 Récupérer tous les questionnaires du patient
    const questionnairesSnap = await db
      .collection('questionnaires')
      .where('patientUid', '==', patientUid)
      .where('status', 'in', ['submitted', 'completed'])
      .get();

    const dashboardData: Array<{
      questionnaireId: string;
      type: string;
      title: string;
      status: string;
      scores?: any;
      interpretations?: any;
      lastScoredAt?: string;
      ageVariant?: string;
    }> = [];

    // 🔄 Traiter chaque questionnaire
    for (const doc of questionnairesSnap.docs) {
      const data = doc.data();

      dashboardData.push({
        questionnaireId: doc.id,
        type: data.templateId || 'unknown',
        title: data.title || 'Questionnaire',
        status: data.status,
        scores: data.scores || null,
        interpretations: data.interpretations || null,
        lastScoredAt: data.lastScoredAt?.toDate?.()?.toISOString(),
        ageVariant: data.ageVariant || 'adult',
      });
    }

    // 📈 Statistiques globales
    const completedQuestionnaires = dashboardData.filter((q) => q.scores);
    const globalStats = {
      totalQuestionnaires: dashboardData.length,
      scoredQuestionnaires: completedQuestionnaires.length,
      pendingScoring: dashboardData.length - completedQuestionnaires.length,
      lastUpdate:
        completedQuestionnaires.length > 0
          ? Math.max(...completedQuestionnaires.map((q) => new Date(q.lastScoredAt || 0).getTime()))
          : null,
    };

    return {
      success: true,
      data: {
        questionnaires: dashboardData,
        stats: globalStats,
      },
    };
  } catch (error: any) {
    logger.error('Error loading patient dashboard:', error);
    throw new HttpsError('internal', `Failed to load dashboard: ${error.message}`);
  }
});

/**
 * 📊 Cloud Function: Dashboard praticien - scores de tous ses patients
 *
 * ACCÈS: Praticien uniquement
 */
export const getPractitionerScoresDashboard = onCall(async (request) => {
  const ctx = request.auth;
  if (!ctx) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }

  // 🔐 Validation praticien
  const isPractitioner = await isPractitionerUser(ctx.uid);
  if (!isPractitioner) {
    throw new HttpsError('permission-denied', 'Access restricted to practitioners');
  }

  const { patientUid } = request.data as { patientUid?: string };

  try {
    logger.info(`Loading practitioner dashboard for ${ctx.uid}`);

    let query: any = db.collection('questionnaires');

    // Filtrer par patient spécifique si demandé
    if (patientUid) {
      query = db.collection('questionnaires').where('patientUid', '==', patientUid);
    } else {
      query = db.collection('questionnaires');
    }

    // Ajouter filtre praticien (si champ disponible)
    // query = query.where('practitionerId', '==', ctx.uid);

    const questionnairesSnap = await query
      .where('status', 'in', ['submitted', 'completed'])
      .limit(100) // Limiter pour performance
      .get();

    const dashboardData = questionnairesSnap.docs.map((doc: any) => {
      const data = doc.data();
      return {
        questionnaireId: doc.id,
        patientUid: data.patientUid,
        type: data.templateId,
        title: data.title,
        status: data.status,
        scores: data.scores || null,
        interpretations: data.interpretations || null,
        submittedAt: data.submittedAt?.toDate?.()?.toISOString(),
        lastScoredAt: data.lastScoredAt?.toDate?.()?.toISOString(),
        ageVariant: data.ageVariant || 'adult',
      };
    });

    return {
      success: true,
      data: dashboardData,
    };
  } catch (error: any) {
    logger.error('Error loading practitioner dashboard:', error);
    throw new HttpsError('internal', `Failed to load practitioner dashboard: ${error.message}`);
  }
});

/**
 * 🔐 Utilitaire: Vérifier si l'utilisateur est un praticien
 */
async function isPractitionerUser(uid: string): Promise<boolean> {
  try {
    const userRecord = await admin.auth().getUser(uid);
    const claims = userRecord.customClaims;
    return !!(claims && claims.practitioner);
  } catch (error) {
    logger.error('Error validating practitioner:', error);
    return false;
  }
}
