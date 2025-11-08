import type { QuestionnaireStatus } from '@neuronutrition/shared-questionnaires';
import { AlertCircle, CheckCircle2, Clock, Edit3, Send } from 'lucide-react';

interface Props {
  status: QuestionnaireStatus;
  submittedAt?: Date | string | null;
  completedAt?: Date | string | null;
}

/**
 * Bannière de statut pour les questionnaires
 * Affiche un badge coloré selon le statut actuel
 */
export default function QuestionnaireStatusBanner({ status, submittedAt, completedAt }: Props) {
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return '';
      return new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(dateObj);
    } catch {
      return '';
    }
  };

  switch (status) {
    case 'pending':
      return (
        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-500/30 bg-slate-500/10 px-3 py-2 text-sm font-semibold text-slate-300">
          <Clock className="h-4 w-4" />
          En attente
        </div>
      );

    case 'in_progress':
      return (
        <div className="inline-flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm font-semibold text-blue-300">
          <Edit3 className="h-4 w-4" />
          En cours
        </div>
      );

    case 'reopened':
      return (
        <div className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-300">
          <AlertCircle className="h-4 w-4" />
          <div className="flex flex-col">
            <span>Rouvert pour modification</span>
            <span className="text-xs font-normal opacity-70">
              Le praticien a demandé des ajustements
            </span>
          </div>
        </div>
      );

    case 'submitted':
      return (
        <div className="inline-flex items-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-sm font-semibold text-sky-300">
          <Send className="h-4 w-4" />
          <div className="flex flex-col">
            <span>Soumis au praticien</span>
            {submittedAt && (
              <span className="text-xs font-normal opacity-70">{formatDate(submittedAt)}</span>
            )}
          </div>
        </div>
      );

    case 'completed':
      return (
        <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          <div className="flex flex-col">
            <span>Validé</span>
            {completedAt && (
              <span className="text-xs font-normal opacity-70">{formatDate(completedAt)}</span>
            )}
          </div>
        </div>
      );

    default:
      return null;
  }
}
