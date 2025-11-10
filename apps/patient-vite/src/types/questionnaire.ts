import type { Timestamp } from 'firebase/firestore';

export type QuestionnaireStatus = 'pending' | 'in_progress' | 'completed' | 'submitted';

export interface QuestionnaireResponse {
  [questionId: string]: string | number | boolean | string[] | number[];
}

export interface PatientQuestionnaire {
  id: string;
  patientId: string;
  questionnaireId: string;
  status: QuestionnaireStatus;
  assignedAt: Timestamp | null;
  completedAt: Timestamp | null;
  submittedAt: Timestamp | null;
  responses?: QuestionnaireResponse;
  score?: number;
  interpretation?: string;
}

export interface QuestionnaireDefinition {
  id: string;
  title: string;
  description?: string;
  category?: string;
  questions: QuestionnaireQuestion[];
}

export interface QuestionnaireQuestion {
  id: string;
  text: string;
  type: 'text' | 'number' | 'choice' | 'multiple' | 'scale';
  required?: boolean;
  options?: string[];
}

export interface Notification {
  id: string;
  patientId: string;
  type: 'questionnaire_assigned' | 'questionnaire_due' | 'message' | 'appointment';
  title: string;
  message: string;
  read: boolean;
  createdAt: Timestamp | null;
  questionnaireId?: string;
}

export interface PatientProfile {
  profile: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    birthDate?: string;
  };
  pendingQuestionnaires: PatientQuestionnaire[];
  scores: {
    overall?: number;
    categories?: Record<string, number>;
  };
  nextConsultation: {
    date?: string;
    practitionerId?: string;
  } | null;
}

export interface IdentificationData {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface AnamneseData {
  medicalHistory?: string;
  currentMedications?: string;
  allergies?: string;
  familyHistory?: string;
  lifestyle?: string;
  dietaryHabits?: string;
  [key: string]: string | undefined;
}
