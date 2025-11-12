import { NextFunction, Request, Response } from 'express';
import * as logger from 'firebase-functions/logger';

export function logRequests(req: Request & { id?: string }, res: Response, next: NextFunction) {
  const start = Date.now();
  const id = req.id;
  logger.info('HTTP request start', { id, method: req.method, path: req.path });
  res.on('finish', () => {
    const durationMs = Date.now() - start;
    logger.info('HTTP request end', {
      id,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs,
    });
  });
  next();
}
