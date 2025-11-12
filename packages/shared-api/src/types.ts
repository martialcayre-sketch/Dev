/**
 * Shared API Types
 * Types communs utilisés par patient et practitioner apps
 */

// ============================================================================
// Questionnaire Types
// ============================================================================

export type QuestionnaireStatus =
  | 'pending'
  | 'in_progress'
  | 'submitted'
  | 'completed'
  | 'reopened';

export interface Questionnaire {
  id: string;
  title: string;
  category?: string;
  description?: string;
  status: QuestionnaireStatus;
  patientUid: string;
  practitionerId?: string;
  assignedAt: string | null;
  completedAt?: string | null;
  submittedAt?: string | null;
  responses?: Record<string, any>;
  progress?: number;
}

export interface QuestionnairesListResponse {
  questionnaires: Questionnaire[];
  total?: number;
  hasMore?: boolean;
}

export interface QuestionnaireDetailResponse {
  questionnaire: Questionnaire;
}

export interface SaveResponsesPayload {
  responses: Record<string, any>;
}

export interface SaveResponsesResponse {
  ok: boolean;
  savedAt: string;
}

export interface PractitionerQuestionnairesResponse {
  questionnaires: Questionnaire[];
  total: number;
  hasMore: boolean;
}

// ============================================================================
// Patient Types
// ============================================================================

export interface Patient {
  uid: string;
  email: string;
  firstname?: string;
  lastname?: string;
  status?: 'pending' | 'approved' | 'rejected';
  practitionerId?: string;
  createdAt?: any;
}

// ============================================================================
// Consultation Types
// ============================================================================

export interface ConsultationData {
  identification: any | null;
  anamnese: any | null;
}

export interface DashboardData {
  profile: any;
  pendingQuestionnaires: any[];
  scores: any;
  nextConsultation: any;
  consultationStatus: {
    hasIdentification: boolean;
    hasAnamnese: boolean;
  };
}

// ============================================================================
// Life Journey Types
// ============================================================================

export interface LifeJourneyData {
  id: string;
  answers: Record<string, Record<string, number>>;
  scores: Record<
    string,
    {
      raw: number;
      max: number;
      percent: number;
    }
  >;
  global: number;
  completedAt: string;
  submittedAt: any;
}

// ============================================================================
// API Response & Config Types
// ============================================================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  ok?: boolean;
}

export interface ApiConfig {
  baseUrl?: string;
  timeout?: number;
  getAuthToken?: () => Promise<string>;
}
