"use client";

import { useState, useEffect } from "react";
import { collection, query, getDocs, doc, updateDoc, orderBy } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useFirebaseUser } from "@/hooks/useFirebaseUser";
import { useRouter } from "next/navigation";

interface PractitionerData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  status: "pending_approval" | "approved" | "rejected";
  createdAt: any;
  role: string;
}

export default function AdminPractitionersPage() {
  const { user, loading: userLoading } = useFirebaseUser();
  const router = useRouter();
  const [practitioners, setPractitioners] = useState<PractitionerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login");
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (!user) return;

    const loadPractitioners = async () => {
      try {
        const q = query(
          collection(firestore, "practitioners"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        })) as PractitionerData[];
        setPractitioners(data);
      } catch (error) {
        console.error("Erreur chargement praticiens:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPractitioners();
  }, [user]);

  const handleApprove = async (uid: string) => {
    setActionLoading(uid);
    try {
      await updateDoc(doc(firestore, "practitioners", uid), {
        status: "approved",
        approvedAt: new Date(),
      });
      setPractitioners((prev) =>
        prev.map((p) => (p.uid === uid ? { ...p, status: "approved" } : p))
      );
      alert("Praticien approuvé avec succès !");
    } catch (error) {
      console.error("Erreur approbation:", error);
      alert("Erreur lors de l'approbation");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (uid: string) => {
    if (!confirm("Êtes-vous sûr de vouloir rejeter ce praticien ?")) return;
    
    setActionLoading(uid);
    try {
      await updateDoc(doc(firestore, "practitioners", uid), {
        status: "rejected",
        rejectedAt: new Date(),
      });
      setPractitioners((prev) =>
        prev.map((p) => (p.uid === uid ? { ...p, status: "rejected" } : p))
      );
      alert("Praticien rejeté");
    } catch (error) {
      console.error("Erreur rejet:", error);
      alert("Erreur lors du rejet");
    } finally {
      setActionLoading(null);
    }
  };

  if (userLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const pending = practitioners.filter((p) => p.status === "pending_approval");
  const approved = practitioners.filter((p) => p.status === "approved");
  const rejected = practitioners.filter((p) => p.status === "rejected");

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des praticiens</h1>
          <p className="mt-2 text-gray-600">
            Approuvez ou rejetez les demandes d'inscription des praticiens
          </p>
        </div>

        {/* En attente */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            En attente d'approbation ({pending.length})
          </h2>
          {pending.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
              Aucun praticien en attente
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map((practitioner) => (
                <div
                  key={practitioner.uid}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    {practitioner.photoURL && (
                      <img
                        src={practitioner.photoURL}
                        alt={practitioner.displayName}
                        className="h-12 w-12 rounded-full"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {practitioner.displayName || "Sans nom"}
                      </h3>
                      <p className="text-sm text-gray-600">{practitioner.email}</p>
                      <p className="text-xs text-gray-400">
                        Inscrit le{" "}
                        {practitioner.createdAt?.toDate
                          ? practitioner.createdAt.toDate().toLocaleDateString("fr-FR")
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(practitioner.uid)}
                      disabled={actionLoading === practitioner.uid}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {actionLoading === practitioner.uid ? "..." : "Approuver"}
                    </button>
                    <button
                      onClick={() => handleReject(practitioner.uid)}
                      disabled={actionLoading === practitioner.uid}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {actionLoading === practitioner.uid ? "..." : "Rejeter"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approuvés */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Approuvés ({approved.length})
          </h2>
          {approved.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
              Aucun praticien approuvé
            </div>
          ) : (
            <div className="space-y-4">
              {approved.map((practitioner) => (
                <div
                  key={practitioner.uid}
                  className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-6"
                >
                  <div className="flex items-center gap-4">
                    {practitioner.photoURL && (
                      <img
                        src={practitioner.photoURL}
                        alt={practitioner.displayName}
                        className="h-12 w-12 rounded-full"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {practitioner.displayName || "Sans nom"}
                      </h3>
                      <p className="text-sm text-gray-600">{practitioner.email}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                    Approuvé
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rejetés */}
        {rejected.length > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Rejetés ({rejected.length})
            </h2>
            <div className="space-y-4">
              {rejected.map((practitioner) => (
                <div
                  key={practitioner.uid}
                  className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-6"
                >
                  <div className="flex items-center gap-4">
                    {practitioner.photoURL && (
                      <img
                        src={practitioner.photoURL}
                        alt={practitioner.displayName}
                        className="h-12 w-12 rounded-full"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {practitioner.displayName || "Sans nom"}
                      </h3>
                      <p className="text-sm text-gray-600">{practitioner.email}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                    Rejeté
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
