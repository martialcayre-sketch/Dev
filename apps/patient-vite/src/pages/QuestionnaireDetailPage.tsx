import { DashboardShell } from '@/components/layout/DashboardShell';
import QuestionnaireStatusBanner from '@/components/questionnaires/QuestionnaireStatusBanner';
import SubmitToPractitionerButton from '@/components/questionnaires/SubmitToPractitionerButton';
import { SliderInput } from '@/components/SliderInput';
import DayFlowAlimForm from '@/features/dayflow-alim/DayFlowAlimForm';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { firestore } from '@/lib/firebase';
import { THEMES, getQuestions } from '@/questionnaires/data';
import api from '@/services/api';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { AlertTriangle, ArrowLeft, CheckCircle2, Save } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function QuestionnaireDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useFirebaseUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionnaire, setQuestionnaire] = useState<any>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [page, setPage] = useState(0);

  // Fonction stable pour générer une permutation déterministe (doit être avant toute logique conditionnelle)
  const seededPermutation = useCallback((key: string) => {
    const arr = [0, 1, 2, 3, 4];
    let h = 2166136261;
    for (let i = 0; i < key.length; i++) {
      h ^= key.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    const rng = () => {
      h ^= h << 13;
      h ^= h >>> 17;
      h ^= h << 5;
      const u = (h >>> 0) / 4294967296;
      return u;
    };
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  // DNSM: 4 pages (D,N,S,M) - Calcul stable (doit être avant tout return conditionnel)
  const questionnaireId = id || '';
  const isDNSM = questionnaireId === 'dnsm';
  const isDayFlowAlim = questionnaireId === 'alimentaire' || questionnaireId === 'nutri-assessment';
  const { themeFields, selectOrders } = useMemo(() => {
    if (!isDNSM || !questionnaireId) {
      return { themeFields: [], selectOrders: [] };
    }

    const questions = getQuestions(questionnaireId);
    const fields = THEMES.map((t) => questions.filter((q) => q.id.startsWith(t.prefix)));
    const orders = fields.map((f) => f.map((q) => seededPermutation(`${questionnaireId}:${q.id}`)));

    return { themeFields: fields, selectOrders: orders };
  }, [isDNSM, questionnaireId, seededPermutation]);

  useEffect(() => {
    (async () => {
      if (authLoading) return; // Attendre que l'auth soit chargé

      try {
        if (!user) {
          console.error('[QuestionnaireDetail] No authenticated user');
          setError('Utilisateur non connecté');
          setLoading(false);
          return;
        }
        if (!id) {
          console.error('[QuestionnaireDetail] No questionnaire ID in URL');
          setError('Identifiant du questionnaire manquant');
          setLoading(false);
          return;
        }

        // Redirection pour le questionnaire Mode de vie vers la nouvelle page dédiée
        if (id === 'life-journey') {
          console.log('[QuestionnaireDetail] Redirecting to /dashboard/life-journey');
          navigate('/dashboard/life-journey', { replace: true });
          return;
        }

        const path = `patients/${user.uid}/questionnaires/${id}`;
        console.log('[QuestionnaireDetail] Fetching:', path);
        const ref = doc(firestore, 'patients', user.uid, 'questionnaires', id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          console.error('[QuestionnaireDetail] Document not found:', path);
          console.log('[QuestionnaireDetail] User UID:', user.uid);
          console.log('[QuestionnaireDetail] Questionnaire ID:', id);
          setError(
            'Questionnaire introuvable - Vérifiez que le questionnaire existe dans Firestore'
          );
        } else {
          const q = { id: snap.id, ...snap.data() } as any;
          console.log('[QuestionnaireDetail] Loaded questionnaire:', q);
          setQuestionnaire(q);

          // Initialiser les réponses avec valeurs par défaut pour plaintes-et-douleurs
          if (id === 'plaintes-et-douleurs') {
            const defaultResponses: Record<string, any> = {};
            const questions = getQuestions(id);
            questions.forEach((question) => {
              // Si la réponse existe déjà dans Firestore, l'utiliser, sinon mettre 5 par défaut
              defaultResponses[question.id] = q.responses?.[question.id] ?? 5;
            });
            setResponses(defaultResponses);
          } else {
            setResponses(q.responses || {});
          }
        }
      } catch (e: any) {
        console.error('[QuestionnaireDetail] Error:', e);
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user, authLoading]);

  const handleSave = async (markAsCompleted: boolean = false) => {
    if (!user || !id) return;
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      // Use HTTP API for auto-save instead of direct Firestore update
      await api.saveQuestionnaireResponses(user.uid, id, responses);

      // If marking as completed, still use Firestore for now
      // TODO: Create HTTP endpoint for completion
      if (markAsCompleted) {
        const ref = doc(firestore, 'patients', user.uid, 'questionnaires', id);
        await updateDoc(ref, {
          status: 'completed',
          completedAt: serverTimestamp(),
        });

        // Marquer notification liée comme lue
        const notificationsRef = collection(firestore, 'patients', user.uid, 'notifications');
        const notifQuery = query(
          notificationsRef,
          where('questionnaireId', '==', id),
          where('read', '==', false)
        );
        const notifSnapshot = await getDocs(notifQuery);
        await Promise.all(notifSnapshot.docs.map((d) => updateDoc(d.ref, { read: true })));

        // Optionnel: enregistrer la soumission pour le praticien si practitionerId présent sur patient
        try {
          const patientRef = doc(firestore, 'patients', user.uid);
          const patientSnap = await getDoc(patientRef);
          if (patientSnap.exists() && questionnaire) {
            const pdata: any = patientSnap.data();
            if (pdata.practitionerId) {
              const submissionsRef = collection(firestore, 'questionnaireSubmissions');
              await addDoc(submissionsRef, {
                patientUid: user.uid,
                patientName:
                  `${pdata.firstname || ''} ${pdata.lastname || ''}`.trim() ||
                  pdata.email ||
                  'Patient',
                practitionerId: pdata.practitionerId,
                questionnaire: questionnaire.title,
                questionnaireId: id,
                submittedAt: new Date(),
                responses,
              });
            }
          }
        } catch (e) {
          // Non bloquant
          console.warn('Failed to record submission (non-fatal):', e);
        }
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      if (markAsCompleted) navigate('/dashboard/questionnaires');
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex justify-center py-20">
          <div className="flex items-center gap-3 text-white/60">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-nn-primary-500" />
            Chargement du questionnaire...
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (error || !questionnaire || !id) {
    // Rendu de secours pour DayFlow 360 – Alimentation, même si le document Firestore n'existe pas encore
    if (isDayFlowAlim && id) {
      return (
        <DashboardShell>
          <div className="space-y-6">
            <div>
              <button
                onClick={() => navigate('/dashboard/questionnaires')}
                className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour aux questionnaires
              </button>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">DayFlow 360 – Alimentation</h1>
                  <p className="text-white/70">
                    Évaluez vos choix alimentaires au fil de la journée. Le radar met en évidence
                    les axes à renforcer.
                  </p>
                  <p className="text-xs text-white/50 mt-2">Catégorie : Alimentation</p>
                </div>
              </div>
            </div>
            <DayFlowAlimForm onSubmitted={() => navigate('/dashboard/questionnaires')} />
          </div>
        </DashboardShell>
      );
    }
    return (
      <DashboardShell>
        <div className="space-y-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-rose-400" />
            <p className="mt-4 text-white">{error || 'Questionnaire introuvable'}</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  // Mode de vie redirige vers la page dédiée life-journey

  const handleSaveClick = (complete = false) => handleSave(complete);
  const canEdit = questionnaire.status !== 'submitted' && questionnaire.status !== 'completed';

  // DNSM specialized rendering
  if (isDNSM) {
    const handleNext = () => {
      const fields = themeFields[page];
      if (fields.some((f) => responses[f.id] === undefined)) {
        setError('Merci de répondre à toutes les questions de cette page.');
        return;
      }
      setPage((p) => p + 1);
      setError(null);
    };
    const handlePrev = () => {
      setPage((p) => p - 1);
      setError(null);
    };
    const onChange = (qid: string, value: number) =>
      setResponses((prev) => ({ ...prev, [qid]: value }));
    const scoreLabels = [
      'Non, jamais',
      'Cela arrive parfois mais rarement',
      'Parfois, de temps en temps',
      'Souvent, régulièrement',
      'Quasiment tout le temps',
    ];
    return (
      <DashboardShell>
        <div className="space-y-6">
          <div>
            <button
              onClick={() => navigate('/dashboard/questionnaires')}
              className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux questionnaires
            </button>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">{questionnaire.title}</h1>
                <p className="text-white/70">{questionnaire.description}</p>
                <p className="text-xs text-white/50 mt-2">Catégorie : {questionnaire.category}</p>
              </div>
              <QuestionnaireStatusBanner
                status={questionnaire.status}
                submittedAt={questionnaire.submittedAt}
                completedAt={questionnaire.completedAt}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="h-2 w-full rounded bg-white/10 overflow-hidden">
                <div
                  className="h-2 bg-nn-primary-500"
                  style={{ width: `${((page + 1) / 4) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-white/60">Page {page + 1} sur 4</p>
            </div>
            <button
              type="button"
              disabled={saving || !canEdit}
              onClick={() => handleSaveClick(false)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded border border-white/20 text-white/90 hover:bg-white/10 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Sauvegarder
            </button>
          </div>

          {saveSuccess && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <p className="text-sm text-emerald-200">Questionnaire sauvegardé avec succès !</p>
            </div>
          )}
          {error && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-400" />
              <p className="text-sm text-rose-200">{error}</p>
            </div>
          )}

          <div
            className={`rounded-3xl border border-white/10 bg-white/5 p-8 space-y-8 ${!canEdit ? 'opacity-60 pointer-events-none select-none' : ''}`}
          >
            {themeFields[page].map((q, idx) => (
              <div key={q.id} className="space-y-3">
                <label className="block">
                  <span className="text-sm font-semibold text-white flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-nn-primary-500/20 text-xs text-nn-primary-200">
                      {page * 10 + idx + 1}
                    </span>
                    {q.label}
                  </span>
                </label>
                <select
                  value={responses[q.id] ?? ''}
                  onChange={(e) => onChange(q.id, Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 focus:border-nn-primary-500/40 focus:outline-none focus:ring-2 focus:ring-nn-primary-500/40"
                  disabled={!canEdit}
                >
                  <option value="" disabled>
                    Choisir une réponse
                  </option>
                  {selectOrders[page][idx].map((val: number) => (
                    <option key={val} value={val}>
                      {scoreLabels[val]}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-4 items-center">
            {page > 0 && (
              <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={handlePrev}>
                Précédent
              </button>
            )}
            {page < 3 && (
              <button
                type="button"
                className="px-4 py-2 bg-black text-white rounded"
                onClick={handleNext}
                disabled={!canEdit}
              >
                Suivant
              </button>
            )}
            {page === 3 && (
              <div className="flex items-center gap-3">
                <SubmitToPractitionerButton
                  patientId={user!.uid}
                  questionnaireId={id}
                  status={questionnaire.status}
                  disabled={!canEdit}
                  onSuccess={() => navigate('/dashboard/questionnaires')}
                />
              </div>
            )}
          </div>
        </div>
      </DashboardShell>
    );
  }

  // DayFlow 360 – Alimentation specialized rendering
  if (isDayFlowAlim) {
    const friendlyTitle = 'DayFlow 360 – Alimentation';
    const friendlyCategory = 'Alimentation';
    return (
      <DashboardShell>
        <div className="space-y-6">
          <div>
            <button
              onClick={() => navigate('/dashboard/questionnaires')}
              className="mb-4 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux questionnaires
            </button>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="mb-2 text-3xl font-bold text-white">{friendlyTitle}</h1>
                <p className="text-white/70">
                  Évaluez vos choix alimentaires au fil de la journée. Le radar met en évidence les
                  axes à renforcer.
                </p>
                <p className="mt-2 text-xs text-white/50">Catégorie : {friendlyCategory}</p>
              </div>
              <QuestionnaireStatusBanner
                status={questionnaire.status}
                submittedAt={questionnaire.submittedAt}
                completedAt={questionnaire.completedAt}
              />
            </div>
          </div>

          <DayFlowAlimForm onSubmitted={() => navigate('/dashboard/questionnaires')} />
        </div>
      </DashboardShell>
    );
  }

  // Generic renderer (plaintes-et-douleurs, alimentaire)
  const questions = getQuestions(questionnaireId);
  const onChange = (qid: string, value: any) => setResponses((prev) => ({ ...prev, [qid]: value }));
  const total = questions.length;
  const answered = questions.filter(
    (q) => responses[q.id] !== undefined && responses[q.id] !== ''
  ).length;
  // Ancien handleComplete (remplacé par SubmitToPractitionerButton)

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <button
            onClick={() => navigate('/dashboard/questionnaires')}
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux questionnaires
          </button>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{questionnaire.title}</h1>
              <p className="text-white/70">{questionnaire.description}</p>
              <p className="text-xs text-white/50 mt-2">Catégorie : {questionnaire.category}</p>
            </div>
            <QuestionnaireStatusBanner
              status={questionnaire.status}
              submittedAt={questionnaire.submittedAt}
              completedAt={questionnaire.completedAt}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="h-2 w-full rounded bg-white/10 overflow-hidden">
              <div
                className="h-2 bg-nn-primary-500"
                style={{ width: `${total ? (answered / total) * 100 : 0}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-white/60">
              {answered} / {total} répondues
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={saving || !canEdit}
              onClick={() => handleSaveClick(false)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded border border-white/20 text-white/90 hover:bg-white/10 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Sauvegarder
            </button>
            <SubmitToPractitionerButton
              patientId={user!.uid}
              questionnaireId={id}
              status={questionnaire.status}
              disabled={!canEdit}
              onSuccess={() => navigate('/dashboard/questionnaires')}
            />
          </div>
        </div>

        {saveSuccess && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <p className="text-sm text-emerald-200">Questionnaire sauvegardé avec succès !</p>
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
            <p className="text-sm text-rose-200">{error}</p>
          </div>
        )}

        <div
          className={`rounded-3xl border border-white/10 bg-white/5 p-8 space-y-8 ${!canEdit ? 'opacity-60 pointer-events-none select-none' : ''}`}
        >
          {questions.map((q, idx) => {
            const isPlaintes = questionnaireId === 'plaintes-et-douleurs';
            return (
              <div key={q.id} className="space-y-3">
                {/* Utiliser le SliderInput pour plaintes-et-douleurs */}
                {isPlaintes && q.colorScheme ? (
                  <SliderInput
                    id={q.id}
                    label={q.label}
                    value={responses[q.id] ?? 5}
                    onChange={(value) => onChange(q.id, value)}
                    min={1}
                    max={10}
                    colorScheme={q.colorScheme}
                    description={q.description}
                    minLabel={q.minLabel}
                    maxLabel={q.maxLabel}
                  />
                ) : (
                  <>
                    <label className="block">
                      <span className="text-sm font-semibold text-white flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-nn-primary-500/20 text-xs text-nn-primary-200">
                          {idx + 1}
                        </span>
                        {q.label}
                      </span>
                    </label>
                    {q.scale ? (
                      <select
                        value={responses[q.id] ?? ''}
                        onChange={(e) => onChange(q.id, Number(e.target.value))}
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 focus:border-nn-primary-500/40 focus:outline-none focus:ring-2 focus:ring-nn-primary-500/40"
                        disabled={!canEdit}
                      >
                        <option value="" disabled>
                          Choisir une réponse
                        </option>
                        {[0, 1, 2, 3, 4].map((val) => (
                          <option key={val} value={val}>
                            {val}
                          </option>
                        ))}
                      </select>
                    ) : q.type === 'select' ? (
                      <select
                        value={responses[q.id] ?? ''}
                        onChange={(e) => onChange(q.id, e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 focus:border-nn-primary-500/40 focus:outline-none focus:ring-2 focus:ring-nn-primary-500/40"
                        disabled={!canEdit}
                      >
                        <option value="" disabled>
                          Choisir une réponse
                        </option>
                        {q.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : q.type === 'number' ? (
                      <input
                        type="number"
                        value={responses[q.id] ?? ''}
                        onChange={(e) =>
                          onChange(q.id, e.target.value === '' ? '' : Number(e.target.value))
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 focus:border-nn-primary-500/40 focus:outline-none focus:ring-2 focus:ring-nn-primary-500/40"
                        disabled={!canEdit}
                      />
                    ) : q.type === 'textarea' ? (
                      <textarea
                        value={responses[q.id] ?? ''}
                        onChange={(e) => onChange(q.id, e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 focus:border-nn-primary-500/40 focus:outline-none focus:ring-2 focus:ring-nn-primary-500/40"
                        rows={4}
                        disabled={!canEdit}
                      />
                    ) : (
                      <input
                        type="text"
                        value={responses[q.id] ?? ''}
                        onChange={(e) => onChange(q.id, e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 focus:border-nn-primary-500/40 focus:outline-none focus:ring-2 focus:ring-nn-primary-500/40"
                        disabled={!canEdit}
                      />
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}
