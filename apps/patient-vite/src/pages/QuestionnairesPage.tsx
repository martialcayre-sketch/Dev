import { DashboardShell } from '@/components/layout/DashboardShell';
import { usePatientQuestionnaires } from '@/hooks/usePatientQuestionnaires';
import { Link } from 'react-router-dom';

export default function QuestionnairesPage() {
  const { items, loading, error, counts } = usePatientQuestionnaires();

  return (
    <DashboardShell>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Vos questionnaires</h2>
          <p className="text-sm text-white/60">
            {counts.pending} à compléter • {counts.completed} complétés
          </p>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <p className="text-white/80">Chargement…</p>
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-200 backdrop-blur-sm">
          <p>Erreur: {error}</p>
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <p className="text-white/80">Vous n'avez aucun questionnaire assigné pour le moment.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((q) => (
          <Link
            to={`/dashboard/questionnaires/${q.id}`}
            key={q.id}
            className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-nn-primary-500/30 hover:bg-white/10 hover:shadow-lg hover:shadow-nn-primary-500/10"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{q.title}</h3>
              <span
                className={
                  'rounded-xl px-2 py-1 text-xs font-medium ' +
                  (q.status === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : q.status === 'in_progress'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-nn-primary-500/20 text-nn-primary-300')
                }
              >
                {q.status === 'completed'
                  ? 'Complété'
                  : q.status === 'in_progress'
                    ? 'En cours'
                    : 'À compléter'}
              </span>
            </div>
            {q.description && <p className="text-sm text-white/60">{q.description}</p>}
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
