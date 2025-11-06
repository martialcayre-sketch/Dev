import { DashboardShell } from '@/components/layout/DashboardShell';
import { UsersRound } from 'lucide-react';

export default function PatientCreatePage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
          <UsersRound className="h-7 w-7 text-nn-primary-300" /> Créer un patient
        </h1>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-white/70">
          Formulaire de création – en cours de migration.
        </div>
      </div>
    </DashboardShell>
  );
}
