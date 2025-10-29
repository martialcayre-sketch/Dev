"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useFirebaseUser } from "@/hooks/useFirebaseUser";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useFirebaseUser();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-nn-primary-500" />
          <p className="text-sm font-medium text-white/70">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900/60 to-slate-950 px-4 py-6 sm:px-6 lg:px-10">
          <div className="mx-auto w-full max-w-6xl space-y-6 pb-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
