/**
 * API Client Service - Patient App
 *
 * Centralized HTTP API client for NeuroNutrition backend
 * Uses Firebase Auth tokens for authentication
 * Handles errors, retries, and type safety
 */

import { auth } from '@/lib/firebase';

// ============================================================================
// Types
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

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  ok: boolean;
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

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = '/api'; // Relative URL - handled by Firebase Hosting rewrite
const REQUEST_TIMEOUT = 30000; // 30 seconds

// ============================================================================
// Error Classes
// ============================================================================

export class ApiError extends Error {
  statusCode?: number;
  details?: any;

  constructor(message: string, statusCode?: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class AuthError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, 401);
    this.name = 'AuthError';
  }
}

export class NetworkError extends ApiError {
  constructor(message = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get Firebase Auth ID token for authenticated requests
 */
async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new AuthError('No authenticated user');
  }

  try {
    const token = await user.getIdToken();
    return token;
  } catch (error) {
    console.error('[API] Failed to get auth token:', error);
    throw new AuthError('Failed to get authentication token');
  }
}

/**
 * Make HTTP request with timeout, auth, and error handling
 */
async function fetchWithTimeout<T>(
  url: string,
  options: RequestInit = {},
  timeout = REQUEST_TIMEOUT
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Get auth token if user is logged in
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (auth.currentUser) {
      try {
        const token = await getAuthToken();
        headers['Authorization'] = `Bearer ${token}`;
      } catch (authError) {
        console.warn('[API] Proceeding without auth token:', authError);
        // Continue without auth for public endpoints
      }
    }

    const response = await fetch(url, {
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
        // Response not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }

      throw new ApiError(errorMessage, response.status, errorDetails);
    }

    // Parse JSON response
    const data = await response.json();
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

// ============================================================================
// API Client Methods
// ============================================================================

export const api = {
  /**
   * Health check - verify API is accessible
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return fetchWithTimeout(`${API_BASE_URL}/health`, {
      method: 'GET',
    });
  },

  /**
   * Get all questionnaires for a patient
   */
  async getPatientQuestionnaires(patientId: string): Promise<QuestionnairesListResponse> {
    const url = `${API_BASE_URL}/patients/${patientId}/questionnaires`;
    return fetchWithTimeout(url, { method: 'GET' });
  },

  /**
   * Get details of a specific questionnaire
   */
  async getQuestionnaireDetail(
    patientId: string,
    questionnaireId: string
  ): Promise<QuestionnaireDetailResponse> {
    const url = `${API_BASE_URL}/patients/${patientId}/questionnaires/${questionnaireId}`;
    return fetchWithTimeout(url, { method: 'GET' });
  },

  /**
   * Save questionnaire responses (auto-save)
   * Uses PATCH to merge with existing responses
   */
  async saveQuestionnaireResponses(
    patientId: string,
    questionnaireId: string,
    responses: Record<string, any>
  ): Promise<SaveResponsesResponse> {
    const url = `${API_BASE_URL}/patients/${patientId}/questionnaires/${questionnaireId}/responses`;
    return fetchWithTimeout(url, {
      method: 'PATCH',
      body: JSON.stringify({ responses }),
    });
  },

  /**
   * Submit questionnaire to practitioner
   */
  async submitQuestionnaire(
    patientId: string,
    questionnaireId: string
  ): Promise<{ ok: boolean; submittedAt: string; message: string }> {
    const url = `${API_BASE_URL}/patients/${patientId}/questionnaires/${questionnaireId}/submit`;
    return fetchWithTimeout(url, {
      method: 'POST',
    });
  },

  /**
   * Complete questionnaire (practitioner action)
   */
  async completeQuestionnaire(
    patientId: string,
    questionnaireId: string
  ): Promise<{ ok: boolean; completedAt: string; message: string }> {
    const url = `${API_BASE_URL}/patients/${patientId}/questionnaires/${questionnaireId}/complete`;
    return fetchWithTimeout(url, {
      method: 'POST',
    });
  },

  /**
   * Get consultation data (identification + anamnese)
   */
  async getConsultation(patientId: string): Promise<{
    identification: any | null;
    anamnese: any | null;
  }> {
    const url = `${API_BASE_URL}/patients/${patientId}/consultation`;
    return fetchWithTimeout(url, { method: 'GET' });
  },

  /**
   * Get identification data
   */
  async getIdentification(patientId: string): Promise<any> {
    const url = `${API_BASE_URL}/patients/${patientId}/consultation/identification`;
    return fetchWithTimeout(url, { method: 'GET' });
  },

  /**
   * Save identification data
   */
  async saveIdentification(
    patientId: string,
    data: any
  ): Promise<{ ok: boolean; message: string; updatedAt: string }> {
    const url = `${API_BASE_URL}/patients/${patientId}/consultation/identification`;
    return fetchWithTimeout(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get anamnese data
   */
  async getAnamnese(patientId: string): Promise<any> {
    const url = `${API_BASE_URL}/patients/${patientId}/consultation/anamnese`;
    return fetchWithTimeout(url, { method: 'GET' });
  },

  /**
   * Save anamnese data
   */
  async saveAnamnese(
    patientId: string,
    data: any
  ): Promise<{ ok: boolean; message: string; updatedAt: string }> {
    const url = `${API_BASE_URL}/patients/${patientId}/consultation/anamnese`;
    return fetchWithTimeout(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get patient dashboard data
   */
  async getPatientDashboard(patientId: string): Promise<{
    profile: any;
    pendingQuestionnaires: any[];
    scores: any;
    nextConsultation: any;
    consultationStatus: {
      hasIdentification: boolean;
      hasAnamnese: boolean;
    };
  }> {
    const url = `${API_BASE_URL}/patients/${patientId}/dashboard`;
    return fetchWithTimeout(url, { method: 'GET' });
  },

  /**
   * Get patient scores (all questionnaires)
   */
  async getPatientScores(patientId: string): Promise<any> {
    const url = `${API_BASE_URL}/patients/${patientId}/scores`;
    return fetchWithTimeout(url, { method: 'GET' });
  },
};

// ============================================================================
// React Query / SWR Helpers (Optional)
// ============================================================================

/**
 * Custom fetch wrapper for React Query / SWR
 */
export async function apiFetcher<T>(url: string): Promise<T> {
  return fetchWithTimeout(url, { method: 'GET' });
}

/**
 * Mutation wrapper for React Query
 */
export async function apiMutation<TData, TVariables>(
  url: string,
  data: TVariables,
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE' = 'POST'
): Promise<TData> {
  return fetchWithTimeout(url, {
    method,
    body: JSON.stringify(data),
  });
}

// ============================================================================
// Export default instance
// ============================================================================

export default api;
