"use client";
import { signOut } from "firebase/auth";
import { auth } from "@/src/lib/firebase";
import RequireAuth from "@/src/components/RequireAuth";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <RequireAuth>
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Tableau de bord</h2>
        <div className="grid gap-3">
          <Link className="underline" href="/profile">Profil</Link>
          <Link className="underline" href="/questionnaires">Questionnaires (par catégorie)</Link>
          <Link className="underline" href="/admin">Espace admin</Link>
        </div>
        <button className="px-3 py-2 border rounded" onClick={() => signOut(auth)}>Se déconnecter</button>
      </div>
    </RequireAuth>
  );
}
