/**
 * Hook pour récupérer les questionnaires d'un patient spécifique
 * Utilise l'API HTTP au lieu de Firestore direct
 */

import api from '@/services/api';
import { useEffect, useState } from 'react';

export interface PatientQuestionnaire {
  id: string;
  title: string;
  category?: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'completed' | 'reopened';
  assignedAt?: any;
  completedAt?: any;
  submittedAt?: any;
  patientUid: string;
  practitionerId?: string;
  responses?: Record<string, any>;
}

export function usePatientQuestionnaires(patientId: string | undefined) {
  const [questionnaires, setQuestionnaires] = useState<PatientQuestionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchQuestionnaires() {
      if (!patientId) {
        setQuestionnaires([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch patient questionnaires via HTTP API
        const response = await api.getPatientQuestionnaires(patientId);

        if (isMounted) {
          setQuestionnaires(response.questionnaires || []);
          setLoading(false);
        }
      } catch (e: any) {
        console.error('[usePatientQuestionnaires] Error:', e);
        if (isMounted) {
          setError(e?.message || String(e));
          setLoading(false);
        }
      }
    }

    fetchQuestionnaires();

    // Poll every 15 seconds for updates
    const pollInterval = setInterval(fetchQuestionnaires, 15000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [patientId]);

  return { questionnaires, loading, error };
}
