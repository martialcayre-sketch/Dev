import { NotificationBell } from '@/components/NotificationBell';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { auth } from '@/lib/firebase';
import { LogOut, UserCircle2 } from 'lucide-react';

export function Header() {
  const { user } = useFirebaseUser();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-slate-950/70 px-4 py-4 backdrop-blur-xl lg:px-8">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold text-white lg:hidden">🧠 NeuroNutrition</h1>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {user?.uid && <NotificationBell userId={user.uid} />}
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white backdrop-blur-sm">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Avatar" className="h-9 w-9 rounded-xl object-cover" />
          ) : (
            <UserCircle2 className="h-9 w-9 text-white/40" />
          )}
          <div className="hidden md:block">
            <p className="text-xs uppercase tracking-wide text-white/50">Patient</p>
            <p className="text-sm font-medium text-white">
              {user?.displayName ?? user?.email ?? 'Compte'}
            </p>
          </div>
          <button
            onClick={() => auth.signOut()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
            aria-label="Se déconnecter"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
