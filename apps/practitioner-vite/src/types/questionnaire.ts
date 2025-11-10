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

export interface Patient {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  practitionerId?: string;
  createdAt: Timestamp | null;
  lastQuestionnaireCompletedAt: Timestamp | null;
}

export interface Consultation {
  id: string;
  practitionerId: string;
  patientId: string;
  date: Timestamp;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Timestamp;
}

export interface DayFlowItem {
  id: string;
  patientId: string;
  date: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  answers?: Record<string, unknown>;
  interpretation?: Record<string, unknown>;
  scores?: {
    axes?: Record<string, number>;
  };
  radarInverted?: Record<string, number>;
}
