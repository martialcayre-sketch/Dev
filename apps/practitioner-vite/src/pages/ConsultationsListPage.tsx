import { DashboardShell } from '@/components/layout/DashboardShell';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { firestore } from '@/lib/firebase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { collection, getDocs, limit, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { CalendarClock, CalendarPlus, Loader2, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

type Consultation = {
  id: string;
  patientId: string;
  patientName: string;
  scheduledAt: Date;
  status: string;
  createdAt?: Date;
  notes?: string;
};

export default function ConsultationsListPage() {
  const { user } = useFirebaseUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  useEffect(() => {
    let active = true;
    async function load() {
      if (!user?.uid) return;
      setLoading(true);
      setError(null);
      try {
        const base = [
          where('practitionerId', '==', user.uid),
          orderBy('scheduledAt', 'desc'),
          limit(200),
        ] as const;

        let q = query(collection(firestore, 'consultations'), ...base);
        const snap = await getDocs(q);
        if (!active) return;
        const rows: Consultation[] = snap.docs.map((doc) => {
          const data = doc.data() as any;
          return {
            id: doc.id,
            patientId: (data.patientId as string) ?? '',
            patientName: (data.patientName as string) ?? 'Patient',
            scheduledAt: (data.scheduledAt as Timestamp | undefined)?.toDate?.() ?? new Date(),
            status: (data.status as string) ?? 'planifiée',
            createdAt: (data.createdAt as Timestamp | undefined)?.toDate?.(),
            notes: (data.notes as string | undefined) ?? undefined,
          };
        });
        setConsultations(rows);
      } catch (err: any) {
        console.error('Erreur chargement consultations', err);
        setError(err?.message || 'Erreur inconnue');
      } finally {
        active && setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [user?.uid]);

  const filtered = useMemo(() => {
    let list = consultations;
    const now = new Date();
    if (scope === 'upcoming') {
      list = list.filter((c) => c.scheduledAt >= now && c.status !== 'cancelled');
    } else if (scope === 'past') {
      list = list.filter((c) => c.scheduledAt < now);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.patientName.toLowerCase().includes(q) ||
          format(c.scheduledAt, 'dd/MM/yyyy HH:mm', { locale: fr }).toLowerCase().includes(q)
      );
    }
    return list;
  }, [consultations, search, scope]);

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
            <CalendarClock className="h-7 w-7 text-nn-primary-300" /> Consultations
          </h1>
          <Link
            to="/consultations/create"
            className="inline-flex items-center gap-2 rounded-xl border border-nn-primary-400/30 bg-nn-primary-500/15 px-4 py-2 text-sm font-semibold text-nn-primary-100 hover:border-nn-primary-400 hover:bg-nn-primary-500/25"
          >
            <CalendarPlus className="h-4 w-4" /> Planifier
          </Link>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1 text-xs font-semibold text-white/70">
              {(
                [
                  { key: 'upcoming', label: 'À venir' },
                  { key: 'past', label: 'Passées' },
                  { key: 'all', label: 'Toutes' },
                ] as const
              ).map((o) => (
                <button
                  key={o.key}
                  onClick={() => setScope(o.key)}
                  className={
                    'rounded-lg px-3 py-1.5 transition ' +
                    (scope === o.key
                      ? 'bg-nn-primary-500/20 text-nn-primary-100'
                      : 'hover:bg-white/5')
                  }
                >
                  {o.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-white/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher (nom, date)"
                className="w-full rounded-lg border border-white/10 bg-slate-950/60 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:border-nn-primary-400 focus:outline-none"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-white/70">
              <Loader2 className="h-5 w-5 animate-spin" /> Chargement…
            </div>
          ) : error ? (
            <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-between rounded-lg border border-dashed border-white/10 bg-white/5 px-4 py-6 text-white/60">
              <p>Aucune consultation trouvée dans ce filtre.</p>
              <button
                onClick={() => navigate('/consultations/create')}
                className="rounded-lg bg-nn-primary-500/20 px-3 py-1 text-xs font-semibold text-nn-primary-200"
              >
                Planifier
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-white/10 text-sm text-white/80">
              {filtered.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => navigate(`/consultations/${c.id}`)}
                    className="group flex w-full items-center justify-between gap-4 px-2 py-3 text-left hover:bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-nn-primary-100">
                        <CalendarClock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{c.patientName}</p>
                        <p className="text-xs text-white/60">
                          {format(c.scheduledAt, 'EEEE d MMMM • HH:mm', { locale: fr })}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-white/40 group-hover:text-white/70">
                      {c.status}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
