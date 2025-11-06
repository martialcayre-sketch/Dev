import type { ApiConfig, ApiResponse, LifeJourneyData } from './types';

/**
 * API Client for NeuroNutrition Backend
 */
export class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(config: ApiConfig = {}) {
    // Default to relative /api path (works with Firebase Hosting rewrites)
    this.baseUrl = config.baseUrl || '/api';
    this.timeout = config.timeout || 10000;
  }

  /**
   * Generic fetch wrapper with timeout
   */
  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return { data };
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        return { error: 'Request timeout' };
      }
      return { error: error.message || 'Network error' };
    }
  }

  /**
   * Get latest Life Journey entry for a patient
   */
  async getPatientLifeJourney(patientId: string): Promise<ApiResponse<LifeJourneyData>> {
    if (!patientId) {
      return { error: 'Patient ID is required' };
    }
    return this.fetch<LifeJourneyData>(`/patients/${patientId}/lifejourney`);
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
    return this.fetch<LifeJourneyData[]>(`/patients/${patientId}/lifejourney/all?limit=${limit}`);
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<ApiResponse<{ ok: boolean }>> {
    return this.fetch<{ ok: boolean }>('/health');
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
