"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/src/lib/firebase";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"checking" | "authed" | "anon">("checking");
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (u) setStatus("authed"); else setStatus("anon");
    });
  }, []);

  if (status === "checking") return <p>Chargement…</p>;
  if (status === "anon") {
    if (typeof window !== "undefined") window.location.href = "/signin";
    return null;
  }
  return <>{children}</>;
}

