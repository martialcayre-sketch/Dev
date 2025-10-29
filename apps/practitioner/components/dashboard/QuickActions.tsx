"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, ClipboardPlus, FileOutput, Salad, Send, UsersRound } from "lucide-react";

const actions = [
  {
    label: "Créer un patient",
    description: "Enregistrer rapidement un nouveau profil",
    icon: UsersRound,
    href: "/patients/create",
    color: "from-nn-primary-500/30 to-nn-primary-500/10 text-nn-primary-100",
  },
  {
    label: "Lancer un DNSM",
    description: "Évaluation nutritionnelle complète",
    icon: ClipboardPlus,
    href: "/tools/questionnaires/dnsm",
    color: "from-nn-accent-500/30 to-nn-accent-500/10 text-nn-accent-100",
  },
  {
    label: "Plan 21 jours",
    description: "Générer un protocole personnalisé",
    icon: Salad,
    href: "/plans/create",
    color: "from-rose-500/30 to-rose-500/10 text-rose-100",
  },
  {
    label: "Envoyer un compte rendu",
    description: "Partager un PDF dynamique",
    icon: Send,
    href: "/documents/send",
    color: "from-sky-500/30 to-sky-500/10 text-sky-100",
  },
  {
    label: "Exporter les données",
    description: "Partager avec un autre praticien",
    icon: FileOutput,
    href: "/analytics/export",
    color: "from-amber-500/30 to-amber-500/10 text-amber-100",
  },
];

export function QuickActions() {
  const router = useRouter();

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-white/60">Actions rapides</p>
          <h2 className="text-xl font-semibold text-white">Gagner du temps</h2>
        </div>
        <ArrowRight className="hidden h-6 w-6 text-white/40 md:block" />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => router.push(action.href)}
            className={`group flex w-full flex-col items-start gap-3 rounded-xl border border-white/10 bg-gradient-to-br ${action.color} px-4 py-4 text-left transition hover:border-white/30 hover:bg-white/10`}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10">
              <action.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{action.label}</p>
              <p className="text-xs text-white/60">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
