"use client";

import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-nn-primary-500" />
          <p className="text-sm text-white/70">Chargement de votre espace praticien...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-950 text-white">
      <div className="flex flex-col items-center gap-2 rounded-3xl border border-white/10 bg-white/10 px-6 py-8 text-center shadow-xl shadow-nn-primary-500/10">
        <p className="text-sm uppercase tracking-[0.4em] text-white/60">NeuroNutrition</p>
        <h1 className="text-2xl font-semibold">Redirection en cours...</h1>
        <p className="max-w-xs text-sm text-white/60">
          Nous préparons votre tableau de bord personnalisé, un instant.
        </p>
      </div>
    </div>
  );
}
