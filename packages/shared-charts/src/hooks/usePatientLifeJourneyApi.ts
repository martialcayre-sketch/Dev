import { getApiClient, type LifeJourneyData } from '@neuronutrition/shared-api';
import { useEffect, useState } from 'react';

/**
 * Hook to fetch patient Life Journey data from REST API
 * @param patientId - The patient's ID
 * @param options - Optional configuration
 * @returns { data, loading, error, refetch }
 */
export function usePatientLifeJourneyApi(
  patientId: string,
  options: { enabled?: boolean; pollInterval?: number } = {}
) {
  const { enabled = true, pollInterval } = options;
  const [data, setData] = useState<LifeJourneyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!patientId) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const apiClient = getApiClient();
      const response = await apiClient.getPatientLifeJourney(patientId);

      if (response.error) {
        setError(response.error);
        setData(null);
      } else {
        setData(response.data || null);
        setError(null);
      }
    } catch (err: any) {
      setError(err?.message || String(err));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    fetchData();

    // Optional polling
    if (pollInterval && pollInterval > 0) {
      const intervalId = setInterval(fetchData, pollInterval);
      return () => clearInterval(intervalId);
    }
  }, [patientId, enabled, pollInterval]);

  return { data, loading, error, refetch: fetchData };
}
