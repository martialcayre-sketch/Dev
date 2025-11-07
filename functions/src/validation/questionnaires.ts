import { z } from 'zod';

/**
 * Validation schemas pour les Cloud Functions questionnaires
 */

export const AssignQuestionnairesSchema = z.object({
  practitionerId: z.string().optional(),
});

export const SubmitQuestionnaireSchema = z.object({
  patientId: z.string().min(1, 'Patient ID requis'),
  questionnaireId: z.string().min(1, 'Questionnaire ID requis'),
});

export const SetQuestionnaireStatusSchema = z.object({
  patientId: z.string().min(1, 'Patient ID requis'),
  questionnaireId: z.string().min(1, 'Questionnaire ID requis'),
  status: z.enum(['reopened', 'completed'], {
    errorMap: () => ({ message: "Status doit être 'reopened' ou 'completed'" }),
  }),
});

export const SaveProgressSchema = z.object({
  patientId: z.string().min(1, 'Patient ID requis'),
  questionnaireId: z.string().min(1, 'Questionnaire ID requis'),
  responses: z.record(z.any()).optional(),
});

/**
 * Types TypeScript inférés depuis les schémas Zod
 */
export type AssignQuestionnairesInput = z.infer<typeof AssignQuestionnairesSchema>;
export type SubmitQuestionnaireInput = z.infer<typeof SubmitQuestionnaireSchema>;
export type SetQuestionnaireStatusInput = z.infer<typeof SetQuestionnaireStatusSchema>;
export type SaveProgressInput = z.infer<typeof SaveProgressSchema>;
