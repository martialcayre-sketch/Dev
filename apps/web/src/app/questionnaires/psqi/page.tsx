"use client";
import RequireAuth from "@/src/components/RequireAuth";
import { addIntake } from "@/src/lib/firestore";
import { useState } from "react";

export default function PSQIPage() {
  const [score, setScore] = useState(0);
  const [saved, setSaved] = useState<string | null>(null);
  const submit = async () => {
    setSaved(null);
    await addIntake('PSQI', { score });
    setSaved('Réponses enregistrées');
  };
  return (
    <RequireAuth>
      <div className="max-w-md space-y-3">
        <h2 className="text-2xl font-semibold">Questionnaire PSQI (placeholder)</h2>
        <label className="block">Score
          <input type="number" className="w-full border px-3 py-2 rounded" value={score} onChange={e=>setScore(parseInt(e.target.value||'0'))} />
        </label>
        <button className="px-3 py-2 bg-black text-white rounded" onClick={submit}>Soumettre</button>
        {saved && <p className="text-green-700 text-sm">{saved}</p>}
      </div>
    </RequireAuth>
  );
}

