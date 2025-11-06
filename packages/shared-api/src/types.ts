/**
 * Life Journey Data Structure
 */
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

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * API Configuration
 */
export interface ApiConfig {
  baseUrl?: string;
  timeout?: number;
}
