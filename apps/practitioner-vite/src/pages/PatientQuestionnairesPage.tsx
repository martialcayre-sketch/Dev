import { DashboardShell } from '@/components/layout/DashboardShell';
import { firestore } from '@/lib/firebase';
import { collection, doc, getDoc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { ArrowLeft, Calendar, CheckCircle2, Clock, Download, Eye, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

type Patient = {
  uid: string;
  email: string;
  firstname?: string;
  lastname?: string;
  displayName?: string;
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

function QuestionnaireCard({ questionnaire }: { questionnaire: Questionnaire }) {
  const isCompleted = questionnaire.status === 'completed';
  const completedDate = questionnaire.completedAt?.toDate
    ? questionnaire.completedAt.toDate().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const assignedDate = questionnaire.assignedAt?.toDate
    ? questionnaire.assignedAt.toDate().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const responseCount = questionnaire.responses ? Object.keys(questionnaire.responses).length : 0;

  return (
    <div className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-white/20 hover:bg-white/10">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">{questionnaire.title}</h3>
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            ) : (
              <Clock className="h-5 w-5 text-amber-400" />
            )}
          </div>
          <p className="text-sm text-white/60">{questionnaire.description}</p>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-nn-primary-500/20 px-2 py-0.5 text-xs font-medium text-nn-primary-200">
            {questionnaire.category}
          </div>
        </div>
      </div>

      <div className="space-y-2 border-t border-white/10 pt-4">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Calendar className="h-4 w-4" />
          <span>Assigné le {assignedDate}</span>
        </div>
        {isCompleted && completedDate && (
          <>
            <div className="flex items-center gap-2 text-sm text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Complété le {completedDate}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <FileText className="h-4 w-4" />
              <span>{responseCount} réponses enregistrées</span>
            </div>
          </>
        )}
      </div>

      {isCompleted && (
        <div className="mt-4 flex gap-2">
          <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-nn-primary-500 to-nn-accent-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-nn-primary-400 hover:to-nn-accent-400">
            <Eye className="h-4 w-4" />
            Voir les réponses
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-all hover:border-white/20 hover:bg-white/10">
            <Download className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function PatientQuestionnairesPage() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // Load patient data
    const loadPatient = async () => {
      try {
        const patientDoc = await getDoc(doc(firestore, 'patients', id));
        if (patientDoc.exists()) {
          setPatient({ uid: id, ...patientDoc.data() } as Patient);
        }
      } catch (err: any) {
        console.error('Error loading patient:', err);
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
        const questionnairesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Questionnaire[];
        setQuestionnaires(questionnairesData);
      },
      (err) => {
        console.error('Error listening to questionnaires:', err);
      }
    );

    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex h-96 items-center justify-center">
          <div className="text-white/60">Chargement...</div>
        </div>
      </DashboardShell>
    );
  }

  const patientName =
    patient?.displayName ||
    [patient?.firstname, patient?.lastname].filter(Boolean).join(' ') ||
    patient?.email ||
    'Patient';

  const pendingQuestionnaires = questionnaires.filter((q) => q.status === 'pending');
  const completedQuestionnaires = questionnaires.filter((q) => q.status === 'completed');

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-nn-accent-500/20 p-2 text-nn-accent-200">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Questionnaires</p>
              <h1 className="text-2xl font-semibold text-white">{patientName}</h1>
            </div>
          </div>
          <Link
            to={`/patients/${id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-white hover:border-white/30 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la fiche
          </Link>
        </div>

        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-amber-400" />
              <div>
                <p className="text-3xl font-bold text-amber-400">{pendingQuestionnaires.length}</p>
                <p className="text-sm text-white/60">En attente</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-3xl font-bold text-green-400">
                  {completedQuestionnaires.length}
                </p>
                <p className="text-sm text-white/60">Complétés</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Questionnaires */}
        {pendingQuestionnaires.length > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-semibold text-white">
              En attente ({pendingQuestionnaires.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {pendingQuestionnaires.map((q) => (
                <QuestionnaireCard key={q.id} questionnaire={q} />
              ))}
            </div>
          </div>
        )}

        {/* Completed Questionnaires */}
        {completedQuestionnaires.length > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-semibold text-white">
              Complétés ({completedQuestionnaires.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {completedQuestionnaires.map((q) => (
                <QuestionnaireCard key={q.id} questionnaire={q} />
              ))}
            </div>
          </div>
        )}

        {questionnaires.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-white/20" />
            <p className="text-lg text-white/60">Aucun questionnaire assigné pour le moment</p>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
