import { DashboardShell } from '@/components/layout/DashboardShell';
import { MailPlus } from 'lucide-react';

export default function PatientsInvitationsPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-nn-primary-500/20 p-2 text-nn-primary-200">
            <MailPlus className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/60">Invitations</p>
            <h1 className="text-2xl font-semibold text-white">Invitations patients</h1>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-white/70">
            Cette page listera les invitations envoyées et leur statut. (À implémenter)
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
