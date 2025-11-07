import LatestDayFlowAlimCard from '@/components/LatestDayFlowAlimCard';
import LifeJourneyRadarCard from '@/components/LifeJourneyRadarCard';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { firestore } from '@/lib/firebase';
import { collection, doc, getDoc, onSnapshot, orderBy, query } from 'firebase/firestore';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  Phone,
  Radar,
  User2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

type Patient = {
  uid: string;
  email: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  displayName?: string;
  status: string;
  createdAt?: any;
  pendingQuestionnairesCount?: number;
  lastQuestionnaireCompletedAt?: any;
};

type Questionnaire = {
  id: string;
  title: string;
  category: string;
  description: string;
  status: 'pending' | 'completed';
  assignedAt: any;
  completedAt?: any;
  responses?: Record<string, any>;
};

const COLOR_SCHEMES = {
  fatigue: {
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    bar: 'bg-gradient-to-t from-amber-500 via-orange-500 to-red-500',
    text: 'text-amber-400',
  },
  douleurs: {
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
    bar: 'bg-gradient-to-t from-rose-500 via-pink-500 to-fuchsia-500',
    text: 'text-rose-400',
  },
  digestion: {
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    bar: 'bg-gradient-to-t from-emerald-500 via-teal-500 to-cyan-500',
    text: 'text-emerald-400',
  },
  surpoids: {
    gradient: 'from-violet-500 via-purple-500 to-indigo-500',
    bar: 'bg-gradient-to-t from-violet-500 via-purple-500 to-indigo-500',
    text: 'text-violet-400',
  },
  insomnie: {
    gradient: 'from-blue-500 via-indigo-500 to-violet-500',
    bar: 'bg-gradient-to-t from-blue-500 via-indigo-500 to-violet-500',
    text: 'text-blue-400',
  },
  moral: {
    gradient: 'from-cyan-500 via-sky-500 to-blue-500',
    bar: 'bg-gradient-to-t from-cyan-500 via-sky-500 to-blue-500',
    text: 'text-cyan-400',
  },
  mobilite: {
    gradient: 'from-lime-500 via-green-500 to-emerald-500',
    bar: 'bg-gradient-to-t from-lime-500 via-green-500 to-emerald-500',
    text: 'text-lime-400',
  },
};

const PLAINTES_ITEMS = [
  { id: 'fatigue', label: 'Fatigue', colorScheme: 'fatigue' as const },
  { id: 'douleurs', label: 'Douleurs', colorScheme: 'douleurs' as const },
  { id: 'digestion', label: 'Digestion', colorScheme: 'digestion' as const },
  { id: 'surpoids', label: 'Surpoids', colorScheme: 'surpoids' as const },
  { id: 'insomnie', label: 'Insomnie', colorScheme: 'insomnie' as const },
  { id: 'moral', label: 'Moral', colorScheme: 'moral' as const },
  { id: 'mobilite', label: 'Mobilité', colorScheme: 'mobilite' as const },
];

function VerticalBarChart({ responses }: { responses: Record<string, any> }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Plaintes et Douleurs</h2>
          <p className="text-sm text-white/60">Intensité des troubles ressentis (échelle 1-10)</p>
        </div>
        <Activity className="h-6 w-6 text-nn-accent-400" />
      </div>

      <div className="flex items-end justify-between gap-3 pb-4" style={{ height: '300px' }}>
        {PLAINTES_ITEMS.map((item) => {
          const value = responses?.[item.id] || 0;
          const percentage = (value / 10) * 100;
          const colorScheme = COLOR_SCHEMES[item.colorScheme];

          return (
            <div key={item.id} className="flex flex-1 flex-col items-center gap-3">
              {/* Bar container */}
              <div
                className="relative flex w-full flex-col items-center justify-end"
                style={{ height: '240px' }}
              >
                {/* Value label on top */}
                <div
                  className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full ${colorScheme.bar} text-sm font-bold text-white shadow-lg`}
                >
                  {value}
                </div>

                {/* Animated bar */}
                <div
                  className={`w-full rounded-t-lg ${colorScheme.bar} shadow-lg transition-all duration-700 ease-out`}
                  style={{
                    height: `${percentage}%`,
                    minHeight: value > 0 ? '8px' : '0px',
                  }}
                />
              </div>

              {/* Label */}
              <div className="text-center">
                <p className={`text-xs font-semibold ${colorScheme.text}`}>{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scale indicators */}
      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
        <span className="text-xs text-white/40">0 - Aucun trouble</span>
        <span className="text-xs text-white/40">10 - Trouble intense</span>
      </div>
    </div>
  );
}

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useFirebaseUser();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[PatientDetailPage] Effect triggered', {
      authLoading,
      hasUser: !!user,
      userUid: user?.uid,
      patientId: id,
    });

    // Attendre que l'authentification soit chargée
    if (authLoading) {
      console.log('[PatientDetailPage] Waiting for auth...');
      return;
    }

    // Vérifier que l'utilisateur est connecté
    if (!user) {
      console.error('[PatientDetailPage] No user logged in');
      setError('Vous devez être connecté pour voir cette page');
      setLoading(false);
      return;
    }

    console.log('[PatientDetailPage] Practitioner logged in:', user.uid, user.email);

    if (!id) {
      console.error('[PatientDetailPage] No patient ID provided');
      setError('Aucun identifiant patient fourni');
      setLoading(false);
      return;
    }

    console.log('[PatientDetailPage] Loading patient:', id);

    // Load patient data
    const loadPatient = async () => {
      try {
        console.log('[PatientDetailPage] Fetching patient document...');
        const patientDoc = await getDoc(doc(firestore, 'patients', id));

        console.log('[PatientDetailPage] Patient doc exists:', patientDoc.exists());

        if (patientDoc.exists()) {
          const patientData = { uid: id, ...patientDoc.data() } as Patient;
          console.log('[PatientDetailPage] Patient data loaded:', {
            uid: patientData.uid,
            email: patientData.email,
            status: patientData.status,
            practitionerId: patientDoc.data().practitionerId,
          });
          setPatient(patientData);
        } else {
          console.error('[PatientDetailPage] Patient document does not exist');
          setError('Patient non trouvé');
        }
      } catch (err: any) {
        console.error('[PatientDetailPage] Error loading patient:', err);
        console.error('[PatientDetailPage] Error code:', err.code);
        console.error('[PatientDetailPage] Error message:', err.message);

        // Fournir un message d'erreur plus détaillé
        if (err.code === 'permission-denied') {
          setError("Accès refusé : vous n'avez pas les permissions pour voir ce patient");
        } else {
          setError(`Erreur lors du chargement : ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    loadPatient();

    // Real-time listener for questionnaires
    const questionnairesRef = collection(firestore, 'patients', id, 'questionnaires');
    const q = query(questionnairesRef, orderBy('assignedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('[PatientDetailPage] Questionnaires loaded:', snapshot.docs.length);
        const questionnairesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Questionnaire[];
        setQuestionnaires(questionnairesData);
      },
      (err) => {
        console.error('[PatientDetailPage] Error listening to questionnaires:', err);
        console.error('[PatientDetailPage] Questionnaires error code:', err.code);
      }
    );

    return () => unsubscribe();
  }, [id, authLoading, user]);

  if (authLoading || loading) {
    return (
      <DashboardShell>
        <div className="flex h-96 items-center justify-center">
          <div className="text-white/60">Chargement...</div>
        </div>
      </DashboardShell>
    );
  }

  if (error || !patient) {
    return (
      <DashboardShell>
        <div className="flex min-h-96 flex-col items-center justify-center gap-4 p-8">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 max-w-2xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-red-400 mb-2">
                  {error || 'Patient non trouvé'}
                </h3>
                <p className="text-sm text-white/70 mb-4">Vérifiez que :</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-white/60">
                  <li>Le patient existe dans la base de données</li>
                  <li>Ce patient est bien assigné à votre compte praticien</li>
                  <li>Vous êtes connecté avec le bon compte praticien</li>
                  <li>Vous avez les permissions nécessaires</li>
                </ul>
                {id && <p className="mt-4 text-xs text-white/40 font-mono">ID patient : {id}</p>}
              </div>
            </div>
          </div>
          <Link
            to="/patients"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:border-white/30 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la liste des patients
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const patientName =
    patient.displayName ||
    [patient.firstname, patient.lastname].filter(Boolean).join(' ') ||
    patient.email;

  const pendingQuestionnaires = questionnaires.filter((q) => q.status === 'pending');
  const completedQuestionnaires = questionnaires.filter((q) => q.status === 'completed');

  const plaintesDouleurs = questionnaires.find((q) => q.id === 'plaintes-et-douleurs');

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-nn-primary-500/20 p-2 text-nn-primary-200">
              <User2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Fiche patient</p>
              <h1 className="text-2xl font-semibold text-white">{patientName}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {id && (
              <Link
                to={`/patients/${id}/dayflow-alim`}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-nn-primary-500 to-nn-accent-500 px-3 py-1.5 text-sm font-semibold text-white hover:from-nn-primary-400 hover:to-nn-accent-400"
              >
                <Radar className="h-4 w-4" />
                DayFlow Alimentation
              </Link>
            )}
            <Link
              to="/patients"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-white hover:border-white/30 hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          </div>
        </div>

        {/* Patient Info Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-nn-accent-400" />
              <div>
                <p className="text-xs text-white/60">Email</p>
                <p className="text-sm font-medium text-white">{patient.email}</p>
              </div>
            </div>
          </div>

          {patient.phone && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-nn-accent-400" />
                <div>
                  <p className="text-xs text-white/60">Téléphone</p>
                  <p className="text-sm font-medium text-white">{patient.phone}</p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-nn-accent-400" />
              <div>
                <p className="text-xs text-white/60">Statut</p>
                <p className="text-sm font-medium text-white capitalize">{patient.status}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dernier DayFlow 360 – Alimentation */}
        <LatestDayFlowAlimCard uid={patient.uid} />

        {/* Questionnaires Status */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-400" />
                  <h3 className="text-lg font-semibold text-white">En attente</h3>
                </div>
                <p className="mt-1 text-3xl font-bold text-amber-400">
                  {pendingQuestionnaires.length}
                </p>
                <p className="text-sm text-white/60">Questionnaires à compléter</p>
              </div>
              <AlertCircle className="h-12 w-12 text-amber-400/20" />
            </div>
          </div>

          <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Complétés</h3>
                </div>
                <p className="mt-1 text-3xl font-bold text-green-400">
                  {completedQuestionnaires.length}
                </p>
                <p className="text-sm text-white/60">Questionnaires remplis</p>
              </div>
              <CheckCircle2 className="h-12 w-12 text-green-400/20" />
            </div>
          </div>
        </div>

        {/* Vertical Bar Chart for Plaintes et Douleurs */}
        {plaintesDouleurs &&
          plaintesDouleurs.status === 'completed' &&
          plaintesDouleurs.responses && <VerticalBarChart responses={plaintesDouleurs.responses} />}

        {/* Life Journey Radar Chart */}
        {id && <LifeJourneyRadarCard patientId={id} />}

        {/* Questionnaires List */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Questionnaires</h2>
            <Link
              to={`/patients/${id}/questionnaires`}
              className="text-sm font-semibold text-nn-accent-200 hover:text-nn-accent-100"
            >
              Voir tous →
            </Link>
          </div>

          <div className="space-y-3">
            {questionnaires.length === 0 ? (
              <p className="py-8 text-center text-white/60">Aucun questionnaire assigné</p>
            ) : (
              questionnaires.map((q) => (
                <div
                  key={q.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-white/20 hover:bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-nn-accent-400" />
                    <div>
                      <p className="font-medium text-white">{q.title}</p>
                      <p className="text-xs text-white/60">{q.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {q.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Complété
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400">
                        <Clock className="h-3 w-3" />
                        En attente
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
