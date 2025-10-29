"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";

export default function InvitePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) return <div>Chargement...</div>;
  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const functions = getFunctions();
      const invitePatient = httpsCallable(functions, "invitePatient");
      await invitePatient({ email, phone, firstname, lastname });
      setMessage("Invitation envoyée avec succès!");
      setEmail("");
      setPhone("");
      setFirstname("");
      setLastname("");
    } catch (error: any) {
      setMessage("Erreur: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Inviter un patient</h1>
      <form onSubmit={handleSubmit} style={{ marginTop: "2rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>Prénom *</label>
          <input type="text" value={firstname} onChange={(e) => setFirstname(e.target.value)} required style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "4px" }} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>Nom *</label>
          <input type="text" value={lastname} onChange={(e) => setLastname(e.target.value)} required style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "4px" }} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>Email *</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "4px" }} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>Téléphone *</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "4px" }} />
        </div>
        {message && <div style={{ padding: "1rem", marginBottom: "1rem", backgroundColor: message.includes("succès") ? "#dcfce7" : "#fee2e2", borderRadius: "4px" }}>{message}</div>}
        <div style={{ display: "flex", gap: "1rem" }}>
          <button type="submit" disabled={submitting} style={{ padding: "0.75rem 1.5rem", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "4px", cursor: submitting ? "not-allowed" : "pointer" }}>
            {submitting ? "Envoi..." : "Envoyer l'invitation"}
          </button>
          <button type="button" onClick={() => router.push("/dashboard")} style={{ padding: "0.75rem 1.5rem", backgroundColor: "#6b7280", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Retour
          </button>
        </div>
      </form>
    </div>
  );
}