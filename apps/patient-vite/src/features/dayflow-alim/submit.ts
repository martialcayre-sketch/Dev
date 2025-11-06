import { auth } from '@/lib/firebase';
import { buildPayloadWithInterpretation } from './interpretation';
import { saveDayFlowSurvey } from './persistence';
import type { DayFlowPayload } from './types';

/**
 * Enrichit le payload avec l'interprétation IA, puis persiste dans Firestore.
 * Retourne le payload enrichi + l'id du document créé/mis à jour.
 */
export async function submitDayFlow(
  basePayload: DayFlowPayload,
  opts?: { id?: string; version?: string }
) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const payload = buildPayloadWithInterpretation({
    ...basePayload,
    version: opts?.version ?? basePayload.version ?? '1.0',
    meta: { ...basePayload.meta, context: 'patient' },
  });

  const { id } = await saveDayFlowSurvey(user.uid, payload, opts?.id);
  return { id, payload };
}
