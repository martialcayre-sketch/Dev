import { DashboardShell } from '@/components/layout/DashboardShell';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { firestore } from '@/lib/firebase';
import api from '@/services/api';
import { collection, getDocs, limit, orderBy, query, Timestamp, where } from 'firebase/firestore';
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  FileText,
  HeartPulse,
  NotebookPen,
  Salad,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Fonctions de formatage de dates simples
const formatDate = (date: Date, formatStr: string): string => {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const months = [
    'Jan',
    'Fév',
    'Mar',
    'Avr',
    'Mai',
    'Juin',
    'Juil',
    'Aoû',
    'Sep',
    'Oct',
    'Nov',
    'Déc',
  ];

  const pad = (n: number) => String(n).padStart(2, '0');

  return formatStr
    .replace('EEEE', days[date.getDay()])
    .replace('HH', pad(date.getHours()))
    .replace('mm', pad(date.getMinutes()))
    .replace('MMM', months[date.getMonth()])
    .replace('dd', pad(date.getDate()));
};

const formatDistanceToNow = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'il y a quelques secondes';
  if (diffMins < 60) return `il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  if (diffDays < 30)
    return `il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
  return `il y a ${Math.floor(diffDays / 30)} mois`;
};

interface Questionnaire {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignedAt: Date;
  ageGroup?: string;
  estimatedMinutes?: number;
}

interface Consultation {
  id: string;
  scheduledAt: Date;
}

interface PatientProfile {
  identificationRequired: boolean;
  identificationCompleted: boolean;
  ageGroup?: 'adult' | 'teen' | 'kid';
  age?: number;
  firstname?: string;
}

export default function DashboardPage() {
  const { user, loading: userLoading } = useFirebaseUser();
  const navigate = useNavigate();

  const [pendingQuestionnaires, setPendingQuestionnaires] = useState<Questionnaire[]>([]);
  const [nextConsultation, setNextConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasIdentification, setHasIdentification] = useState(false);
  const [hasAnamnese, setHasAnamnese] = useState(false);
  const [actionsExpanded, setActionsExpanded] = useState(true);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);

  useEffect(() => {
    if (!user || userLoading) return;

    const loadDashboardData = async () => {
      try {
        // 1. Vérifier le statut d'identification V3.1
        let identificationStatus = null;
        try {
          const response = await fetch('/api/patients/identification/status', {
            headers: {
              Authorization: `Bearer ${await user.getIdToken()}`,
            },
          });
          if (response.ok) {
            identificationStatus = await response.json();
          }
        } catch (error) {
          console.warn('Could not load identification status:', error);
        }

        if (identificationStatus?.success) {
          setPatientProfile({
            identificationRequired: identificationStatus.identificationRequired || false,
            identificationCompleted: identificationStatus.identificationCompleted || false,
            ageGroup: identificationStatus.ageGroup,
            age: identificationStatus.age,
          });
        }

        // 2. Charger tous les questionnaires non complétés via API
        const result = await api.getPatientQuestionnaires(user.uid);

        if (result && result.questionnaires) {
          // Filtrer les questionnaires non complétés (pending ou in_progress)
          const questionnaires = result.questionnaires
            .filter((q: any) => q.status !== 'completed')
            .map((q: any) => ({
              id: q.id,
              title: q.title || q.id,
              status: q.status as 'pending' | 'in_progress' | 'completed',
              assignedAt: q.assignedAt?.toDate ? q.assignedAt.toDate() : new Date(q.assignedAt),
              ageGroup: identificationStatus?.ageGroup,
              estimatedMinutes: q.estimatedMinutes,
            }));

          setPendingQuestionnaires(questionnaires);
        }

        // 3. Charger les consultations à venir
        const consultationsRef = collection(firestore, 'consultations');
        const upcomingConsultationsQuery = query(
          consultationsRef,
          where('patientId', '==', user.uid),
          where('scheduledAt', '>', new Date()),
          orderBy('scheduledAt', 'asc'),
          limit(1)
        );
        const consultationsSnapshot = await getDocs(upcomingConsultationsQuery);
        if (!consultationsSnapshot.empty) {
          const consultationDoc = consultationsSnapshot.docs[0];
          const consultationData = consultationDoc.data();
          setNextConsultation({
            id: consultationDoc.id,
            scheduledAt: consultationData.scheduledAt.toDate(),
          });
        }

        // 4. Vérifier l'état des fiches (legacy pour compatibilité)
        const patientConsultationRef = collection(firestore, 'patients', user.uid, 'consultation');

        const identificationDoc = await getDocs(
          query(patientConsultationRef, where('__name__', '==', 'identification'))
        );
        setHasIdentification(!identificationDoc.empty);

        const anamneseDoc = await getDocs(
          query(patientConsultationRef, where('__name__', '==', 'anamnese'))
        );
        setHasAnamnese(!anamneseDoc.empty);

        // 3. Charger la prochaine consultation
        const consultationsRef = collection(firestore, 'patients', user.uid, 'consultations');
        const now = Timestamp.now();
        const consultationsQuery = query(
          consultationsRef,
          where('scheduledAt', '>=', now),
          orderBy('scheduledAt', 'asc'),
          limit(1)
        );

        const consultationsSnap = await getDocs(consultationsQuery);
        if (!consultationsSnap.empty) {
          const consultationDoc = consultationsSnap.docs[0];
          const data = consultationDoc.data();
          setNextConsultation({
            id: consultationDoc.id,
            scheduledAt: data.scheduledAt?.toDate() || new Date(),
          });
        }
      } catch (error) {
        console.error('[Dashboard] Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user, userLoading]);

  const formatConsultationDate = (date: Date) => {
    const dayName = formatDate(date, 'EEEE');
    const time = formatDate(date, 'HH:mm');
    return `${dayName.charAt(0).toUpperCase()}${dayName.slice(1, 3)}. ${time}`;
  };

  return (
    <DashboardShell>
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-nn-primary-600/25 via-slate-900 to-nn-accent-600/20 p-6 sm:p-8">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white">
            Bienvenue{user?.displayName ? `, ${user.displayName}` : ''}
          </h2>
          <p className="mt-1 text-white/70">
            Continuez là où vous vous étiez arrêté. Vos actions importantes sont listées ci‑dessous.
          </p>
          <div className="mt-4">
            <button
              onClick={() => navigate('/dashboard/consultation')}
              className="rounded-xl bg-gradient-to-r from-nn-primary-600 to-nn-accent-600 px-4 py-2 text-sm font-semibold text-white hover:shadow-lg hover:shadow-nn-primary-500/30"
            >
              Espace consultation
            </button>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-nn-primary-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-nn-accent-500/30 blur-3xl" />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <button
          onClick={() => navigate('/dashboard/questionnaires')}
          className="group rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:border-nn-primary-500/50 hover:bg-white/10 hover:shadow-lg hover:shadow-nn-primary-500/10"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 transition-all group-hover:bg-emerald-500/30 group-hover:scale-110">
              <NotebookPen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-white/60 group-hover:text-white/80">
                Questionnaires
              </p>
              <p className="text-lg font-semibold text-white">
                {loading ? '...' : `${pendingQuestionnaires.length} à compléter`}
              </p>
            </div>
          </div>
        </button>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-white/60">
                Prochaine consultation
              </p>
              <p className="text-lg font-semibold">
                {loading
                  ? '...'
                  : nextConsultation
                  ? formatConsultationDate(nextConsultation.scheduledAt)
                  : 'Aucune'}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-300">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-white/60">Suivi</p>
              <p className="text-lg font-semibold">En cours</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-500/20 text-lime-300">
              <Salad className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-white/60">Nutrition</p>
              <p className="text-lg font-semibold">Active</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section identification obligatoire V3.1 */}
      {patientProfile?.identificationRequired && !patientProfile?.identificationCompleted && (
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500/20">
              <User className="h-6 w-6 text-amber-300" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-amber-100">🎯 Identification obligatoire</h3>
              <p className="mt-2 text-amber-200/80">
                Pour vous proposer des questionnaires adaptés à votre âge et vos besoins, nous avons
                besoin que vous complétiez votre identification (âge, taille, poids...).
              </p>
              {patientProfile.ageGroup && (
                <p className="mt-1 text-sm text-amber-300">
                  🎂 Groupe d'âge détecté :{' '}
                  {patientProfile.ageGroup === 'adult'
                    ? 'Adulte'
                    : patientProfile.ageGroup === 'teen'
                    ? 'Adolescent'
                    : 'Enfant'}{' '}
                  ({patientProfile.age} ans)
                </p>
              )}
              <button
                onClick={() => navigate('/dashboard/identification')}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
              >
                <User className="h-4 w-4" />
                Compléter mon identification
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Message de félicitations post-identification */}
      {patientProfile?.identificationCompleted && patientProfile?.ageGroup && (
        <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
              {patientProfile.ageGroup === 'kid'
                ? '🧒'
                : patientProfile.ageGroup === 'teen'
                ? '🧑‍🎓'
                : '👤'}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-emerald-100">✅ Profil complété !</h3>
              <p className="mt-2 text-emerald-200/80">
                Parfait ! Vos questionnaires ont été adaptés pour
                {patientProfile.ageGroup === 'adult'
                  ? ' les adultes'
                  : patientProfile.ageGroup === 'teen'
                  ? ' les adolescents'
                  : ' les enfants'}{' '}
                ({patientProfile.age} ans).
              </p>
              {patientProfile.ageGroup === 'kid' && (
                <p className="mt-1 text-sm text-emerald-300">
                  👨‍👩‍👧‍👦 Papa ou maman peuvent t'aider à répondre aux questionnaires !
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {patientProfile?.ageGroup === 'kid'
                ? 'Tes prochaines actions'
                : 'Vos prochaines actions'}
            </h3>
            <button
              onClick={() => setActionsExpanded(!actionsExpanded)}
              className="rounded-lg p-1 hover:bg-white/5"
            >
              {actionsExpanded ? (
                <ChevronUp className="h-5 w-5 text-white/60" />
              ) : (
                <ChevronDown className="h-5 w-5 text-white/60" />
              )}
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-white/60">Chargement...</p>
          ) : (
            <>
              {/* Calculer le nombre total d'actions */}
              {(() => {
                const totalActions =
                  (patientProfile?.identificationRequired &&
                  !patientProfile?.identificationCompleted
                    ? 1
                    : 0) +
                  (!hasIdentification ? 1 : 0) +
                  (!hasAnamnese ? 1 : 0) +
                  pendingQuestionnaires.length;

                if (totalActions === 0) {
                  return (
                    <p className="text-sm text-white/60">
                      {patientProfile?.ageGroup === 'kid'
                        ? 'Aucune action en attente. Tu es à jour ! 🎉'
                        : 'Aucune action en attente. Vous êtes à jour ! 🎉'}
                    </p>
                  );
                }

                return (
                  <>
                    <div className="mb-3 flex items-center gap-2 text-sm">
                      <span className="font-semibold text-nn-accent-400">{totalActions}</span>
                      <span className="text-white/60">
                        action{totalActions > 1 ? 's' : ''} à{' '}
                        {patientProfile?.ageGroup === 'kid' ? 'faire' : 'compléter'}
                      </span>
                    </div>

                    {actionsExpanded && (
                      <ul className="space-y-2 text-sm">
                        {/* Identification */}
                        {!hasIdentification && (
                          <li className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                              <User className="h-4 w-4 text-amber-300" />
                            </div>
                            <div className="flex-1">
                              <span className="block font-medium text-amber-100">
                                Fiche d'identification
                              </span>
                              <span className="text-xs text-amber-200/70">
                                Requis pour demander une consultation
                              </span>
                            </div>
                            <button
                              onClick={() => navigate('/dashboard/consultation')}
                              className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700"
                            >
                              Remplir
                            </button>
                          </li>
                        )}

                        {/* Anamnèse */}
                        {!hasAnamnese && (
                          <li className="flex items-start gap-3 rounded-xl border border-orange-500/30 bg-orange-500/10 p-3">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-orange-500/20">
                              <FileText className="h-4 w-4 text-orange-300" />
                            </div>
                            <div className="flex-1">
                              <span className="block font-medium text-orange-100">Anamnèse</span>
                              <span className="text-xs text-orange-200/70">
                                Requis pour demander une consultation
                              </span>
                            </div>
                            <button
                              onClick={() => navigate('/dashboard/consultation')}
                              className="rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-700"
                            >
                              Remplir
                            </button>
                          </li>
                        )}

                        {/* Tous les questionnaires */}
                        {pendingQuestionnaires.map((q) => (
                          <li
                            key={q.id}
                            className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 hover:border-nn-primary-500/50"
                          >
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-nn-primary-500/20">
                              <NotebookPen className="h-4 w-4 text-nn-primary-300" />
                            </div>
                            <div className="flex-1">
                              <span className="block font-medium">{q.title}</span>
                              <div className="text-xs text-white/60">
                                {q.status === 'in_progress'
                                  ? patientProfile?.ageGroup === 'kid'
                                    ? 'En cours • '
                                    : 'En cours • '
                                  : ''}
                                {patientProfile?.ageGroup === 'kid' ? 'Donné' : 'Assigné'}{' '}
                                {formatDistanceToNow(q.assignedAt)}
                                {q.estimatedMinutes && (
                                  <span className="ml-2 text-nn-accent-300">
                                    • ~{q.estimatedMinutes}min
                                  </span>
                                )}
                                {q.ageGroup && (
                                  <span className="ml-2 rounded-full bg-nn-accent-500/20 px-2 py-0.5 text-[10px] text-nn-accent-300">
                                    {q.ageGroup === 'adult'
                                      ? 'Adulte'
                                      : q.ageGroup === 'teen'
                                      ? 'Ado'
                                      : 'Enfant'}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => navigate(`/dashboard/questionnaires/${q.id}`)}
                              className="rounded-lg bg-nn-primary-600 px-3 py-2 text-xs font-semibold text-white hover:bg-nn-primary-700"
                            >
                              {q.status === 'in_progress'
                                ? patientProfile?.ageGroup === 'kid'
                                  ? 'Continuer le jeu'
                                  : 'Continuer'
                                : patientProfile?.ageGroup === 'kid'
                                ? 'Jouer'
                                : 'Commencer'}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                );
              })()}
            </>
          )}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="mb-3 text-lg font-semibold">Vos espaces</h3>
          <ul className="space-y-2 text-sm">
            <li
              onClick={() => navigate('/dashboard/consultation')}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 p-3 hover:border-nn-primary-500/50"
            >
              <span>Espace consultation</span>
              <span className="text-xs text-nn-primary-400">→</span>
            </li>
            <li
              onClick={() => navigate('/dashboard/questionnaires')}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 p-3 hover:border-nn-primary-500/50"
            >
              <span>Mes questionnaires</span>
              <span className="text-xs text-nn-primary-400">→</span>
            </li>
            <li
              onClick={() => navigate('/dashboard/plan')}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 p-3 hover:border-nn-primary-500/50"
            >
              <span>Plan nutrition</span>
              <span className="text-xs text-nn-primary-400">→</span>
            </li>
          </ul>
        </div>
      </section>
    </DashboardShell>
  );
}
