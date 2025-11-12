/**
 * Shared API Package
 * Exports API client, types, and errors
 */

export { ApiClient, getApiClient, resetApiClient } from './client';
export { ApiError, AuthError, NetworkError } from './errors';
export type {
  ApiConfig,
  ApiResponse,
  ConsultationData,
  DashboardData,
  LifeJourneyData,
  Patient,
  PractitionerQuestionnairesResponse,
  Questionnaire,
  QuestionnaireDetailResponse,
  QuestionnaireStatus,
  QuestionnairesListResponse,
  SaveResponsesPayload,
  SaveResponsesResponse,
} from './types';
