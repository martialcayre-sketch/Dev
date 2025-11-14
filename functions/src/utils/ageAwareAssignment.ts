/**
 * Utilitaires d'assignation de questionnaires adaptés à l'âge
 * Conforme au Master Document V3 - Architecture root-only
 */

import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { HttpsError } from 'firebase-functions/v2/https';
import { getQuestionnaireTemplatesForAge } from '../constants/questionnairesByAge';

// Local age detection types and functions
type AgeVariant = 'adult' | 'teen' | 'kid';

function calculateAge(birthDate: string | Date): number {
  const birth = new Date(birthDate);
  const now = new Date();

  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

function getAgeGroup(age: number): AgeVariant {
  if (age <= 12) return 'kid';
  if (age <= 18) return 'teen';
  return 'adult';
}

function detectPatientAge(patient: { uid: string; birthDate?: string | Date }): {
  ageInYears: number;
  variant: AgeVariant;
  isValid: boolean;
  error?: string;
} {
  try {
    if (!patient.birthDate) {
      return {
        ageInYears: 0,
        variant: 'adult',
        isValid: false,
        error: 'Date de naissance manquante - identification patient requise',
      };
    }

    const ageInYears = calculateAge(patient.birthDate);

    if (ageInYears < 0 || ageInYears > 120) {
      return {
        ageInYears,
        variant: 'adult',
        isValid: false,
        error: `Âge invalide: ${ageInYears} ans`,
      };
    }

    const variant = getAgeGroup(ageInYears);

    return {
      ageInYears,
      variant,
      isValid: true,
    };
  } catch (error) {
    return {
      ageInYears: 0,
      variant: 'adult',
      isValid: false,
      error: error instanceof Error ? error.message : 'Erreur détection âge',
    };
  }
}

// Ensure Admin SDK is initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export interface AssignmentResult {
  success: boolean;
  questionnairesAssigned: number;
  ageGroup: AgeVariant;
  templates: Array<{ id: string; title: string }>;
  error?: string;
}

/**
 * Assigne les questionnaires appropriés selon l'âge du patient
 */
export async function assignAgeAppropriateQuestionnaires(
  patientUid: string,
  ageGroup?: AgeVariant
): Promise<AssignmentResult> {
  try {
    logger.info(`🎯 Starting age-aware questionnaire assignment for patient ${patientUid}`);

    // 1. Récupérer les données patient si ageGroup n'est pas fourni
    let finalAgeGroup = ageGroup;

    if (!finalAgeGroup) {
      const patientDoc = await db.collection('patients').doc(patientUid).get();
      if (!patientDoc.exists) {
        throw new HttpsError('not-found', 'Patient document not found');
      }

      const patientData = patientDoc.data() as any;
      const ageDetection = detectPatientAge({
        uid: patientUid,
        birthDate: patientData.dateNaissance || patientData.birthDate,
      });

      if (!ageDetection.isValid) {
        throw new HttpsError(
          'failed-precondition',
          "Impossible de déterminer l'âge du patient. Identification requise."
        );
      }

      finalAgeGroup = ageDetection.variant;
      logger.info(`🎂 Age detected: ${ageDetection.ageInYears} years -> ${finalAgeGroup}`);
    }

    // 2. Obtenir les templates appropriés pour cette tranche d'âge
    const templates = getQuestionnaireTemplatesForAge(finalAgeGroup);

    if (!templates || templates.length === 0) {
      throw new HttpsError(
        'internal',
        `No questionnaire templates found for age group: ${finalAgeGroup}`
      );
    }

    logger.info(
      `📋 Found ${templates.length} questionnaire templates for age group: ${finalAgeGroup}`
    );

    // 3. Vérifier que le patient n'a pas déjà des questionnaires assignés
    const existingQuestionnaires = await db
      .collection('questionnaires')
      .where('patientUid', '==', patientUid)
      .get();

    if (!existingQuestionnaires.empty) {
      logger.warn(
        `⚠️ Patient ${patientUid} already has ${existingQuestionnaires.size} questionnaires assigned`
      );

      return {
        success: true,
        questionnairesAssigned: 0,
        ageGroup: finalAgeGroup,
        templates: templates.map((t) => ({ id: t.id, title: t.title })),
        error: 'Questionnaires already assigned',
      };
    }

    // 4. Créer les questionnaires en batch (architecture root-only)
    const batch = db.batch();
    const timestamp = FieldValue.serverTimestamp();
    let assignedCount = 0;

    for (const template of templates) {
      const questionnaireId = `${template.id}_${patientUid}`;
      const questionnaireRef = db.collection('questionnaires').doc(questionnaireId);

      const questionnaireData = {
        id: questionnaireId,
        templateId: template.id,
        patientUid,
        title: template.title,
        description: template.description,
        category: template.category,
        estimatedMinutes: template.estimatedMinutes,
        ageVariant: template.ageVariant,
        status: 'pending',
        assignedAt: timestamp,
        completedAt: null,
        submittedAt: null,
        responses: {},

        // Métadonnées pour le suivi
        assignmentContext: {
          assignedVia: 'auto-age-detection',
          ageGroup: finalAgeGroup,
          timestamp: Date.now(),
        },
      };

      batch.set(questionnaireRef, questionnaireData);
      assignedCount++;

      logger.info(`✅ [Assign] ${template.id} -> ${questionnaireId}`);
    }

    // 5. Mettre à jour le document patient
    const patientRef = db.collection('patients').doc(patientUid);
    batch.update(patientRef, {
      hasQuestionnairesAssigned: true,
      pendingQuestionnairesCount: assignedCount,
      questionnairesAssignedAt: timestamp,
      lastAssignmentAgeGroup: finalAgeGroup,

      // Mise à jour du statut si pas encore fait
      ...(finalAgeGroup && {
        ageGroup: finalAgeGroup,
        identificationCompleted: true,
      }),
    });

    // 6. Committer toutes les opérations
    await batch.commit();

    logger.info(
      `🎉 Successfully assigned ${assignedCount} questionnaires for age group: ${finalAgeGroup}`
    );

    // 7. Créer notification pour le patient
    try {
      await db
        .collection('patients')
        .doc(patientUid)
        .collection('notifications')
        .add({
          type: 'questionnaires_assigned',
          title: 'Questionnaires disponibles',
          message: `${assignedCount} questionnaires adaptés à votre âge ont été assignés`,
          ageGroup: finalAgeGroup,
          questionnairesCount: assignedCount,
          read: false,
          createdAt: FieldValue.serverTimestamp(),
          link: '/dashboard/questionnaires',
        });
    } catch (notificationError) {
      logger.warn('Failed to create patient notification:', notificationError);
      // Non-blocking error
    }

    return {
      success: true,
      questionnairesAssigned: assignedCount,
      ageGroup: finalAgeGroup,
      templates: templates.map((t) => ({ id: t.id, title: t.title })),
    };
  } catch (error: any) {
    logger.error('❌ Error in assignAgeAppropriateQuestionnaires:', error);

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError('internal', `Failed to assign questionnaires: ${error.message}`);
  }
}

/**
 * Vérifie si un patient peut recevoir des questionnaires
 */
export async function canPatientReceiveQuestionnaires(patientUid: string): Promise<{
  canAssign: boolean;
  reason?: string;
  requiresIdentification: boolean;
  ageGroup?: AgeVariant;
}> {
  try {
    const patientDoc = await db.collection('patients').doc(patientUid).get();

    if (!patientDoc.exists) {
      return {
        canAssign: false,
        reason: 'Patient document not found',
        requiresIdentification: false,
      };
    }

    const patientData = patientDoc.data() as any;

    // Vérifier si déjà assigné
    if (patientData.hasQuestionnairesAssigned) {
      return {
        canAssign: false,
        reason: 'Questionnaires already assigned',
        requiresIdentification: false,
        ageGroup: patientData.ageGroup,
      };
    }

    // Vérifier les données d'âge
    const ageDetection = detectPatientAge({
      uid: patientUid,
      birthDate: patientData.dateNaissance || patientData.birthDate,
    });

    if (!ageDetection.isValid) {
      return {
        canAssign: false,
        reason: ageDetection.error || 'Age detection failed',
        requiresIdentification: !patientData.dateNaissance && !patientData.birthDate,
      };
    }

    return {
      canAssign: true,
      requiresIdentification: false,
      ageGroup: ageDetection.variant,
    };
  } catch (error) {
    logger.error('Error checking patient assignment eligibility:', error);
    return {
      canAssign: false,
      reason: 'Internal error',
      requiresIdentification: false,
    };
  }
}

/**
 * Obtient un résumé des questionnaires assignés à un patient
 */
export async function getPatientQuestionnairesSummary(patientUid: string): Promise<{
  total: number;
  pending: number;
  inProgress: number;
  submitted: number;
  completed: number;
  ageGroup?: AgeVariant;
}> {
  try {
    const questionnaires = await db
      .collection('questionnaires')
      .where('patientUid', '==', patientUid)
      .get();

    const summary = {
      total: questionnaires.size,
      pending: 0,
      inProgress: 0,
      submitted: 0,
      completed: 0,
    };

    let ageGroup: AgeVariant | undefined;

    questionnaires.forEach((doc) => {
      const data = doc.data();

      if (!ageGroup && data.ageVariant) {
        ageGroup = data.ageVariant;
      }

      switch (data.status) {
        case 'pending':
          summary.pending++;
          break;
        case 'in_progress':
          summary.inProgress++;
          break;
        case 'submitted':
          summary.submitted++;
          break;
        case 'completed':
          summary.completed++;
          break;
      }
    });

    return { ...summary, ageGroup };
  } catch (error) {
    logger.error('Error getting patient questionnaires summary:', error);
    return {
      total: 0,
      pending: 0,
      inProgress: 0,
      submitted: 0,
      completed: 0,
    };
  }
}
