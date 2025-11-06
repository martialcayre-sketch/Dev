import { firestore } from '@/lib/firebase';
import { collection, getDocs, limit, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export interface PractitionerMetricState {
  totalPatients: number;
  patientsNeedingAttention: number;
  upcomingConsultations: Array<{
    id: string;
    patientName: string;
    scheduledAt: Date;
    status: string;
  }>;
  latestAssessments: Array<{
    id: string;
    patientName: string;
    questionnaire: string;
    submittedAt: Date;
    score?: number;
  }>;
}

const DEFAULT_STATE: PractitionerMetricState = {
  totalPatients: 0,
  patientsNeedingAttention: 0,
  upcomingConsultations: [],
  latestAssessments: [],
};

export function usePractitionerMetrics(practitionerId?: string | null) {
  const [metrics, setMetrics] = useState<PractitionerMetricState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!practitionerId) {
      setMetrics(DEFAULT_STATE);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const patientsQuery = query(
          collection(firestore, 'patients'),
          where('practitionerId', '==', practitionerId),
          where('hasQuestionnairesAssigned', '==', true)
        );
        const patientsSnapshot = await getDocs(patientsQuery);

        const attentionQuery = query(
          collection(firestore, 'alerts'),
          where('practitionerId', '==', practitionerId),
          where('status', '==', 'open')
        );
        const attentionSnapshot = await getDocs(attentionQuery);

        const consultationsQuery = query(
          collection(firestore, 'consultations'),
          where('practitionerId', '==', practitionerId),
          where(
            'scheduledAt',
            '>=',
            Timestamp.fromDate(new Date(Date.now() - 12 * 60 * 60 * 1000))
          ),
          orderBy('scheduledAt', 'asc'),
          limit(5)
        );
        const consultationsSnapshot = await getDocs(consultationsQuery);

        const assessmentsQuery = query(
          collection(firestore, 'questionnaireSubmissions'),
          where('practitionerId', '==', practitionerId),
          orderBy('submittedAt', 'desc'),
          limit(5)
        );
        const assessmentsSnapshot = await getDocs(assessmentsQuery);

        if (cancelled) return;

        setMetrics({
          totalPatients: patientsSnapshot.size,
          patientsNeedingAttention: attentionSnapshot.size,
          upcomingConsultations: consultationsSnapshot.docs.map((doc) => {
            const data = doc.data() as any;
            return {
              id: doc.id,
              patientName: data.patientName ?? 'Patient',
              scheduledAt: (data.scheduledAt as Timestamp)?.toDate?.() ?? new Date(),
              status: data.status ?? 'planifiée',
            };
          }),
          latestAssessments: assessmentsSnapshot.docs.map((doc) => {
            const data = doc.data() as any;
            return {
              id: doc.id,
              patientName: data.patientName ?? 'Patient',
              questionnaire: data.questionnaire ?? '',
              submittedAt: (data.submittedAt as Timestamp)?.toDate?.() ?? new Date(),
              score: data.score,
            };
          }),
        });
      } catch (error) {
        console.error('Erreur de chargement des métriques', error);
        if (!cancelled) setMetrics(DEFAULT_STATE);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [practitionerId]);

  return { metrics, loading };
}
