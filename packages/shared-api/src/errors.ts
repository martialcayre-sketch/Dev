/**
 * Shared API Error Classes
 */

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
