"use client";
import RequireAuth from "@/src/components/RequireAuth";
import { auth } from "@/src/lib/firebase";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  useEffect(() => {
    const run = async () => {
      const u = auth.currentUser;
      if (!u) return setIsAdmin(false);
      const token = await u.getIdTokenResult();
      setIsAdmin(token.claims?.admin === true);
    };
    run();
  }, []);

  return (
    <RequireAuth>
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Admin</h2>
        {isAdmin === null && <p>Vérification des droits…</p>}
        {isAdmin === false && <p>Accès refusé. Demandez à un administrateur de vous accorder le rôle.</p>}
        {isAdmin === true && (
          <div className="space-y-2">
            <p>Accès admin confirmé.</p>
            <p>Placeholders CRUD Firestore à implémenter.</p>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
