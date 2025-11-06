import type { PractitionerMetricState } from '@/hooks/usePractitionerMetrics';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowUpRight, CalendarClock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function UpcomingConsultations({
  consultations,
}: {
  consultations: PractitionerMetricState['upcomingConsultations'];
}) {
  const navigate = useNavigate();

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-white/60">
            Aujourd'hui & demain
          </p>
          <h2 className="text-xl font-semibold text-white">Consultations à venir</h2>
        </div>
        <button
          onClick={() => navigate('/consultations')}
          className="inline-flex items-center gap-2 text-sm font-medium text-nn-accent-300 hover:text-nn-accent-100"
        >
          Voir toutes
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {consultations.length === 0 ? (
          <div className="flex items-center justify-between rounded-xl border border-dashed border-white/10 bg-white/5 px-4 py-5 text-white/60">
            <p>Aucune consultation programmée dans les prochaines 48h.</p>
            <button
              onClick={() => navigate('/consultations/create')}
              className="rounded-lg bg-nn-primary-500/20 px-3 py-1 text-xs font-semibold text-nn-primary-200"
            >
              Planifier
            </button>
          </div>
        ) : (
          consultations.map((consultation) => (
            <button
              key={consultation.id}
              onClick={() => navigate(`/consultations/${consultation.id}`)}
              className="group flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-left transition hover:border-nn-primary-500/40 hover:bg-nn-primary-500/10"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-nn-primary-100">
                  <CalendarClock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{consultation.patientName}</p>
                  <p className="text-xs text-white/60">
                    {format(consultation.scheduledAt, 'EEEE d MMMM • HH:mm', { locale: fr })}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-white/40 group-hover:text-white/70">
                {consultation.status}
              </span>
            </button>
          ))
        )}
      </div>
    </section>
  );
}
