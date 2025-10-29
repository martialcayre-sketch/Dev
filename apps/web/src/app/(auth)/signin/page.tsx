"use client";
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";
import { auth } from "@/src/lib/firebase";
import { FormEvent, useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [remember, setRemember] = useState(true);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "/dashboard";
    } catch (e: any) {
      setErr(e?.message ?? "Erreur d’authentification");
    }
  };

  return (
    <div className="max-w-sm">
      <h2 className="text-2xl font-semibold mb-4">Se connecter</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border px-3 py-2 rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border px-3 py-2 rounded" placeholder="Mot de passe" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} />
          Rester connecté
        </label>
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button className="px-3 py-2 bg-black text-white rounded" type="submit">Continuer</button>
      </form>
    </div>
  );
}
