import { DashboardShell } from '@/components/layout/DashboardShell';
import { usePatientProfile } from '@/hooks/usePatientProfile';
import { auth, firestore } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { AlertTriangle, CheckCircle2, ChevronRight, ClipboardList, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ConsultationPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { profile, loading: profileLoading } = usePatientProfile(user?.uid);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/', { replace: true });
      } else {
        setUser(currentUser);
        checkConsultationData(currentUser.uid);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const checkConsultationData = async (uid: string) => {
    try {
      const patientRef = doc(firestore, 'patients', uid);
      const patientDoc = await getDoc(patientRef);

      if (patientDoc.exists()) {
        const now = new Date().toISOString();
        await updateDoc(patientRef, {
          consultationLastOpened: now,
          hasNewConsultationActivity: true,
        });
      }
    } catch (error) {
      console.error('Error in checkConsultationData:', error);
    }
  };

  const requestConsultation = async () => {
    if (!profile.canRequestConsultation) {
      alert(
        'Veuillez compléter votre identification, anamnèse et les 4 questionnaires avant de demander une consultation.'
      );
      return;
    }

    // TODO: Implémenter la logique de demande de consultation
    alert('Demande de consultation envoyée ! Votre praticien vous recontactera prochainement.');
  };

  if (loading || !user || profileLoading) return null;

  const consultationComplete = profile.hasIdentification && profile.hasAnamnese;

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">Espace Consultation</h1>
          <p className="text-white/70">
            {consultationComplete && profile.completedQuestionnairesCount >= 4
              ? 'Votre dossier de consultation est complet. Vous pouvez demander une consultation.'
              : 'Veuillez compléter les fiches suivantes pour pouvoir demander une consultation.'}
          </p>
        </div>

        {/* Statut global */}
        {profile.canRequestConsultation ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
            <div className="mb-3 flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              <h3 className="text-xl font-bold text-white">Dossier complet</h3>
            </div>
            <p className="mb-4 text-emerald-200/80">
              Vous avez complété votre identification, anamnèse et les 4 questionnaires requis. Vous
              pouvez maintenant demander une consultation.
            </p>
            <button
              onClick={requestConsultation}
              className="rounded-xl bg-gradient-to-r from-nn-primary-500 to-nn-accent-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-nn-primary-500/30 transition-all hover:shadow-xl hover:shadow-nn-primary-500/40"
            >
              Demander une consultation
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
            <div className="mb-3 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-400" />
              <h3 className="text-xl font-bold text-white">Dossier incomplet</h3>
            </div>
            <p className="text-amber-200/80">
              Complétez votre dossier avant de demander une consultation :
            </p>
            <ul className="mt-2 space-y-1 text-sm text-amber-200/80">
              {!profile.hasIdentification && <li>• Fiche d'identification à compléter</li>}
              {!profile.hasAnamnese && <li>• Fiche d'anamnèse à compléter</li>}
              {profile.completedQuestionnairesCount < 4 && (
                <li>
                  • {4 - profile.completedQuestionnairesCount} questionnaire(s) à compléter (
                  {profile.completedQuestionnairesCount}/4)
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Lien vers les questionnaires en attente */}
        {profile.pendingQuestionnairesCount > 0 && (
          <div
            onClick={() => navigate('/dashboard/questionnaires')}
            className="group cursor-pointer rounded-2xl border border-nn-primary-500/30 bg-nn-primary-500/10 p-6 transition-all hover:border-nn-primary-500/50 hover:bg-nn-primary-500/15"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-nn-primary-500/20">
                  <ClipboardList className="h-6 w-6 text-nn-primary-300" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {profile.pendingQuestionnairesCount} questionnaire(s) en attente
                  </h3>
                  <p className="text-sm text-white/60">
                    Complétez vos questionnaires pour pouvoir demander une consultation
                  </p>
                </div>
              </div>
              <ChevronRight className="h-6 w-6 text-nn-primary-400 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        )}

        {/* Fiches Identification et Anamnèse */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div
            onClick={() => navigate('/dashboard/identification')}
            className={`group relative cursor-pointer overflow-hidden rounded-3xl border p-8 transition-all ${
              profile.hasIdentification
                ? 'border-emerald-500/30 bg-emerald-500/10 hover:border-emerald-500/50 hover:bg-emerald-500/15'
                : 'border-amber-500/30 bg-amber-500/10 hover:border-amber-500/50 hover:bg-amber-500/15'
            }`}
          >
            <div className="mb-6 flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-3 flex items-center gap-3">
                  {profile.hasIdentification ? (
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  ) : (
                    <div className="relative">
                      <div className="h-8 w-8 rounded-full border-2 border-amber-400" />
                      <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-amber-400">
                        1
                      </div>
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-white">Fiche d'identification</h3>
                </div>
                <p className="mb-4 text-sm text-white/70">
                  Identité, coordonnées, sécurité sociale et contacts d'urgence
                </p>
                {profile.hasIdentification && (
                  <div className="text-sm text-emerald-400/80">✓ Complété</div>
                )}
              </div>
              <ChevronRight
                className={`h-6 w-6 transition-transform group-hover:translate-x-1 ${
                  profile.hasIdentification ? 'text-emerald-400' : 'text-amber-400'
                }`}
              />
            </div>
            <div className="space-y-1 text-sm text-white/60">
              <div>• Informations personnelles</div>
              <div>• Adresse et contacts</div>
              <div>• Numéro de sécurité sociale</div>
              <div>• Situation familiale</div>
            </div>
            <div className="mt-6">
              <div
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  profile.hasIdentification
                    ? 'bg-emerald-500/20 text-emerald-300 group-hover:bg-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 group-hover:bg-amber-500/30'
                }`}
              >
                {profile.hasIdentification ? 'Consulter / Modifier →' : 'Compléter maintenant →'}
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate('/dashboard/anamnese')}
            className={`group relative cursor-pointer overflow-hidden rounded-3xl border p-8 transition-all ${
              profile.hasAnamnese
                ? 'border-emerald-500/30 bg-emerald-500/10 hover:border-emerald-500/50 hover:bg-emerald-500/15'
                : 'border-amber-500/30 bg-amber-500/10 hover:border-amber-500/50 hover:bg-amber-500/15'
            }`}
          >
            <div className="mb-6 flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-3 flex items-center gap-3">
                  {profile.hasAnamnese ? (
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  ) : (
                    <div className="relative">
                      <div className="h-8 w-8 rounded-full border-2 border-amber-400" />
                      <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-amber-400">
                        2
                      </div>
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-white">Fiche d'anamnèse</h3>
                </div>
                <p className="mb-4 text-sm text-white/70">
                  Antécédents médicaux, traitements actuels et habitudes de vie
                </p>
                {profile.hasAnamnese && (
                  <div className="text-sm text-emerald-400/80">✓ Complété</div>
                )}
              </div>
              <ChevronRight
                className={`h-6 w-6 transition-transform group-hover:translate-x-1 ${
                  profile.hasAnamnese ? 'text-emerald-400' : 'text-amber-400'
                }`}
              />
            </div>
            <div className="space-y-1 text-sm text-white/60">
              <div>• Données anthropométriques</div>
              <div>• Antécédents médicaux et chirurgicaux</div>
              <div>• Traitements en cours</div>
              <div>• Habitudes de vie et alimentation</div>
            </div>
            <div className="mt-6">
              <div
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  profile.hasAnamnese
                    ? 'bg-emerald-500/20 text-emerald-300 group-hover:bg-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 group-hover:bg-amber-500/30'
                }`}
              >
                {profile.hasAnamnese ? 'Consulter / Modifier →' : 'Compléter maintenant →'}
              </div>
            </div>
          </div>
        </div>

        {/* Aide */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
            <FileText className="h-5 w-5 text-nn-accent-400" />
            Besoin d'aide ?
          </h3>
          <div className="space-y-2 text-sm text-white/70">
            <p>• Toutes vos informations sont sécurisées et confidentielles.</p>
            <p>• Vous pouvez modifier vos fiches à tout moment.</p>
            <p>• Seul votre praticien pourra consulter ces informations.</p>
            <p>• En cas de problème, contactez votre praticien.</p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
