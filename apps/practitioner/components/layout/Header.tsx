"use client";

import { auth } from "@/lib/firebase";
import { useFirebaseUser } from "@/hooks/useFirebaseUser";
import { Bell, LogOut, Plus, Search, Settings, UserCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Header() {
  const router = useRouter();
  const { user } = useFirebaseUser();
  const [search, setSearch] = useState("");

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-slate-950/70 px-4 py-4 backdrop-blur-xl lg:px-8">
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un patient, un protocole, un document..."
            className="w-72 rounded-xl border border-white/10 bg-white/5 px-10 py-2 text-sm text-white placeholder:text-white/40 focus:border-nn-primary-500/40 focus:outline-none focus:ring-2 focus:ring-nn-primary-500/40"
          />
        </div>
        <button
          type="button"
          className="md:hidden inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white"
        >
          <Search className="h-4 w-4" />
          <span>Rechercher</span>
        </button>
        <button
          onClick={() => router.push("/patients/create")}
          className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-nn-primary-500 to-nn-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-nn-primary-500/30 transition hover:from-nn-primary-400 hover:to-nn-accent-400"
        >
          <Plus className="h-4 w-4" />
          Nouveau patient
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button className="group relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white">
            3
          </span>
        </button>
        <button
          onClick={() => router.push("/settings")}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
        >
          <Settings className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Avatar" className="h-9 w-9 rounded-xl object-cover" />
          ) : (
            <UserCircle2 className="h-9 w-9 text-white/60" />
          )}
          <div className="hidden md:block">
            <p className="text-xs uppercase tracking-wide text-white/50">Praticien</p>
            <p className="text-sm font-medium text-white">{user?.displayName ?? user?.email ?? "Compte"}</p>
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
