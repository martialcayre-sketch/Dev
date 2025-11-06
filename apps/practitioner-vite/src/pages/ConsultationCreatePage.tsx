import { DashboardShell } from '@/components/layout/DashboardShell';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { firestore } from '@/lib/firebase';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { CalendarPlus, Loader2, UserRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type PatientOption = { id: string; name: string; email: string };

export default function ConsultationCreatePage() {
  const { user } = useFirebaseUser();
  const navigate = useNavigate();

  const [loadingPatients, setLoadingPatients] = useState(true);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [patientId, setPatientId] = useState('');
  const [when, setWhen] = useState<string>(''); // ISO local datetime
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!user?.uid) return;
      setLoadingPatients(true);
      try {
        const q = query(
          collection(firestore, 'patients'),
          where('practitionerId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(200)
        );
        const snap = await getDocs(q);
        if (!active) return;
        const opts: PatientOption[] = snap.docs.map((d) => {
          const data = d.data() as any;
          const name =
            (data.fullName as string | undefined) ||
            `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim() ||
            (data.email as string | undefined) ||
            'Patient';
          return { id: d.id, name, email: (data.email as string) ?? '' };
        });
        setPatients(
          opts.filter((p) => {
            const raw = snap.docs.find((d) => d.id === p.id)!.data() as any;
            return !raw.archived;
          })
        );
      } catch (e) {
        console.error('Erreur chargement patients', e);
      } finally {
        active && setLoadingPatients(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [user?.uid]);

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === patientId) || null,
    [patients, patientId]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.uid) return;
    if (!patientId || !when) {
      setError('Sélectionnez un patient et une date.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const scheduledAt = Timestamp.fromDate(new Date(when));
      const payload = {
        practitionerId: user.uid,
        patientId,
        patientName: selectedPatient?.name ?? 'Patient',
        scheduledAt,
        status: 'planifiée',
        notes: notes || undefined,
        createdAt: serverTimestamp(),
      } as const;

      // Create top-level consultation
      const ref = await addDoc(collection(firestore, 'consultations'), payload);

      // Mirror minimal entry under patient to support existing guards (pending)
      try {
        await addDoc(collection(firestore, `patients/${patientId}/consultations`), {
          scheduledAt,
          status: 'pending',
          createdAt: serverTimestamp(),
          consultationRef: ref.id,
        });
      } catch (e) {
        console.warn('Mirror patient consultation subdoc failed (non-bloquant)', e);
      }

      // Update patient's nextConsultationAt
      try {
        await updateDoc(doc(firestore, 'patients', patientId), {
          nextConsultationAt: scheduledAt,
        });
      } catch (e) {
        console.warn('Mise à jour nextConsultationAt échouée (non-bloquant)', e);
      }

      navigate(`/consultations/${ref.id}`);
    } catch (err: any) {
      console.error('Erreur création consultation', err);
      setError(err?.message || 'Erreur inconnue');
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
          <CalendarPlus className="h-7 w-7 text-nn-primary-300" /> Planifier une consultation
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-white"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-white/60">
                Patient
              </span>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-white/40" />
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  disabled={loadingPatients}
                  className="w-full appearance-none rounded-lg border border-white/10 bg-slate-950/60 py-2 pl-9 pr-3 text-sm text-white focus:border-nn-primary-400 focus:outline-none disabled:opacity-60"
                  required
                >
                  <option value="">{loadingPatients ? 'Chargement…' : 'Choisir un patient'}</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.email ? `• ${p.email}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-white/60">
                Date & heure
              </span>
              <input
                type="datetime-local"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-nn-primary-400 focus:outline-none"
                required
              />
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-white/60">
              Notes (optionnel)
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Objectifs, contexte, éléments personnalisés…"
              className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-nn-primary-400 focus:outline-none"
            />
          </label>

          {error ? (
            <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl border border-nn-primary-400/30 bg-nn-primary-500/15 px-4 py-2 text-sm font-semibold text-nn-primary-100 hover:border-nn-primary-400 hover:bg-nn-primary-500/25 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CalendarPlus className="h-4 w-4" />
              )}
              {saving ? 'Planification…' : 'Planifier'}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
