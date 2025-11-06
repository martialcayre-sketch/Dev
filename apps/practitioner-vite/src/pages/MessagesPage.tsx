import { DashboardShell } from '@/components/layout/DashboardShell';
import { MessagesSquare } from 'lucide-react';

export default function MessagesPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <MessagesSquare className="h-7 w-7 text-nn-accent-400" /> Messagerie
          </h1>
          <p className="text-white/70">Échanges sécurisés avec vos patients.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-white/70">
          Page en cours de migration.
        </div>
      </div>
    </DashboardShell>
  );
}
