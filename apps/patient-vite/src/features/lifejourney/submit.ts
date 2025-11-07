import type { LifeJourneyResult } from '@/components/SIIN/LifeJourney7Spheres';
import { auth, firestore } from '@/lib/firebase';
import api from '@/services/api';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { saveLifeJourneySurvey } from './persistence';

/**
 * Persiste le résultat Mode de vie dans Firestore et le soumet au praticien.
 * Sauvegarde dans users/{uid}/surveys ET patients/{uid}/lifejourney/{id}
 * Retourne l'id du document créé/mis à jour.
 */
export async function submitLifeJourney(result: LifeJourneyResult, opts?: { id?: string }) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  // 1) Aplanir les réponses pour l'API backend standard (clé "sphere.question")
  const responses: Record<string, number> = {};
  for (const [sphere, qMap] of Object.entries(result.answers)) {
    for (const [qid, val] of Object.entries(qMap as Record<string, number>)) {
      responses[`${sphere}.${qid}`] = Number(val);
    }
  }
  for (const [sphere, sc] of Object.entries(result.scores)) {
    responses[`score.${sphere}`] = sc.percent;
  }
  responses['score.global'] = result.global;

  // 2) Persister via l'API HTTP (auto-save + submit)
  try {
    await api.saveQuestionnaireResponses(user.uid, 'life-journey', responses);
    await api.submitQuestionnaire(user.uid, 'life-journey');
  } catch (e) {
    console.warn('[LifeJourney] HTTP API save/submit failed, continuing with legacy writes:', e);
  }

  // 3) Conserver les écritures historiques pour analytics (users/{uid}/surveys et patients/{uid}/lifejourney)
  const { id } = await saveLifeJourneySurvey(user.uid, result, opts?.id);

  const patientRef = doc(firestore, 'patients', user.uid);
  const patientSnap = await getDoc(patientRef);
  const practitionerId = patientSnap.exists() ? (patientSnap.data() as any)?.practitionerId : null;

  const lifejourneyRef = doc(firestore, 'patients', user.uid, 'lifejourney', id);
  await setDoc(lifejourneyRef, {
    ...result,
    patientUid: user.uid,
    practitionerId,
    type: 'lifejourney-v1',
    submittedAt: serverTimestamp(),
    createdAt: result.completedAt ? new Date(result.completedAt) : serverTimestamp(),
  });

  return { id, payload: result };
}
