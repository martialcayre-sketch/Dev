import { DashboardShell } from '@/components/layout/DashboardShell';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { firestore } from '@/lib/firebase';
import { collection, getDocs, limit, orderBy, query, Timestamp, where } from 'firebase/firestore';
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  FileText,
  HeartPulse,
  Library,
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
}

interface Consultation {
  id: string;
  scheduledAt: Date;
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

  useEffect(() => {
    if (!user || userLoading) return;

    const loadDashboardData = async () => {
      try {
        // 1. Charger tous les questionnaires non complétés
        const questionnairesRef = collection(firestore, 'patients', user.uid, 'questionnaires');
        const questionnairesQuery = query(questionnairesRef, orderBy('assignedAt', 'desc'));

        const questionnairesSnap = await getDocs(questionnairesQuery);

        // Filtrer les questionnaires non complétés (pending ou in_progress)
        const questionnaires = questionnairesSnap.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title || doc.id,
              status: data.status as 'pending' | 'in_progress' | 'completed',
              assignedAt: data.assignedAt?.toDate() || new Date(),
            };
          })
          .filter((q) => q.status !== 'completed');

        setPendingQuestionnaires(questionnaires);

        // 2. Vérifier si identification et anamnèse sont complétées
        const consultationRef = collection(firestore, 'patients', user.uid, 'consultation');

        const identificationDoc = await getDocs(
          query(consultationRef, where('__name__', '==', 'identification'))
        );
        setHasIdentification(!identificationDoc.empty);

        const anamneseDoc = await getDocs(
          query(consultationRef, where('__name__', '==', 'anamnese'))
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
        <button
          onClick={() => navigate('/dashboard/library')}
          className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300">
              <Library className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-white/60">Bibliothèque</p>
              <p className="text-lg font-semibold">33 questionnaires</p>
            </div>
          </div>
        </button>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Vos prochaines actions</h3>
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
                  (!hasIdentification ? 1 : 0) +
                  (!hasAnamnese ? 1 : 0) +
                  pendingQuestionnaires.length;

                if (totalActions === 0) {
                  return (
                    <p className="text-sm text-white/60">
                      Aucune action en attente. Vous êtes à jour ! 🎉
                    </p>
                  );
                }

                return (
                  <>
                    <div className="mb-3 flex items-center gap-2 text-sm">
                      <span className="font-semibold text-nn-accent-400">{totalActions}</span>
                      <span className="text-white/60">
                        action{totalActions > 1 ? 's' : ''} à compléter
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
                              <span className="text-xs text-white/60">
                                {q.status === 'in_progress' ? 'En cours • ' : ''}
                                Assigné {formatDistanceToNow(q.assignedAt)}
                              </span>
                            </div>
                            <button
                              onClick={() => navigate(`/dashboard/questionnaires/${q.id}`)}
                              className="rounded-lg bg-nn-primary-600 px-3 py-2 text-xs font-semibold text-white hover:bg-nn-primary-700"
                            >
                              {q.status === 'in_progress' ? 'Continuer' : 'Commencer'}
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
