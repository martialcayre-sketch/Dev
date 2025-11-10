import { NextFunction, Request, Response } from 'express';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';

export interface AuthenticatedRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

/**
 * Middleware to verify Firebase Auth token from Authorization header
 */
export const verifyAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      res.status(401).json({ error: 'Unauthorized: Invalid token format' });
      return;
    }

    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;

    next();
  } catch (error: any) {
    logger.error('[Auth Middleware] Token verification failed:', error);

    if (error.code === 'auth/id-token-expired') {
      res.status(401).json({ error: 'Unauthorized: Token expired' });
      return;
    }

    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

/**
 * Middleware to verify user has practitioner role
 */
export const requirePractitioner = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized: No user context' });
    return;
  }

  const customClaims = req.user;

  if (!customClaims.practitioner && !customClaims.admin) {
    res.status(403).json({ error: 'Forbidden: Practitioner role required' });
    return;
  }

  next();
};

/**
 * Middleware to verify user is accessing their own data or is a practitioner
 */
export const requireOwnerOrPractitioner = (paramName: string = 'patientId') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: No user context' });
    }

    const resourceOwnerId = req.params[paramName];
    const userId = req.user.uid;

    // Allow if user is accessing their own resource
    if (userId === resourceOwnerId) {
      return next();
    }

    // Allow if user is a practitioner or admin
    if (req.user.practitioner || req.user.admin) {
      return next();
    }

    return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
  };
};
