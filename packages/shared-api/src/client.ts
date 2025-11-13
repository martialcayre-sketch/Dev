/**
 * Shared API Client for NeuroNutrition Backend
 * Centralized HTTP API client with Firebase Auth integration
 * Handles errors, retries, and type safety
 */

import { ApiError, NetworkError } from './errors';
import type {
  ApiConfig,
  ApiResponse,
  ConsultationData,
  DashboardData,
  LifeJourneyData,
  PractitionerQuestionnairesResponse,
  QuestionnaireDetailResponse,
  QuestionnairesListResponse,
  QuestionnaireStatus,
  SaveResponsesResponse,
} from './types';

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_BASE_URL = '/api';

/**
 * Shared API Client
 */
export class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private getAuthToken?: () => Promise<string>;

  constructor(config: ApiConfig = {}) {
    this.baseUrl = config.baseUrl || DEFAULT_BASE_URL;
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
    this.getAuthToken = config.getAuthToken;
  }

  /**
   * Generic fetch wrapper with timeout, auth, and error handling
   */
  private async fetchWithTimeout<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      // Build headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      // Add auth token if available
      if (this.getAuthToken) {
        try {
          const token = await this.getAuthToken();
          headers['Authorization'] = `Bearer ${token}`;
        } catch (authError) {
          console.warn('[API] Proceeding without auth token:', authError);
          // Continue without auth for public endpoints
        }
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        let errorDetails;

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          errorDetails = errorData;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }

        throw new ApiError(errorMessage, response.status, errorDetails);
      }

      // Parse JSON response
      const data = await response.json();
      
      // Unwrap { success, data, requestId } envelope if present
      if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
        return data.data as T;
      }
      
      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new NetworkError('Request timeout');
        }
        throw new NetworkError(error.message);
      }

      throw new NetworkError('Unknown error occurred');
    }
  }

  // ========================================================================
  // Health & Utility
  // ========================================================================

  /**
   * Health check - verify API is accessible
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.fetchWithTimeout('/health', { method: 'GET' });
  }

  // ========================================================================
  // Questionnaires - Patient endpoints
  // ========================================================================

  /**
   * Get all questionnaires for a patient
   */
  async getPatientQuestionnaires(patientId: string): Promise<QuestionnairesListResponse> {
    return this.fetchWithTimeout(`/patients/${patientId}/questionnaires`, {
      method: 'GET',
    });
  }

  /**
   * Get details of a specific questionnaire
   */
  async getQuestionnaireDetail(
    patientId: string,
    questionnaireId: string
  ): Promise<QuestionnaireDetailResponse> {
    return this.fetchWithTimeout(`/patients/${patientId}/questionnaires/${questionnaireId}`, {
      method: 'GET',
    });
  }

  /**
   * Save questionnaire responses (auto-save)
   */
  async saveQuestionnaireResponses(
    patientId: string,
    questionnaireId: string,
    responses: Record<string, any>
  ): Promise<SaveResponsesResponse> {
    return this.fetchWithTimeout(
      `/patients/${patientId}/questionnaires/${questionnaireId}/responses`,
      {
        method: 'PATCH',
        body: JSON.stringify({ responses }),
      }
    );
  }

  /**
   * Submit questionnaire to practitioner
   */
  async submitQuestionnaire(
    patientId: string,
    questionnaireId: string
  ): Promise<{ ok: boolean; submittedAt: string; message: string }> {
    return this.fetchWithTimeout(
      `/patients/${patientId}/questionnaires/${questionnaireId}/submit`,
      { method: 'POST' }
    );
  }

  /**
   * Complete questionnaire (practitioner action)
   */
  async completeQuestionnaire(
    patientId: string,
    questionnaireId: string
  ): Promise<{ ok: boolean; completedAt: string; message: string }> {
    return this.fetchWithTimeout(
      `/patients/${patientId}/questionnaires/${questionnaireId}/complete`,
      { method: 'POST' }
    );
  }

  // ========================================================================
  // Questionnaires - Practitioner endpoints
  // ========================================================================

  /**
   * Get all questionnaires for a practitioner
   */
  async getPractitionerQuestionnaires(
    practitionerId: string,
    options?: {
      status?: QuestionnaireStatus;
      limit?: number;
      offset?: number;
    }
  ): Promise<PractitionerQuestionnairesResponse> {
    const params = new URLSearchParams();
    if (options?.status) params.set('status', options.status);
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.offset) params.set('offset', String(options.offset));

    return this.fetchWithTimeout(`/practitioners/${practitionerId}/questionnaires?${params}`, {
      method: 'GET',
    });
  }

  // ========================================================================
  // Consultation
  // ========================================================================

  /**
   * Get consultation data (identification + anamnese)
   */
  async getConsultation(patientId: string): Promise<ConsultationData> {
    return this.fetchWithTimeout(`/patients/${patientId}/consultation`, {
      method: 'GET',
    });
  }

  /**
   * Get identification data
   */
  async getIdentification(patientId: string): Promise<any> {
    return this.fetchWithTimeout(`/patients/${patientId}/consultation/identification`, {
      method: 'GET',
    });
  }

  /**
   * Save identification data
   */
  async saveIdentification(
    patientId: string,
    data: any
  ): Promise<{ ok: boolean; message: string; updatedAt: string }> {
    return this.fetchWithTimeout(`/patients/${patientId}/consultation/identification`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get anamnese data
   */
  async getAnamnese(patientId: string): Promise<any> {
    return this.fetchWithTimeout(`/patients/${patientId}/consultation/anamnese`, {
      method: 'GET',
    });
  }

  /**
   * Save anamnese data
   */
  async saveAnamnese(
    patientId: string,
    data: any
  ): Promise<{ ok: boolean; message: string; updatedAt: string }> {
    return this.fetchWithTimeout(`/patients/${patientId}/consultation/anamnese`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ========================================================================
  // Dashboard & Analytics
  // ========================================================================

  /**
   * Get patient dashboard data
   */
  async getPatientDashboard(patientId: string): Promise<DashboardData> {
    return this.fetchWithTimeout(`/patients/${patientId}/dashboard`, {
      method: 'GET',
    });
  }

  /**
   * Get patient scores (all questionnaires)
   */
  async getPatientScores(patientId: string): Promise<any> {
    return this.fetchWithTimeout(`/patients/${patientId}/scores`, {
      method: 'GET',
    });
  }

  /**
   * Get DNSM scores for a specific questionnaire
   */
  async getDNSMScores(
    patientId: string,
    questionnaireId: string
  ): Promise<{
    ok: boolean;
    questionnaireId: string;
    patientId: string;
    scores: {
      dopamine: number;
      noradrenaline: number;
      serotonine: number;
      melatonine: number;
      total: number;
      dopaminePercent: number;
      noradrenalinePercent: number;
      serotoninePercent: number;
      melatoninePercent: number;
      globalPercent: number;
      isComplete: boolean;
    };
    interpretations: Array<{
      axis: string;
      score: number;
      percent: number;
      status: 'normal' | 'probable' | 'marquee';
      label: string;
      color: string;
    }>;
    isComplete: boolean;
  }> {
    return this.fetchWithTimeout(
      `/patients/${patientId}/questionnaires/${questionnaireId}/scores/dnsm`,
      {
        method: 'GET',
      }
    );
  }

  // ========================================================================
  // Practitioner Management
  // ========================================================================

  /**
   * Get all patients for a practitioner
   */
  async getPractitionerPatients(
    practitionerId: string,
    status?: 'pending' | 'approved' | 'rejected'
  ): Promise<{
    ok: boolean;
    patients: Array<{
      uid: string;
      email: string;
      displayName?: string;
      firstname?: string;
      lastname?: string;
      status?: string;
      createdAt?: string;
      practitionerId?: string;
    }>;
    total: number;
  }> {
    const params = new URLSearchParams();
    if (status) params.set('status', status);

    return this.fetchWithTimeout(`/practitioners/${practitionerId}/patients?${params}`, {
      method: 'GET',
    });
  }

  /**
   * Get consultations for a practitioner
   */
  async getPractitionerConsultations(
    practitionerId: string,
    limit: number = 50
  ): Promise<{
    ok: boolean;
    consultations: Array<{
      id: string;
      patientId: string;
      patientName: string;
      createdAt?: string;
      updatedAt?: string;
      status?: string;
      type?: string;
    }>;
    total: number;
  }> {
    return this.fetchWithTimeout(`/practitioners/${practitionerId}/consultations?limit=${limit}`, {
      method: 'GET',
    });
  }

  /**
   * Get metrics for a practitioner
   */
  async getPractitionerMetrics(practitionerId: string): Promise<{
    ok: boolean;
    metrics: {
      patients: {
        total: number;
        approved: number;
        pending: number;
      };
      questionnaires: {
        total: number;
        submitted: number;
        completed: number;
      };
      consultations: {
        total: number;
      };
    };
  }> {
    return this.fetchWithTimeout(`/practitioners/${practitionerId}/metrics`, {
      method: 'GET',
    });
  }

  /**
   * Archive a patient (practitioner action)
   */
  async archivePatient(
    practitionerId: string,
    patientId: string
  ): Promise<{
    ok: boolean;
    message: string;
    archivedAt: string;
  }> {
    return this.fetchWithTimeout(`/practitioners/${practitionerId}/patients/${patientId}/archive`, {
      method: 'POST',
    });
  }

  /**
   * Delete a patient (practitioner action)
   */
  async deletePatient(
    practitionerId: string,
    patientId: string
  ): Promise<{
    ok: boolean;
    message: string;
  }> {
    return this.fetchWithTimeout(`/practitioners/${practitionerId}/patients/${patientId}`, {
      method: 'DELETE',
    });
  }

  // ========================================================================
  // Life Journey
  // ========================================================================

  /**
   * Get latest Life Journey entry for a patient
   */
  async getPatientLifeJourney(patientId: string): Promise<ApiResponse<LifeJourneyData>> {
    if (!patientId) {
      return { error: 'Patient ID is required' };
    }
    try {
      const data = await this.fetchWithTimeout<LifeJourneyData>(
        `/patients/${patientId}/lifejourney`
      );
      return { data };
    } catch (error: any) {
      return { error: error.message || 'Failed to fetch Life Journey data' };
    }
  }

  /**
   * Get all Life Journey entries for a patient
   */
  async getPatientLifeJourneyAll(
    patientId: string,
    limit: number = 20
  ): Promise<ApiResponse<LifeJourneyData[]>> {
    if (!patientId) {
      return { error: 'Patient ID is required' };
    }
    try {
      const data = await this.fetchWithTimeout<LifeJourneyData[]>(
        `/patients/${patientId}/lifejourney/all?limit=${limit}`
      );
      return { data };
    } catch (error: any) {
      return { error: error.message || 'Failed to fetch Life Journey data' };
    }
  }
}

/**
 * Create a singleton API client instance
 */
let apiClientInstance: ApiClient | null = null;

export function getApiClient(config?: ApiConfig): ApiClient {
  if (!apiClientInstance) {
    apiClientInstance = new ApiClient(config);
  }
  return apiClientInstance;
}

export function resetApiClient(): void {
  apiClientInstance = null;
}
