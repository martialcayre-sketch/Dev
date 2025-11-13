import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import api from '@/services/api';
import type { Timestamp } from 'firebase/firestore';
import { useEffect, useMemo, useRef, useState } from 'react';

export type PatientQuestionnaire = {
  id: string;
  title: string;
  category?: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'completed' | 'reopened';
  assignedAt?: Timestamp | null;
  completedAt?: Timestamp | null;
  submittedAt?: Timestamp | null;
};

export function usePatientQuestionnaires() {
  const { user, loading: userLoading } = useFirebaseUser();
  const [items, setItems] = useState<PatientQuestionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stable ref to avoid redefining functions in event listeners
  const fetchRef = useRef<() => Promise<void>>();
  const isFetchingRef = useRef(false); // Prevent concurrent requests

  useEffect(() => {
    let isMounted = true;

    fetchRef.current = async () => {
      if (!user || isFetchingRef.current) {
        if (!user && isMounted) {
          setItems([]);
          setLoading(false);
        }
        return;
      }

      isFetchingRef.current = true;

      try {
        setError(null);
        console.log('[usePatientQuestionnaires] Fetching questionnaires for user:', user.uid);
        const response = await api.getPatientQuestionnaires(user.uid);
        console.log('[usePatientQuestionnaires] API Response:', response);
        if (!isMounted) return;
        const questionnaires = response.questionnaires || [];
        console.log('[usePatientQuestionnaires] Questionnaires count:', questionnaires.length);
        setItems(questionnaires as PatientQuestionnaire[]);
        setLoading(false);
      } catch (e) {
        if (!isMounted) return;
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error('[usePatientQuestionnaires] Error:', errorMessage, e);
        setError(errorMessage);
        setLoading(false);
      } finally {
        isFetchingRef.current = false;
      }
    };

    if (!userLoading) {
      // Initial fetch with loading state only the first time
      setLoading(true);
      fetchRef.current();

      // Poll every 30s instead of 15s to reduce server load
      const pollInterval = setInterval(() => {
        fetchRef.current && fetchRef.current();
      }, 30000);

      // Refetch on window focus & visibility change (for email link open)
      const onFocus = () => {
        fetchRef.current && fetchRef.current();
      };
      const onVisibility = () => {
        if (document.visibilityState === 'visible') {
          fetchRef.current && fetchRef.current();
        }
      };
      window.addEventListener('focus', onFocus);
      document.addEventListener('visibilitychange', onVisibility);

      return () => {
        isMounted = false;
        clearInterval(pollInterval);
        window.removeEventListener('focus', onFocus);
        document.removeEventListener('visibilitychange', onVisibility);
      };
    }
  }, [user, userLoading]);

  const counts = useMemo(() => {
    const pending = items.filter(
      (i) => i.status === 'pending' || i.status === 'in_progress' || i.status === 'reopened'
    ).length;
    const completed = items.filter((i) => i.status === 'completed').length;
    const submitted = items.filter((i) => i.status === 'submitted').length;
    return { pending, completed, submitted, total: items.length };
  }, [items]);

  return { items, loading: loading || userLoading, error, counts };
}
