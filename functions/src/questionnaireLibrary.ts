/**
 * 🧠 NeuroNutrition - API Bibliothèque Questionnaires pour Praticiens
 *
 * Cloud Function pour accès sécurisé à la bibliothèque complète des questionnaires
 */

import { getAllQuestionnaires } from '@neuronutrition/shared-questionnaires';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

// Ensure Admin SDK is initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Local implementation of library functions
function getAvailableTemplates() {
  const questionnaires = getAllQuestionnaires();
  return questionnaires.map((q) => ({
    id: q.metadata.id,
    title: q.metadata.title,
    category: q.metadata.category,
    hasVariants: true,
  }));
}

function getLibraryStats() {
  const questionnaires = getAllQuestionnaires();
  const categories = [...new Set(questionnaires.map((q) => q.metadata.category))];
  return {
    totalTemplates: questionnaires.length,
    totalVariants: questionnaires.length,
    categoriesCount: categories.length,
    categories,
  };
}

/**
 * 🔐 Validation: Vérifier que l'utilisateur est un praticien autorisé
 */
async function validatePractitioner(uid: string): Promise<boolean> {
  try {
    const userRecord = await admin.auth().getUser(uid);
    const claims = userRecord.customClaims;

    return !!(claims && claims.practitioner);
  } catch (error) {
    logger.error('Error validating practitioner:', error);
    return false;
  }
}

/**
 * 📚 Cloud Function: Obtenir la liste de tous les templates disponibles
 *
 * ACCÈS: Praticiens uniquement
 */
export const getQuestionnaireLibrary = onCall(async (request) => {
  const ctx = request.auth;
  if (!ctx) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }

  // 🔐 VALIDATION PRATICIEN OBLIGATOIRE
  const isPractitioner = await validatePractitioner(ctx.uid);
  if (!isPractitioner) {
    logger.warn(`Unauthorized access attempt to questionnaire library by user ${ctx.uid}`);
    throw new HttpsError('permission-denied', 'Accès réservé aux praticiens autorisés');
  }

  try {
    logger.info(`Practitioner ${ctx.uid} accessing questionnaire library`);

    // 📊 Récupération des templates et statistiques
    const templates = getAvailableTemplates();
    const stats = getLibraryStats();

    // 📋 Groupement par catégorie pour l'interface
    const categories: Record<string, any[]> = {};
    templates.forEach((template: any) => {
      if (!categories[template.category]) {
        categories[template.category] = [];
      }
      categories[template.category].push(template);
    });

    return {
      success: true,
      data: {
        templates,
        categories,
        stats,
        practitionerId: ctx.uid,
        accessTime: admin.firestore.FieldValue.serverTimestamp(),
      },
    };
  } catch (error: any) {
    logger.error('Error retrieving questionnaire library:', error);
    throw new HttpsError('internal', `Failed to retrieve library: ${error.message}`);
  }
});

/**
 * 🎯 Cloud Function: Assigner des questionnaires spécifiques à un patient
 *
 * NOUVEAU: Avec sélection manuelle + détection d'âge automatique
 */
export const assignSelectedQuestionnaires = onCall(async (request) => {
  const ctx = request.auth;
  if (!ctx) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }

  // 🔐 VALIDATION PRATICIEN
  const isPractitioner = await validatePractitioner(ctx.uid);
  if (!isPractitioner) {
    throw new HttpsError('permission-denied', 'Accès réservé aux praticiens');
  }

  const { patientUid, questionnaireIds } = request.data as {
    patientUid?: string;
    questionnaireIds?: string[];
  };

  if (!patientUid || !questionnaireIds || !Array.isArray(questionnaireIds)) {
    throw new HttpsError('invalid-argument', 'patientUid et questionnaireIds requis');
  }

  try {
    logger.info(
      `Practitioner ${ctx.uid} assigning ${questionnaireIds.length} questionnaires to patient ${patientUid}`
    );

    // 🧠 VALIDATION ÂGE ET IDENTIFICATION (comme dans assignQuestionnaires)
    const patientDoc = await db.collection('patients').doc(patientUid).get();
    const patientData = patientDoc.data();

    // Import dynamique pour éviter les dépendances circulaires
    const { canAssignQuestionnaires, detectPatientAge } = require('@neuronutrition/shared-core');

    const ageValidation = canAssignQuestionnaires({
      uid: patientUid,
      birthDate: patientData?.identification?.birthDate,
    });

    if (!ageValidation.canAssign) {
      throw new HttpsError(
        'failed-precondition',
        ageValidation.reason || 'Identification patient requise'
      );
    }

    const ageResult = detectPatientAge({
      uid: patientUid,
      birthDate: patientData?.identification?.birthDate,
    });

    // 📝 CRÉATION DES QUESTIONNAIRES SÉLECTIONNÉS
    const batch = db.batch();
    const now = admin.firestore.FieldValue.serverTimestamp();
    const assignedQuestionnaires = [];

    for (const templateId of questionnaireIds) {
      // Import dynamique des questionnaires
      const { getQuestionnaireById } = await import('@neuronutrition/shared-questionnaires');
      const questionnaireVariant = getQuestionnaireById(templateId);

      if (!questionnaireVariant) {
        logger.warn(
          `Questionnaire template ${templateId} not found for variant ${ageResult.variant}`
        );
        continue;
      }

      const questionnaireData = {
        ...questionnaireVariant.metadata,
        patientUid,
        practitionerId: ctx.uid,
        status: 'pending',
        assignedAt: now,
        completedAt: null,
        responses: {},
        // Informations d'âge
        patientAge: ageResult.ageInYears,
        ageVariant: ageResult.variant,
        requiresParentAssistance: ageResult.variant === 'kid',
      };

      // Écriture root collection
      const rootRef = db.collection('questionnaires').doc(`${templateId}_${patientUid}`);
      batch.set(rootRef, questionnaireData);

      assignedQuestionnaires.push({
        id: templateId,
        title: questionnaireVariant.metadata.title,
        variant: ageResult.variant,
      });
    }

    await batch.commit();

    // 📊 MISE À JOUR PATIENT
    await db
      .collection('patients')
      .doc(patientUid)
      .set(
        {
          hasQuestionnairesAssigned: true,
          lastAssignmentBy: ctx.uid,
          lastAssignmentAt: now,
          pendingQuestionnairesCount: admin.firestore.FieldValue.increment(
            assignedQuestionnaires.length
          ),
        },
        { merge: true }
      );

    // 🔔 NOTIFICATION PATIENT
    await db
      .collection('patients')
      .doc(patientUid)
      .collection('notifications')
      .add({
        type: 'questionnaires_assigned',
        title: 'Nouveaux questionnaires assignés',
        message: `${assignedQuestionnaires.length} questionnaires vous ont été assignés par votre praticien.`,
        read: false,
        createdAt: now,
        link: '/dashboard/questionnaires',
        assignedBy: ctx.uid,
      });

    logger.info(
      `Successfully assigned ${assignedQuestionnaires.length} questionnaires to patient ${patientUid}`
    );

    return {
      success: true,
      assigned: assignedQuestionnaires,
      patientAge: ageResult.ageInYears,
      ageVariant: ageResult.variant,
      message: `${assignedQuestionnaires.length} questionnaires assignés avec succès`,
    };
  } catch (error: any) {
    logger.error('Error assigning selected questionnaires:', error);
    throw new HttpsError('internal', `Failed to assign questionnaires: ${error.message}`);
  }
});
