import type { QuestionnaireStatus } from '@neuronutrition/shared-questionnaires';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useState } from 'react';

interface Props {
  patientId: string;
  questionnaireId: string;
  currentStatus: QuestionnaireStatus;
  onStatusChanged?: () => void;
}

/**
 * Contrôles praticien pour verrouiller/rouvrir un questionnaire
 */
export function QuestionnaireStatusSwitch({
  patientId,
  questionnaireId,
  currentStatus,
  onStatusChanged,
}: Props) {
  const [working, setWorking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const lock = async () => {
    try {
      setWorking(true);
      setError(null);
      const fn = httpsCallable(getFunctions(), 'setQuestionnaireStatus');
      await fn({ patientId, questionnaireId, status: 'completed' });
      console.log('[QuestionnaireStatusSwitch] Locked -> completed');
      onStatusChanged?.();
    } catch (err: any) {
      console.error('[QuestionnaireStatusSwitch] Error locking:', err);
      setError(err?.message || 'Erreur inconnue');
    } finally {
      setWorking(false);
    }
  };

  const reopen = async () => {
    try {
      setWorking(true);
      setError(null);
      const fn = httpsCallable(getFunctions(), 'setQuestionnaireStatus');
      await fn({ patientId, questionnaireId, status: 'reopened' });
      console.log('[QuestionnaireStatusSwitch] Reopened');
      onStatusChanged?.();
    } catch (err: any) {
      console.error('[QuestionnaireStatusSwitch] Error reopening:', err);
      setError(err?.message || 'Erreur inconnue');
    } finally {
      setWorking(false);
    }
  };

  const isCompleted = currentStatus === 'completed';
  const isSubmitted = currentStatus === 'submitted';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <span className="text-xs text-white/70">
          Statut :{' '}
          <span className="font-medium text-white">
            {currentStatus === 'pending'
              ? 'En attente'
              : currentStatus === 'in_progress'
                ? 'En cours'
                : currentStatus === 'submitted'
                  ? 'Soumis'
                  : currentStatus === 'completed'
                    ? 'Validé'
                    : currentStatus === 'reopened'
                      ? 'Rouvert'
                      : currentStatus}
          </span>
        </span>
        {isCompleted ? (
          <button
            onClick={reopen}
            disabled={working}
            className="rounded-lg bg-amber-500/20 px-3 py-1 text-xs text-amber-300 hover:bg-amber-500/30 disabled:opacity-50"
          >
            {working ? 'Traitement…' : 'Rouvrir pour le patient'}
          </button>
        ) : (
          <button
            onClick={lock}
            disabled={working || (!isSubmitted && currentStatus !== 'reopened')}
            className="rounded-lg bg-emerald-500/20 px-3 py-1 text-xs text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-50"
            title={
              !isSubmitted && currentStatus !== 'reopened'
                ? 'Le patient doit soumettre le questionnaire avant validation'
                : ''
            }
          >
            {working ? 'Traitement…' : 'Verrouiller (valider)'}
          </button>
        )}
      </div>
      {error && <div className="text-xs text-rose-400">{error}</div>}
    </div>
  );
}
