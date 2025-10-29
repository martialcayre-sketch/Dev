"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { StatCard } from "@/components/ui/StatCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { UpcomingConsultations } from "@/components/dashboard/UpcomingConsultations";
import { LatestAssessments } from "@/components/dashboard/LatestAssessments";
import { QuestionnaireLibrary } from "@/components/dashboard/QuestionnaireLibrary";
import { useFirebaseUser } from "@/hooks/useFirebaseUser";
import { usePractitionerMetrics } from "@/hooks/usePractitionerMetrics";
import { Brain, Activity, Sparkles, UsersRound } from "lucide-react";

export default function DashboardPage() {
  const { user } = useFirebaseUser();
  const { metrics, loading } = usePractitionerMetrics(user?.uid);

  return (
    <DashboardShell>
      <section className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-nn-primary-500/25 via-nn-primary-500/5 to-transparent p-8 text-white shadow-2xl shadow-nn-primary-500/10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/70">Bonjour {user?.displayName ?? user?.email}</p>
              <h1 className="mt-3 text-3xl font-semibold">
                Pilotons votre accompagnement neuro-nutritionnel.
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-white/70">
                Retrouvez vos consultations du jour, les alertes patient, les questionnaires complétés et accédez à vos outils personnalisés en un seul coup d'œil.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-sm text-white/80 backdrop-blur">
              <Sparkles className="h-6 w-6 text-nn-accent-200" />
              <div>
                <p className="text-xs uppercase tracking-widest text-white/60">IA NeuroCoach</p>
                <p>2 recommandations intelligentes prêtes à valider</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={UsersRound}
            label="Patients actifs"
            value={loading ? "–" : metrics.totalPatients}
            helper="Dans votre accompagnement actuellement"
            variant="primary"
          />
          <StatCard
            icon={Activity}
            label="Suivi prioritaire"
            value={loading ? "–" : metrics.patientsNeedingAttention}
            helper="Alertes cliniques à traiter"
            variant="accent"
          />
          <StatCard
            icon={Brain}
            label="Bilans complétés"
            value={loading ? "–" : metrics.latestAssessments.length}
            helper="Sur les 7 derniers jours"
            variant="neutral"
          />
          <StatCard
            icon={Sparkles}
            label="Programmes actifs"
            value="6"
            helper="Plans et protocoles en cours"
            variant="neutral"
          />
        </div>

        <QuickActions />

        <div className="grid gap-6 lg:grid-cols-2">
          <UpcomingConsultations consultations={metrics.upcomingConsultations} />
          <LatestAssessments assessments={metrics.latestAssessments} />
        </div>

        <QuestionnaireLibrary />
      </section>
    </DashboardShell>
  );
}