import { z } from 'zod';
// Provide Buffer typing for dts build without requiring @types/node
declare const Buffer: any;

// Questionnaire status enum centralisation
export const QuestionnaireStatusEnum = z.enum([
  'pending',
  'in_progress',
  'submitted',
  'completed',
  'reopened',
]);

export const IdempotencyKeySchema = z.string().min(8).max(128);

export const QuestionnaireSubmitSchema = z.object({
  patientId: z.string().min(1),
  questionnaireId: z.string().min(1),
  idempotencyKey: IdempotencyKeySchema.optional(),
});

export const QuestionnaireCompleteSchema = z.object({
  patientId: z.string().min(1),
  questionnaireId: z.string().min(1),
  idempotencyKey: IdempotencyKeySchema.optional(),
});

export const PaginationCursorSchema = z.object({
  cursor: z.string().optional(), // base64 encoded 'assignedAt|docId'
  limit: z.number().int().positive().max(100).default(50),
});

export type QuestionnaireStatus = z.infer<typeof QuestionnaireStatusEnum>;
export type QuestionnaireSubmitInput = z.infer<typeof QuestionnaireSubmitSchema>;
export type QuestionnaireCompleteInput = z.infer<typeof QuestionnaireCompleteSchema>;
export type PaginationCursorInput = z.infer<typeof PaginationCursorSchema>;

export function encodeCursor(assignedAt: string | null, docId: string): string | null {
  if (!assignedAt) return null;
  return Buffer.from(`${assignedAt}|${docId}`, 'utf-8').toString('base64');
}

export function decodeCursor(cursor: string): { assignedAt: Date; docId: string } | null {
  try {
    const raw = Buffer.from(cursor, 'base64').toString('utf-8');
    const [assignedAtIso, docId] = raw.split('|');
    if (!assignedAtIso || !docId) return null;
    return { assignedAt: new Date(assignedAtIso), docId };
  } catch {
    return null;
  }
}

// Simple idempotency key normalization
export function normalizeIdempotencyKey(raw: string | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed.length < 8 || trimmed.length > 128) return null;
  return trimmed;
}

// Standard API response envelope
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
