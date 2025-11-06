import { DashboardShell } from '@/components/layout/DashboardShell';
import { Salad } from 'lucide-react';

export default function PlanCreatePage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
          <Salad className="h-7 w-7 text-nn-accent-300" /> Nouveau plan 21 jours
        </h1>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-white/70">
          Générateur de protocole – en cours de migration.
        </div>
      </div>
    </DashboardShell>
  );
}
