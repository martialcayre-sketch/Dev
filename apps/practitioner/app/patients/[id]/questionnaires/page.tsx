"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { firestore as db } from "@/lib/firebase";

export default function PatientQuestionnairesPage() {
  const params = useParams();
  const patientId = (params as any)?.id as string;
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const snap = await getDoc(doc(db, "patients", patientId));
        if (!cancelled) setPatient(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      } catch {
        if (!cancelled) setError("Impossible de charger le patient");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (patientId) load();
    return () => { cancelled = true; };
  }, [patientId]);

  if (loading) return <div className="p-6">Chargement…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Questionnaires du patient</h1>
      <p className="text-sm text-white/70 mt-2">ID: {patientId}</p>
      {patient ? (
        <div className="mt-4 rounded-lg border border-white/10 p-4">Profil chargé.</div>
      ) : (
        <div className="mt-4 text-white/70">Aucun profil trouvé.</div>
      )}
      <div className="mt-6 text-white/70">Listing des réponses: à implémenter.</div>
    </div>
  );
}
