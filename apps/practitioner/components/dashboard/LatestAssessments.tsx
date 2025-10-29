"use client";

import { ClipboardList, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import type { PractitionerMetricState } from "@/hooks/usePractitionerMetrics";

export function LatestAssessments({ assessments }: { assessments: PractitionerMetricState["latestAssessments"] }) {
  const router = useRouter();

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-white/60">Dernières analyses</p>
          <h2 className="text-xl font-semibold text-white">Questionnaires complétés</h2>
        </div>
        <button
          onClick={() => router.push("/tools")}
          className="inline-flex items-center gap-2 text-sm font-medium text-nn-primary-300 hover:text-nn-primary-100"
        >
          Gérer les questionnaires
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {assessments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/5 px-4 py-5 text-white/60">
            Aucun questionnaire complété récemment.
          </div>
        ) : (
          assessments.map((assessment) => (
            <div
              key={assessment.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-4 transition hover:border-nn-accent-500/40 hover:bg-nn-accent-500/10"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-nn-accent-100">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{assessment.patientName}</p>
                  <p className="text-xs text-white/60">{assessment.questionnaire || "Questionnaire"}</p>
                </div>
              </div>
              <div className="text-right text-xs text-white/50">
                <p>{formatDistanceToNow(assessment.submittedAt, { locale: fr, addSuffix: true })}</p>
                {assessment.score !== undefined ? (
                  <p className="font-semibold text-nn-accent-200">Score : {assessment.score}</p>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
