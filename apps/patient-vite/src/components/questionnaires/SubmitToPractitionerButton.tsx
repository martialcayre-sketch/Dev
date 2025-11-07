import type { QuestionnaireStatus } from '@neuronutrition/shared-questionnaires';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useMemo, useState } from 'react';

interface Props {
  patientId: string;
  questionnaireId: string;
  /** Statut courant du questionnaire (contrôle l'état du bouton) */
  status: QuestionnaireStatus;
  /** Désactive explicitement (ex: permission externe) */
  disabled?: boolean;
  onSuccess?: () => void;
}

/**
 * Bouton pour soumettre un questionnaire au praticien
 * Appelle la Cloud Function submitQuestionnaire
 */
export default function SubmitToPractitionerButton({
  patientId,
  questionnaireId,
  status,
  disabled,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Détermination de l'état du bouton en fonction du statut
  const state = useMemo(() => {
    switch (status) {
      case 'pending':
      case 'in_progress':
      case 'reopened':
        return { actionable: true, label: 'Soumettre au praticien', help: null };
      case 'submitted':
        return { actionable: false, label: 'Déjà soumis', help: 'En attente du praticien' };
      case 'completed':
        return {
          actionable: false,
          label: 'Validé',
          help: 'Questionnaire validé par le praticien',
        };
      default:
        return { actionable: false, label: 'Indisponible', help: 'Statut inconnu' };
    }
  }, [status]);

  const onSubmit = async () => {
    if (!state.actionable || loading) return;
    setLoading(true);
    setErr(null);
    try {
      const fn = httpsCallable(getFunctions(), 'submitQuestionnaire');
      await fn({ patientId, questionnaireId });
      setOk(true);
      onSuccess?.();
    } catch (e: any) {
      setErr(e?.message ?? 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onSubmit}
        disabled={loading || disabled || !state.actionable}
        className={`rounded-xl px-4 py-2 text-sm font-medium transition min-w-[190px] text-center ${
          loading || disabled || !state.actionable
            ? 'cursor-not-allowed bg-white/10 text-white/40'
            : 'bg-nn-primary-500 text-white hover:bg-nn-primary-500/90'
        }`}
      >
        {loading ? 'Soumission…' : ok && state.actionable ? 'Soumis' : state.label}
      </button>
      <div className="flex flex-col gap-1">
        {ok && <span className="text-xs text-emerald-300">✅ Envoyé au praticien</span>}
        {err && <span className="text-xs text-rose-400">{err}</span>}
        {!ok && state.help && !err && <span className="text-xs text-white/50">{state.help}</span>}
      </div>
    </div>
  );
}
