import { DashboardShell } from '@/components/layout/DashboardShell';
import { firestore } from '@/lib/firebase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { doc, getDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { CalendarClock, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

type Consultation = {
  id: string;
  patientId: string;
  patientName: string;
  scheduledAt: Date;
  status: string;
  notes?: string;
};

export default function ConsultationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [c, setC] = useState<Consultation | null>(null);
  const [saving, setSaving] = useState<'complete' | 'cancel' | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const ref = doc(firestore, 'consultations', id);
        const snap = await getDoc(ref);
        if (!active) return;
        if (!snap.exists()) {
          setError("Cette consultation n'existe pas (ou a été supprimée).");
          setC(null);
          return;
        }
        const data = snap.data() as any;
        setC({
          id: snap.id,
          patientId: (data.patientId as string) ?? '',
          patientName: (data.patientName as string) ?? 'Patient',
          scheduledAt: (data.scheduledAt as Timestamp | undefined)?.toDate?.() ?? new Date(),
          status: (data.status as string) ?? 'planifiée',
          notes: (data.notes as string | undefined) ?? undefined,
        });
      } catch (e: any) {
        console.error('Erreur chargement consultation', e);
        setError(e?.message || 'Erreur inconnue');
      } finally {
        active && setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id]);

  async function updateStatus(next: 'completed' | 'cancelled') {
    if (!id) return;
    setSaving(next === 'completed' ? 'complete' : 'cancel');
    setError(null);
    try {
      const ref = doc(firestore, 'consultations', id);
      await updateDoc(ref, { status: next });
      setC((prev) => (prev ? { ...prev, status: next } : prev));
    } catch (e: any) {
      console.error('Maj statut consultation', e);
      setError(e?.message || 'Erreur inconnue');
    } finally {
      setSaving(null);
    }
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
            <CalendarClock className="h-7 w-7 text-nn-primary-300" /> Consultation
          </h1>
          <Link
            to="/consultations"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            Retour à la liste
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-8 text-white/70">
            <Loader2 className="h-5 w-5 animate-spin" /> Chargement…
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-6 text-rose-200">
            {error}
          </div>
        ) : !c ? null : (
          <div className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-white/60">Patient</p>
                <p className="text-lg font-semibold text-white">{c.patientName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/60">Quand</p>
                <p className="text-lg font-semibold text-white">
                  {format(c.scheduledAt, 'EEEE d MMMM • HH:mm', { locale: fr })}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/70">
                Statut : {c.status}
              </span>

              <button
                onClick={() => updateStatus('completed')}
                disabled={saving !== null}
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:border-emerald-400 disabled:opacity-60"
              >
                {saving === 'complete' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Marquer comme effectuée
              </button>

              <button
                onClick={() => updateStatus('cancelled')}
                disabled={saving !== null}
                className="inline-flex items-center gap-2 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 hover:border-rose-400 disabled:opacity-60"
              >
                {saving === 'cancel' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Annuler
              </button>
            </div>

            {c.notes ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-widest text-white/60">
                  Notes
                </p>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                  {c.notes}
                </div>
              </div>
            ) : null}

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                Retour
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
