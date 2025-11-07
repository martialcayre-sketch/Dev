import { useAutosave } from '@/hooks/useAutosave';
import api from '@/services/api';
import type { QuestionnaireDoc, QuestionnaireStatus } from '@neuronutrition/shared-questionnaires';
import React, { useEffect, useState } from 'react';

interface EditableQuestionnaireProps {
  patientId: string;
  questionnaireId: string;
  children: (props: QuestionnaireChildProps) => React.ReactNode;
}

export interface QuestionnaireChildProps {
  responses: Record<string, number | string>;
  onChange: (key: string, value: number | string) => void;
  canEdit: boolean;
  saving: boolean;
  status: QuestionnaireStatus;
}

/**
 * Composant wrapper pour gérer l'état et l'autosave d'un questionnaire
 * Utilise l'API HTTP au lieu de Firestore directement
 */
export default function EditableQuestionnaire({
  patientId,
  questionnaireId,
  children,
}: EditableQuestionnaireProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [docData, setDocData] = useState<QuestionnaireDoc | null>(null);
  const [localResponses, setLocalResponses] = useState<Record<string, number | string>>({});
  const [saving, setSaving] = useState<boolean>(false);

  const canEdit = docData?.status !== 'completed' && docData?.status !== 'submitted';

  // 1) Load questionnaire data from API
  useEffect(() => {
    (async () => {
      try {
        console.log('[EditableQuestionnaire] Loading via API:', patientId, questionnaireId);
        const response = await api.getQuestionnaireDetail(patientId, questionnaireId);

        if (!response) {
          setError('Questionnaire introuvable');
          setLoading(false);
          return;
        }

        const data = response as any;
        const normalized: QuestionnaireDoc = {
          id: questionnaireId,
          title: data.title ?? 'Questionnaire',
          status: data.status ?? 'in_progress',
          responses: data.responses ?? {},
          assignedAt: data.assignedAt
            ? new Date(data.assignedAt?.toDate?.() ?? data.assignedAt)
            : undefined,
          updatedAt: data.updatedAt
            ? new Date(data.updatedAt?.toDate?.() ?? data.updatedAt)
            : undefined,
          submittedAt: data.submittedAt
            ? new Date(data.submittedAt?.toDate?.() ?? data.submittedAt)
            : null,
          completedAt: data.completedAt
            ? new Date(data.completedAt?.toDate?.() ?? data.completedAt)
            : null,
        };
        setDocData(normalized);
        setLocalResponses(normalized.responses);
        setLoading(false);
      } catch (err: unknown) {
        console.error('[EditableQuestionnaire] Load error:', err);
        setError('Erreur de chargement');
        setLoading(false);
      }
    })();
  }, [patientId, questionnaireId]);

  // 2) Autosave via API (1500ms debounce to match backend expectations)
  const { scheduleSave } = useAutosave<Record<string, number | string>>(async (payload) => {
    if (!canEdit) return;
    try {
      setSaving(true);
      await api.saveQuestionnaireResponses(patientId, questionnaireId, payload);
      console.log('[EditableQuestionnaire] Autosaved via API');

      // Update local status if transitioning from pending to in_progress
      if (docData?.status === 'pending') {
        setDocData({ ...docData, status: 'in_progress' });
      }
    } catch (err) {
      console.error('[EditableQuestionnaire] Autosave error:', err);
    } finally {
      setSaving(false);
    }
  }, 1500);

  const onChange = (key: string, value: number | string) => {
    if (!canEdit) return;
    const next = { ...localResponses, [key]: value };
    setLocalResponses(next);
    scheduleSave(next);
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-nn-primary-500"></div>
          <span className="ml-3 text-white/70">Chargement…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-500">
        {error}
      </div>
    );
  }

  if (!docData) return null;

  return (
    <>
      {children({
        responses: localResponses,
        onChange,
        canEdit,
        saving,
        status: docData.status,
      })}
    </>
  );
}
