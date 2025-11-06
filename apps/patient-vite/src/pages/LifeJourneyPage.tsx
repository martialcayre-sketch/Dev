import { DashboardShell } from '@/components/layout/DashboardShell';
import LifeJourney7Spheres from '@/components/SIIN/LifeJourney7Spheres';
import { submitLifeJourney } from '@/features/lifejourney/submit';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LifeJourneyPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(result: any) {
    try {
      setSubmitting(true);
      setError(null);
      await submitLifeJourney(result);
      console.log('[LifeJourneyPage] Submission OK');
      setSuccess(true);
      // Redirection après 2 secondes pour laisser voir le message de succès
      setTimeout(() => {
        navigate('/dashboard/questionnaires');
      }, 2000);
    } catch (e: any) {
      setError(e?.message || String(e));
      console.error('[LifeJourneyPage] Submission failed:', e);
    } finally {
      setSubmitting(false);
    }
  }

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
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-white">Mode de vie – 7 Sphères Vitales</h1>
            <p className="text-white/70">
              Évaluez votre mode de vie selon 7 dimensions clés : sommeil, rythme, stress, activité
              physique, toxiques, relations sociales et alimentation.
            </p>
            <p className="text-xs text-white/50">Catégorie : Mode de vie SIIN</p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            ✓ Questionnaire enregistré avec succès ! Redirection en cours...
          </div>
        )}

        <LifeJourney7Spheres onSubmit={handleSubmit} disabled={submitting || success} />

        {submitting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="rounded-2xl border border-white/10 bg-slate-950 p-6 text-center shadow-xl">
              <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-nn-primary-500" />
              <p className="text-white">Enregistrement en cours…</p>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
