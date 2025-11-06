import type { LifeJourneyResult } from '@/components/SIIN/LifeJourney7Spheres';
import { auth, firestore } from '@/lib/firebase';
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

  // Sauvegarder dans users/{uid}/surveys
  const { id } = await saveLifeJourneySurvey(user.uid, result, opts?.id);

  // Récupérer le practitionerId du patient
  const patientRef = doc(firestore, 'patients', user.uid);
  const patientSnap = await getDoc(patientRef);
  const practitionerId = patientSnap.exists() ? patientSnap.data()?.practitionerId : null;

  // Sauvegarder aussi dans patients/{uid}/lifejourney/{id} pour le praticien
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
