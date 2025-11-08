/**
 * Authentication Middleware
 * Vérifie le token Firebase dans les requêtes
 */

import { auth } from '../lib/firebase-admin.js';

/**
 * Middleware pour vérifier le token Firebase
 * Extrait le token du header Authorization: Bearer <token>
 * Vérifie le token avec Firebase Admin SDK
 * Ajoute req.user avec les infos de l'utilisateur
 */
export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Missing token' });
    }

    // Vérifier le token avec Firebase Admin
    const decodedToken = await auth.verifyIdToken(token);

    // Ajouter les infos utilisateur à la requête
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      ...decodedToken,
    };

    console.log(`[AUTH] Authenticated user: ${req.user.uid} (${req.user.email})`);

    next();
  } catch (error) {
    console.error('[AUTH] Token verification failed:', error.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Middleware pour vérifier que l'utilisateur est le patient
 * À utiliser après authenticateToken
 */
export function requirePatient(req, res, next) {
  const { patientId } = req.params;

  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.user.uid !== patientId) {
    console.warn(`[AUTH] User ${req.user.uid} tried to access patient ${patientId} data`);
    return res.status(403).json({ error: 'Access denied' });
  }

  next();
}

/**
 * Middleware pour vérifier que l'utilisateur est le praticien
 * À utiliser après authenticateToken
 */
export async function requirePractitioner(req, res, next) {
  const { practitionerId } = req.params;

  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.user.uid !== practitionerId) {
    console.warn(`[AUTH] User ${req.user.uid} tried to access practitioner ${practitionerId} data`);
    return res.status(403).json({ error: 'Access denied' });
  }

  next();
}

/**
 * Middleware pour vérifier que l'utilisateur est le patient OU son praticien
 * À utiliser après authenticateToken
 */
export async function requirePatientOrPractitioner(req, res, next) {
  const { patientId } = req.params;

  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Si c'est le patient lui-même, OK
  if (req.user.uid === patientId) {
    req.accessRole = 'patient';
    return next();
  }

  // Sinon, vérifier si c'est le praticien du patient
  try {
    const { db } = await import('../lib/firebase-admin.js');
    const patientDoc = await db.collection('patients').doc(patientId).get();

    if (!patientDoc.exists) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const patientData = patientDoc.data();

    if (patientData.practitionerId === req.user.uid) {
      req.accessRole = 'practitioner';
      return next();
    }

    console.warn(
      `[AUTH] User ${req.user.uid} tried to access patient ${patientId} data (not authorized)`
    );
    return res.status(403).json({ error: 'Access denied' });
  } catch (error) {
    console.error('[AUTH] Error checking practitioner access:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Middleware optionnel : log toutes les requêtes
 */
export function logRequest(req, res, next) {
  const user = req.user ? `${req.user.uid} (${req.user.email})` : 'anonymous';
  console.log(`[REQUEST] ${req.method} ${req.path} - User: ${user}`);
  next();
}
