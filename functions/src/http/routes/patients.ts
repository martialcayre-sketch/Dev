/**
 * Routes HTTP pour la gestion de l'identification des patients
 * Conforme au Master Document V3 - Identification obligatoire avant assignation questionnaires
 */

import { Router } from 'express';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { z } from 'zod';
import { assignAgeAppropriateQuestionnaires } from '../../utils/ageAwareAssignment';
import { AuthenticatedRequest } from '../middleware/auth';

// Utilities pour le calcul d'âge
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

function getAgeGroup(age: number): 'adult' | 'teen' | 'kid' {
  if (age <= 12) return 'kid';
  if (age <= 18) return 'teen';
  return 'adult';
}

function validateBirthDate(birthDate: string | Date): {
  valid: boolean;
  error?: string;
  age?: number;
} {
  try {
    const birth = new Date(birthDate);

    if (isNaN(birth.getTime())) {
      return { valid: false, error: 'Date de naissance invalide' };
    }

    const age = calculateAge(birth);

    if (age < 6) {
      return { valid: false, error: "L'âge minimum est de 6 ans" };
    }

    if (age > 100) {
      return { valid: false, error: "L'âge maximum est de 100 ans" };
    }

    return { valid: true, age };
  } catch (error) {
    return { valid: false, error: "Erreur lors du calcul de l'âge" };
  }
}

const router = Router();
const db = admin.firestore();

// Schema de validation pour les données d'identification
const IdentificationSchema = z.object({
  firstname: z.string().min(1, 'Prénom requis'),
  lastname: z.string().min(1, 'Nom de famille requis'),
  sexe: z.enum(['M', 'F', 'Autre'], { errorMap: () => ({ message: 'Sexe requis' }) }),
  dateNaissance: z.string().min(10, 'Date de naissance requise (format: YYYY-MM-DD)'),
  taille: z.number().min(50).max(250).optional(),
  poids: z.number().min(10).max(500).optional(),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
  profession: z.string().optional(),
  situationFamiliale: z.string().optional(),
  personneUrgence: z.string().optional(),
  telephoneUrgence: z.string().optional(),
});

/**
 * POST /api/patients/identification
 * Complète l'identification du patient et déclenche l'assignation des questionnaires
 */
router.post('/identification', async (req: AuthenticatedRequest, res) => {
  try {
    // Vérifier l'authentification
    if (!req.user?.uid) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const patientUid = req.user.uid;
    logger.info(`🆔 Starting identification completion for patient ${patientUid}`);

    // Valider les données d'entrée
    const validationResult = IdentificationSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: "Données d'identification invalides",
        details: validationResult.error.errors,
      });
    }

    const identificationData = validationResult.data;

    // Valider la date de naissance
    const birthValidation = validateBirthDate(identificationData.dateNaissance);
    if (!birthValidation.valid) {
      return res.status(400).json({
        success: false,
        error: birthValidation.error,
      });
    }

    // Calculer l'âge et la tranche d'âge
    const age = calculateAge(identificationData.dateNaissance);
    const ageGroup = getAgeGroup(age);

    logger.info(`🎂 Age calculated: ${age} years -> ${ageGroup} group`);

    // Vérifier que le patient existe
    const patientRef = db.collection('patients').doc(patientUid);
    const patientSnap = await patientRef.get();

    if (!patientSnap.exists) {
      return res.status(404).json({
        success: false,
        error: 'Patient document not found',
      });
    }

    const patientData = patientSnap.data() as any;

    // Vérifier que l'identification n'est pas déjà complète
    if (patientData.identificationCompleted) {
      return res.status(400).json({
        success: false,
        error: 'Identification already completed',
        ageGroup,
        questionnairesAlreadyAssigned: patientData.hasQuestionnairesAssigned,
      });
    }

    // Sauvegarder les données d'identification
    const updateData = {
      ...identificationData,
      age,
      ageGroup,
      identificationCompleted: true,
      identificationCompletedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await patientRef.update(updateData);
    logger.info(`✅ Identification data saved for patient ${patientUid}`);

    // Assigner les questionnaires si pas encore fait
    let assignmentResult = null;
    if (!patientData.hasQuestionnairesAssigned) {
      logger.info(`📋 Starting questionnaire assignment for age group: ${ageGroup}`);

      try {
        assignmentResult = await assignAgeAppropriateQuestionnaires(patientUid, ageGroup);
        logger.info(
          `🎉 Questionnaires assigned successfully: ${assignmentResult.questionnairesAssigned} questionnaires`
        );
      } catch (assignmentError: any) {
        logger.error('❌ Failed to assign questionnaires:', assignmentError);

        // L'identification est sauvegardée, mais l'assignation a échoué
        return res.status(500).json({
          success: false,
          identificationSaved: true,
          error: "Identification sauvegardée mais erreur lors de l'assignation des questionnaires",
          details: assignmentError.message,
        });
      }
    } else {
      logger.info(`⏭️ Questionnaires already assigned for patient ${patientUid}`);
    }

    // Envoyer notification par email
    try {
      const patientEmail = patientData.email;
      if (patientEmail && assignmentResult && assignmentResult.questionnairesAssigned > 0) {
        await db.collection('mail').add({
          to: patientEmail,
          message: {
            subject: '📋 Vos questionnaires sont prêts !',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4F46E5;">Questionnaires personnalisés disponibles</h2>
                <p>Bonjour ${identificationData.firstname},</p>
                <p>Suite à votre identification, nous avons préparé <strong>${
                  assignmentResult.questionnairesAssigned
                } questionnaires</strong> adaptés à votre profil (${
              ageGroup === 'adult' ? 'adulte' : ageGroup === 'teen' ? 'adolescent' : 'enfant'
            }).</p>
                <p>Vous pouvez maintenant commencer à les remplir dans votre espace patient.</p>
                <p style="margin: 30px 0;">
                  <a href="https://neuronutrition-app-patient.web.app/dashboard" style="background-color:#4F46E5;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px;display:inline-block;">Accéder aux questionnaires</a>
                </p>
              </div>
            `,
          },
        });
      }
    } catch (emailError) {
      logger.warn('Failed to send questionnaires notification email:', emailError);
      // Non-blocking error
    }

    // Notifier le praticien
    try {
      const practitionerId = patientData.practitionerId;
      if (practitionerId) {
        await db
          .collection('practitioners')
          .doc(practitionerId)
          .collection('notifications')
          .add({
            type: 'patient_identification_completed',
            title: 'Patient complété son identification',
            message: `${identificationData.firstname} ${identificationData.lastname} (${age} ans - ${ageGroup})`,
            patientId: patientUid,
            patientName: `${identificationData.firstname} ${identificationData.lastname}`,
            ageGroup,
            questionnairesAssigned: assignmentResult?.questionnairesAssigned || 0,
            read: false,
            createdAt: FieldValue.serverTimestamp(),
            link: `/patients/${patientUid}`,
          });
      }
    } catch (practitionerNotificationError) {
      logger.warn('Failed to send practitioner notification:', practitionerNotificationError);
      // Non-blocking error
    }

    // Réponse de succès
    const response = {
      success: true,
      message: 'Identification complétée avec succès',
      patient: {
        age,
        ageGroup,
        ageGroupLabel:
          ageGroup === 'adult' ? 'Adulte' : ageGroup === 'teen' ? 'Adolescent' : 'Enfant',
      },
      questionnaires: assignmentResult
        ? {
            assigned: true,
            count: assignmentResult.questionnairesAssigned,
            templates: assignmentResult.templates,
          }
        : {
            assigned: false,
            reason: 'Questionnaires already assigned',
          },
    };

    logger.info(`🎉 Identification completed successfully for patient ${patientUid}`);

    return res.status(200).json(response);
  } catch (error: any) {
    logger.error('❌ Error in identification completion:', error);

    return res.status(500).json({
      success: false,
      error: "Erreur interne lors de l'identification",
      details: error.message,
    });
  }
});

/**
 * GET /api/patients/identification/status
 * Vérifie le statut d'identification d'un patient
 */
router.get('/identification/status', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const patientUid = req.user.uid;
    const patientRef = db.collection('patients').doc(patientUid);
    const patientSnap = await patientRef.get();

    if (!patientSnap.exists) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found',
      });
    }

    const patientData = patientSnap.data() as any;

    const response = {
      success: true,
      identificationCompleted: !!patientData.identificationCompleted,
      questionnairesAssigned: !!patientData.hasQuestionnairesAssigned,
      ageGroup: patientData.ageGroup || null,
      age: patientData.age || null,
      identificationRequired: patientData.identificationRequired || false,
    };

    return res.status(200).json(response);
  } catch (error: any) {
    logger.error('❌ Error checking identification status:', error);

    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification du statut',
      details: error.message,
    });
  }
});

export default router;
