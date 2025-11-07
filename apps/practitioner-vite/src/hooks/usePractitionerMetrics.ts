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
        console.log('[usePractitionerMetrics] Loading metrics for practitioner:', practitionerId);

        const patientsQuery = query(
          collection(firestore, 'patients'),
          where('practitionerId', '==', practitionerId)
        );
        const patientsSnapshot = await getDocs(patientsQuery);

        console.log('[usePractitionerMetrics] Total patients found:', patientsSnapshot.size);

        // Compter les patients nécessitant attention (ceux avec des questionnaires pending)
        let patientsNeedingAttention = 0;
        for (const patientDoc of patientsSnapshot.docs) {
          const patientData = patientDoc.data();
          if (
            patientData.pendingQuestionnairesCount &&
            patientData.pendingQuestionnairesCount > 0
          ) {
            patientsNeedingAttention++;
          }
        }

        // Pour les consultations, on essaie mais on ignore les erreurs de permission
        let upcomingConsultations: any[] = [];
        try {
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
          upcomingConsultations = consultationsSnapshot.docs.map((doc) => {
            const data = doc.data() as any;
            return {
              id: doc.id,
              patientName: data.patientName ?? 'Patient',
              scheduledAt: (data.scheduledAt as Timestamp)?.toDate?.() ?? new Date(),
              status: data.status ?? 'planifiée',
            };
          });
        } catch (err) {
          console.warn(
            '[usePractitionerMetrics] Could not load consultations (permissions?):',
            err
          );
        }

        // Pour les évaluations, on essaie mais on ignore les erreurs de permission
        let latestAssessments: any[] = [];
        try {
          const assessmentsQuery = query(
            collection(firestore, 'questionnaireSubmissions'),
            where('practitionerId', '==', practitionerId),
            orderBy('submittedAt', 'desc'),
            limit(5)
          );
          const assessmentsSnapshot = await getDocs(assessmentsQuery);
          latestAssessments = assessmentsSnapshot.docs.map((doc) => {
            const data = doc.data() as any;
            return {
              id: doc.id,
              patientName: data.patientName ?? 'Patient',
              questionnaire: data.questionnaire ?? '',
              submittedAt: (data.submittedAt as Timestamp)?.toDate?.() ?? new Date(),
              score: data.score,
            };
          });
        } catch (err) {
          console.warn('[usePractitionerMetrics] Could not load assessments (permissions?):', err);
        }

        if (cancelled) return;

        setMetrics({
          totalPatients: patientsSnapshot.size,
          patientsNeedingAttention: patientsNeedingAttention,
          upcomingConsultations: upcomingConsultations,
          latestAssessments: latestAssessments,
        });
      } catch (error) {
        console.error('[usePractitionerMetrics] Erreur de chargement des métriques', error);
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
