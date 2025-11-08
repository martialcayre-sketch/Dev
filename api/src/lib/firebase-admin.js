/**
 * Firebase Admin SDK initialization
 * Uses Application Default Credentials (ADC) when deployed to Cloud Run
 * Falls back to service account key in development
 */

import admin from 'firebase-admin';

if (!admin.apps.length) {
  // Cloud Run automatically provides credentials via ADC
  // In development, set GOOGLE_APPLICATION_CREDENTIALS env var
  admin.initializeApp({
    projectId: process.env.GOOGLE_CLOUD_PROJECT || 'neuronutrition-app',
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
export { admin };
