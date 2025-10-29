"use client";
import RequireAuth from "@/src/components/RequireAuth";
import { addIntake } from "@/src/lib/firestore";
import { useState } from "react";

export default function QuestionnaireContextuelModeDeVie() {
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  const submit = async () => {
    setSaved(null);
    await addIntake('MODE_DE_VIE_CONTEXTUEL', { notes });
    setSaved('Réponses enregistrées');
  };
  return (
    <RequireAuth>
      <div className="max-w-md space-y-3">
        <h2 className="text-2xl font-semibold">Questionnaire contextuel mode de vie</h2>
        <textarea className="w-full border px-3 py-2 rounded" rows={8} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Décrivez le contexte (travail, rythme, environnement, contraintes)…" />
        <button className="px-3 py-2 bg-black text-white rounded" onClick={submit}>Soumettre</button>
        {saved && <p className="text-green-700 text-sm">{saved}</p>}
      </div>
    </RequireAuth>
  );
}

