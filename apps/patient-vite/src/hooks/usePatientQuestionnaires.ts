import { auth, firestore } from '@/lib/firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';

export type PatientQuestionnaire = {
  id: string;
  title: string;
  category?: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignedAt?: any;
  completedAt?: any;
};

export function usePatientQuestionnaires() {
  const [items, setItems] = useState<PatientQuestionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    try {
      const ref = collection(firestore, 'patients', user.uid, 'questionnaires');
      const q = query(ref, orderBy('assignedAt', 'desc'));
      const unsub = onSnapshot(
        q,
        (snap) => {
          const list: PatientQuestionnaire[] = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any),
          }));
          setItems(list);
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
  }, []);

  const counts = useMemo(() => {
    const pending = items.filter((i) => i.status !== 'completed').length;
    const completed = items.filter((i) => i.status === 'completed').length;
    return { pending, completed, total: items.length };
  }, [items]);

  return { items, loading, error, counts };
}
