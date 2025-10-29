"use client";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/src/lib/firebase";
import { FormEvent, useState } from "react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) await updateProfile(cred.user, { displayName });
      window.location.href = "/dashboard";
    } catch (e: any) {
      setErr(e?.message ?? "Erreur d’inscription");
    }
  };

  return (
    <div className="max-w-sm">
      <h2 className="text-2xl font-semibold mb-4">Créer un compte</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border px-3 py-2 rounded" placeholder="Nom" value={displayName} onChange={e=>setDisplayName(e.target.value)} />
        <input className="w-full border px-3 py-2 rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border px-3 py-2 rounded" placeholder="Mot de passe" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button className="px-3 py-2 bg-black text-white rounded" type="submit">Créer</button>
      </form>
    </div>
  );
}

