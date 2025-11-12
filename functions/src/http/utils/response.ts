export type ApiSuccess<T = any> = {
  success: true;
  data: T;
  requestId?: string;
  meta?: Record<string, unknown>;
};

export type ApiError = {
  success: false;
  error: { code: string; message: string; details?: any };
  requestId?: string;
};

export function makeOk<T>(
  data: T,
  requestId?: string,
  meta?: Record<string, unknown>
): ApiSuccess<T> {
  return { success: true, data, requestId, meta };
}

export function makeError(
  code: string,
  message: string,
  requestId?: string,
  details?: any
): ApiError {
  return { success: false, error: { code, message, details }, requestId };
}
