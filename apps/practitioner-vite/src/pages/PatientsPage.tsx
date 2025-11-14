import { DashboardShell } from '@/components/layout/DashboardShell';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { functions } from '@/lib/firebase';
import api from '@/services/api';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { httpsCallable } from 'firebase/functions';
import {
  AlertCircle,
  Archive,
  ArrowRight,
  Bell,
  CalendarClock,
  CheckCircle2,
  Hourglass,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  Users2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

interface Patient {
  uid: string; // ID from API
  id: string; // Alias for compatibility (non-optional)
  email: string;
  displayName?: string;
  firstname?: string;
  lastname?: string;
  fullName?: string;
  name?: string;
  phone?: string;
  status?: string;
  createdAt?: Date;
  upcomingConsultation?: Date | null;
  hasNewConsultationActivity?: boolean;
  consultationComplete?: boolean;
  archived?: boolean;
  hasQuestionnairesAssigned?: boolean;
  pendingQuestionnairesCount?: number;
  // Nouveaux champs V3.1
  age?: number;
  ageGroup?: 'adult' | 'teen' | 'kid';
  identificationCompleted?: boolean;
  identificationRequired?: boolean;
  dateNaissance?: string;
}

export default function PatientsPage() {
  const { user } = useFirebaseUser();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [resendSuccessId, setResendSuccessId] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPatients() {
      if (!user?.uid) return;
      setLoading(true);
      setError(null);
      setInviteSuccess(false);

      try {
        // ✅ Utiliser l'API backend au lieu de Firestore direct
        const response = await api.getPractitionerPatients(user.uid);
        if (!isMounted) return;

        const formattedPatients = response.patients.map((p: any) => {
          const fullName =
            p.displayName || `${p.firstname || ''} ${p.lastname || ''}`.trim() || 'Patient';

          return {
            uid: p.uid,
            id: p.uid, // Alias pour compatibilité avec le code existant
            email: p.email,
            displayName: p.displayName,
            firstname: p.firstname,
            lastname: p.lastname,
            fullName,
            name: fullName,
            phone: p.phone || undefined,
            status: p.status || 'active',
            createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
            upcomingConsultation: null,
            hasNewConsultationActivity: false,
            consultationComplete: false,
            archived: false,
            hasQuestionnairesAssigned: p.hasQuestionnairesAssigned || false,
            pendingQuestionnairesCount: 0,
          } as Patient;
        });

        setPatients(formattedPatients);
      } catch (err: any) {
        console.error('Erreur Firestore patients', err);
        const errorMsg = err?.message || err?.code || 'Erreur inconnue';
        setError(`Impossible de charger vos patients. ${errorMsg}`);
        setPatients([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPatients();
    return () => {
      isMounted = false;
    };
  }, [user?.uid]);

  async function handleInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!inviteEmail || !user?.uid) return;

    setInviting(true);
    setError(null);
    setInviteSuccess(false);

    try {
      const callable = httpsCallable(functions, 'invitePatient');
      await callable({
        email: inviteEmail,
        phone: invitePhone || undefined,
        practitionerId: user.uid,
      });
      setInviteEmail('');
      setInvitePhone('');
      setInviteSuccess(true);
    } catch (err: any) {
      console.error('Invitation patient', err);
      const code = err?.code || err?.name || 'unknown';
      const msg = err?.message || 'Erreur inconnue';
      setError(`Erreur lors de l'invitation (${code}): ${msg}`);
    } finally {
      setInviting(false);
    }
  }

  async function handleResendInvitation(patient: Patient) {
    if (!user?.uid || !patient?.email) return;
    setError(null);
    setResendSuccessId(null);
    setResendingId(patient.id);

    try {
      const callable = httpsCallable(functions, 'invitePatient');
      await callable({
        email: patient.email,
        phone: patient.phone || undefined,
        practitionerId: user.uid,
      });
      setResendSuccessId(patient.id);
    } catch (err) {
      console.error('Renvoyer invitation patient', err);
      setError("Impossible de renvoyer l'invitation pour ce patient.");
    } finally {
      setResendingId(null);
    }
  }

  async function handleArchivePatient(patient: Patient) {
    if (
      !window.confirm(
        `Archiver ${
          patient.name || patient.email
        } ? Le patient ne sera plus visible dans la liste active.`
      )
    ) {
      return;
    }

    if (!user?.uid) return;

    setArchivingId(patient.id);
    setError(null);

    try {
      await api.archivePatient(user.uid, patient.id);
      setPatients((prev) => prev.filter((p) => p.id !== patient.id));
    } catch (err: any) {
      console.error('Archive patient error', err);
      setError(`Erreur lors de l'archivage : ${err.message}`);
    } finally {
      setArchivingId(null);
    }
  }

  async function handleDeletePatient(patient: Patient) {
    if (
      !window.confirm(
        `⚠️ ATTENTION : Supprimer définitivement ${
          patient.name || patient.email
        } ? Cette action est irréversible.`
      )
    ) {
      return;
    }

    if (!user?.uid) return;

    setDeletingId(patient.id);
    setError(null);

    try {
      await api.deletePatient(user.uid, patient.id);
      setPatients((prev) => prev.filter((p) => p.id !== patient.id));
    } catch (err: any) {
      console.error('Delete patient error', err);
      setError(`Erreur lors de la suppression : ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  }

  const filteredPatients = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return patients;

    return patients.filter((patient) => {
      const normalizedPhone = (patient.phone ?? '').replace(/\s+/g, '');
      return (
        patient.email.toLowerCase().includes(term) ||
        (patient.fullName ?? '').toLowerCase().includes(term) ||
        normalizedPhone.includes(term)
      );
    });
  }, [patients, searchTerm]);

  return (
    <DashboardShell>
      <section className="space-y-8">
        <header className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 text-white shadow-2xl shadow-nn-primary-500/5 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-nn-primary-500/20 p-3 text-nn-primary-200">
              <Users2 className="h-8 w-8" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Cohorte patient</p>
              <h1 className="mt-2 text-3xl font-semibold">Gestion des patients</h1>
              <p className="mt-2 max-w-xl text-sm text-white/65">
                Visualisez vos patients actifs, leurs consultations planifiées et invitez de
                nouveaux profils en un clic.
              </p>
            </div>
          </div>
          <form
            id="invite-form"
            onSubmit={handleInvite}
            className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
              Inviter un patient
            </p>
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(event) => {
                setInviteEmail(event.target.value);
                setInviteSuccess(false);
              }}
              placeholder="Email du patient"
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-sm text-white/90 placeholder:text-white/40 focus:border-nn-primary-500/40 focus:outline-none focus:ring-2 focus:ring-nn-primary-500/40"
            />
            <input
              type="tel"
              value={invitePhone}
              onChange={(event) => setInvitePhone(event.target.value)}
              placeholder="Téléphone (optionnel)"
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-sm text-white/90 placeholder:text-white/40 focus:border-nn-primary-500/40 focus:outline-none focus:ring-2 focus:ring-nn-primary-500/40"
            />
            <button
              type="submit"
              disabled={inviting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-nn-primary-500 to-nn-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-nn-primary-500/20 transition hover:from-nn-primary-400 hover:to-nn-accent-400 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {inviting ? 'Envoi en cours...' : "Envoyer l'invitation"}
            </button>
            {inviteSuccess ? (
              <p className="text-xs text-emerald-300">
                Invitation envoyée. Le patient recevra un email d'inscription.
              </p>
            ) : null}
          </form>
        </header>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w/full max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Rechercher par nom, email, téléphone..."
              className="w-full rounded-xl border border-white/10 bg-slate-900 pl-11 pr-4 py-2.5 text-sm text-white/90 placeholder:text-white/40 focus:border-nn-primary-500/40 focus:outline-none focus:ring-2 focus:ring-nn-primary-500/40"
            />
          </div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">
            {filteredPatients.length} patient(s)
          </p>
        </div>

        {error ? (
          <div className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="flex justify-center rounded-3xl border border-white/10 bg-white/5 py-20 text-white/60">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              Chargement des patients...
            </div>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 px-6 py-14 text-center text-white/60">
            <Users2 className="mx-auto h-10 w-10 text-white/30" />
            <p className="mt-4 text-sm">
              Aucun patient ne correspond à votre recherche. Invitez un nouveau patient pour
              démarrer un suivi.
            </p>
            <Link
              to="/patients/create"
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:border-white/30 hover:bg-white/10"
            >
              Lancer une invitation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPatients.map((patient) => (
              <article
                key={patient.id}
                className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-white transition hover:border-nn-primary-500/30 hover:bg-nn-primary-500/10 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-nn-primary-500/15 text-lg font-semibold text-nn-primary-100">
                    {(patient.fullName || patient.email)[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white">
                      {patient.fullName || patient.email}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-white/50">
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-4 w-4" /> {patient.email}
                      </span>
                      {patient.phone ? (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-4 w-4" /> {patient.phone}
                        </span>
                      ) : null}
                      {patient.age && (
                        <span className="inline-flex items-center gap-1">
                          🎂 {patient.age} ans
                          {patient.ageGroup && (
                            <span className="ml-1 rounded-full bg-nn-accent-500/20 px-2 py-0.5 text-[10px] text-nn-accent-300">
                              {patient.ageGroup === 'adult'
                                ? 'Adulte'
                                : patient.ageGroup === 'teen'
                                ? 'Ado'
                                : 'Enfant'}
                            </span>
                          )}
                        </span>
                      )}
                      {patient.createdAt ? (
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock className="h-4 w-4" /> inscrit{' '}
                          {formatDistanceToNow(patient.createdAt, {
                            locale: fr,
                            addSuffix: true,
                          })}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3 text-sm text-white/70 md:items-end">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
                      {patient.status === 'active' ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                          Approved
                        </>
                      ) : patient.status === 'pending' ? (
                        <>
                          <Hourglass className="h-4 w-4 text-amber-200" />
                          En attente
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-rose-300" />
                          {patient.status ?? 'Inconnu'}
                        </>
                      )}
                    </span>
                    {patient.hasNewConsultationActivity ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-nn-accent-400/30 bg-nn-accent-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-nn-accent-200">
                        <Bell className="h-4 w-4 animate-pulse" />
                        Espace consultation ouvert
                      </span>
                    ) : null}
                    {patient.identificationRequired && !patient.identificationCompleted ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-200">
                        🆔 Identification requise
                      </span>
                    ) : patient.identificationCompleted ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-200">
                        ✅ Identifié
                      </span>
                    ) : null}
                    {patient.hasQuestionnairesAssigned &&
                    patient.pendingQuestionnairesCount &&
                    patient.pendingQuestionnairesCount > 0 ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-200">
                        <Users2 className="hidden" />
                        {patient.pendingQuestionnairesCount} questionnaire
                        {patient.pendingQuestionnairesCount > 1 ? 's' : ''} en attente
                        {patient.ageGroup && (
                          <span className="ml-1 text-[10px]">
                            (
                            {patient.ageGroup === 'adult'
                              ? 'adulte'
                              : patient.ageGroup === 'teen'
                              ? 'ado'
                              : 'enfant'}
                            )
                          </span>
                        )}
                      </span>
                    ) : null}
                  </div>
                  {patient.status === 'pending' ? (
                    <div className="flex flex-col items-start md:items-end gap-2">
                      <button
                        onClick={() => handleResendInvitation(patient)}
                        disabled={resendingId === patient.id}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:border-nn-primary-400 hover:bg-nn-primary-500/10 disabled:opacity-60"
                      >
                        <Mail className="h-4 w-4" />
                        {resendingId === patient.id ? 'Renvoi...' : "Renvoyer l'invitation"}
                      </button>
                      {resendSuccessId === patient.id ? (
                        <p className="text-[11px] text-emerald-300">Invitation renvoyée.</p>
                      ) : null}
                    </div>
                  ) : null}
                  {patient.upcomingConsultation ? (
                    <Link
                      to="/consultations"
                      className="text-xs text-white/60 hover:text-nn-accent-300 hover:underline"
                    >
                      Prochaine séance{' '}
                      {formatDistanceToNow(patient.upcomingConsultation, {
                        locale: fr,
                        addSuffix: true,
                      })}
                    </Link>
                  ) : (
                    <p className="text-xs text-white/40">Aucune consultation planifiée</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleArchivePatient(patient)}
                      disabled={archivingId === patient.id}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:border-amber-400/50 hover:bg-amber-500/10 disabled:opacity-60"
                      title="Archiver ce patient"
                    >
                      <Archive className="h-4 w-4" />
                      {archivingId === patient.id ? 'Archivage...' : 'Archiver'}
                    </button>
                    <button
                      onClick={() => handleDeletePatient(patient)}
                      disabled={deletingId === patient.id}
                      className="inline-flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 hover:border-rose-400/50 hover:bg-rose-500/20 disabled:opacity-60"
                      title="Supprimer définitivement ce patient"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingId === patient.id ? 'Suppression...' : 'Supprimer'}
                    </button>
                  </div>
                  <Link
                    to={`/patients/${patient.id}`}
                    className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-nn-accent-200"
                  >
                    Ouvrir la fiche
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
