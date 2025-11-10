/**
 * Hook pour récupérer les questionnaires d'un patient spécifique
 * Utilise l'API HTTP au lieu de Firestore direct
 */

import api from '@/services/api';
import type { Questionnaire } from '@/services/api';
import { useEffect, useState } from 'react';

export type PatientQuestionnaire = Questionnaire;

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
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error('[usePatientQuestionnaires] Error:', errorMessage);
        if (isMounted) {
          setError(errorMessage);
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
