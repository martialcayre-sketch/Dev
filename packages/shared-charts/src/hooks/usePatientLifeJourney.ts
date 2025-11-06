import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import type { LifeJourneyData } from '../types';

export function usePatientLifeJourney(firestore: any, patientId: string) {
  const [data, setData] = useState<LifeJourneyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      const ref = collection(firestore, 'patients', patientId, 'lifejourney');
      const q = query(ref, orderBy('submittedAt', 'desc'));

      const unsub = onSnapshot(
        q,
        (snap) => {
          if (snap.empty) {
            setData(null);
          } else {
            // Prendre le plus récent
            const doc = snap.docs[0];
            setData({ id: doc.id, ...doc.data() } as LifeJourneyData);
          }
          setLoading(false);
        },
        (err) => {
          setError(err.message || String(err));
          setLoading(false);
        }
      );

      return () => unsub();
    } catch (e: any) {
      setError(e?.message || String(e));
      setLoading(false);
    }
  }, [firestore, patientId]);

  return { data, loading, error };
}
