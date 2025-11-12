/**
 * API Client Service - Practitioner App
 * Wraps shared-api with Firebase Auth integration
 */

import { auth } from '@/lib/firebase';
import { ApiClient, AuthError } from '@neuronutrition/shared-api';

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
 * Create API client instance with Firebase Auth
 */
const api = new ApiClient({
  baseUrl: '/api',
  timeout: 30000,
  getAuthToken,
});

export default api;

// Re-export types and errors for convenience
export {
  ApiError,
  AuthError,
  NetworkError,
  type ConsultationData,
  type DashboardData,
  type Patient,
  type Questionnaire,
  type QuestionnaireDetailResponse,
  type QuestionnairesListResponse,
  type QuestionnaireStatus,
  type SaveResponsesResponse,
} from '@neuronutrition/shared-api';
