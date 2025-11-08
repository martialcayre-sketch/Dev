/**
 * API Client Service - Practitioner App
 *
 * Centralized HTTP API client for NeuroNutrition backend (Practitioner-specific endpoints)
 * Uses Firebase Auth tokens for authentication
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

export interface Patient {
  uid: string;
  email: string;
  firstname?: string;
  lastname?: string;
  status?: 'pending' | 'approved' | 'rejected';
  practitionerId?: string;
  createdAt?: any;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  ok: boolean;
}

export interface PractitionerQuestionnairesResponse {
  questionnaires: Questionnaire[];
  total: number;
  hasMore: boolean;
}

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = '/api';
const REQUEST_TIMEOUT = 30000;

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

async function fetchWithTimeout<T>(
  url: string,
  options: RequestInit = {},
  timeout = REQUEST_TIMEOUT
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (auth.currentUser) {
      try {
        const token = await getAuthToken();
        headers['Authorization'] = `Bearer ${token}`;
      } catch (authError) {
        console.warn('[API] Proceeding without auth token:', authError);
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

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
   * Health check
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return fetchWithTimeout(`${API_BASE_URL}/health`, {
      method: 'GET',
    });
  },

  /**
   * Get all questionnaires for a practitioner
   *
   * @param practitionerId - UID of the practitioner
   * @param options - Query options (status filter, pagination)
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

    const url = `${API_BASE_URL}/practitioners/${practitionerId}/questionnaires?${params}`;
    return fetchWithTimeout(url, { method: 'GET' });
  },

  /**
   * Get questionnaire detail for a specific patient
   */
  async getQuestionnaireDetail(
    patientId: string,
    questionnaireId: string
  ): Promise<{ questionnaire: Questionnaire }> {
    const url = `${API_BASE_URL}/patients/${patientId}/questionnaires/${questionnaireId}`;
    return fetchWithTimeout(url, { method: 'GET' });
  },

  /**
   * Get all questionnaires for a specific patient
   */
  async getPatientQuestionnaires(patientId: string): Promise<{ questionnaires: Questionnaire[] }> {
    const url = `${API_BASE_URL}/patients/${patientId}/questionnaires`;
    return fetchWithTimeout(url, { method: 'GET' });
  },

  /**
   * Complete a questionnaire (mark as reviewed by practitioner)
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
};

export default api;
