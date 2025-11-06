import { firestore } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export interface PatientProfile {
  hasIdentification: boolean;
  hasAnamnese: boolean;
  completedQuestionnairesCount: number;
  pendingQuestionnairesCount: number;
  totalQuestionnairesCount: number;
  canRequestConsultation: boolean;
}

export function usePatientProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<PatientProfile>({
    hasIdentification: false,
    hasAnamnese: false,
    completedQuestionnairesCount: 0,
    pendingQuestionnairesCount: 0,
    totalQuestionnairesCount: 0,
    canRequestConsultation: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        // Vérifier l'existence de la fiche identification
        const identificationDoc = await getDoc(
          doc(firestore, 'patients', userId, 'consultation', 'identification')
        );
        const hasIdentification = identificationDoc.exists();

        // Vérifier l'existence de la fiche anamnèse
        const anamneseDoc = await getDoc(
          doc(firestore, 'patients', userId, 'consultation', 'anamnese')
        );
        const hasAnamnese = anamneseDoc.exists();

        // Compter les questionnaires
        const questionnairesRef = collection(firestore, 'patients', userId, 'questionnaires');

        const completedQuery = query(questionnairesRef, where('status', '==', 'completed'));
        const completedSnap = await getDocs(completedQuery);
        const completedCount = completedSnap.size;

        const pendingQuery = query(questionnairesRef, where('status', '==', 'pending'));
        const pendingSnap = await getDocs(pendingQuery);
        const pendingCount = pendingSnap.size;

        const totalCount = completedCount + pendingCount;

        // Vérifier si le patient peut demander une consultation
        // Conditions: identification + anamnèse + 4 questionnaires complétés
        const canRequestConsultation = hasIdentification && hasAnamnese && completedCount >= 4;

        setProfile({
          hasIdentification,
          hasAnamnese,
          completedQuestionnairesCount: completedCount,
          pendingQuestionnairesCount: pendingCount,
          totalQuestionnairesCount: totalCount,
          canRequestConsultation,
        });
      } catch (error) {
        console.error('[usePatientProfile] Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  return { profile, loading };
}
