"use client";
import RequireAuth from "@/src/components/RequireAuth";
import { addIntake } from "@/src/lib/firestore";
import { useState } from "react";

export default function DNSMPage() {
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  const submit = async () => {
    setSaved(null);
    await addIntake('DNSM', { notes });
    setSaved('Réponses enregistrées');
  };
  return (
    <RequireAuth>
      <div className="max-w-md space-y-3">
        <h2 className="text-2xl font-semibold">Questionnaire DNSM (placeholder)</h2>
        <textarea className="w-full border px-3 py-2 rounded" rows={6} value={notes} onChange={e=>setNotes(e.target.value)} />
        <button className="px-3 py-2 bg-black text-white rounded" onClick={submit}>Soumettre</button>
        {saved && <p className="text-green-700 text-sm">{saved}</p>}
      </div>
    </RequireAuth>
  );
}

