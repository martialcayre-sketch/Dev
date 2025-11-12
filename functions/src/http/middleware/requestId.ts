import { NextFunction, Request, Response } from 'express';

export function requestId(req: Request & { id?: string }, res: Response, next: NextFunction) {
  // Prefer existing header, else generate
  const headerId = (req.headers['x-request-id'] as string) || '';
  const id = headerId && headerId.trim().length > 0 ? headerId : generateId();
  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
}

function generateId(): string {
  // Use crypto.randomUUID if available (Node 20+)
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { randomUUID } = require('node:crypto');
    if (typeof randomUUID === 'function') return randomUUID();
  } catch {}
  // Fallback basic unique id
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
