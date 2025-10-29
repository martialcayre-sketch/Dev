'use client';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useEffect, useMemo, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { auth, db, functions } from '@/lib/firebase/client';

type PatientItem = { uid: string; email?: string; displayName?: string };

export default function ApprovalsPage() {
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'patient'),
      where('approvalStatus', '==', 'pending'),
      where('chosenPractitionerId', '==', uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      setPatients(snap.docs.map((d) => ({ uid: d.id, ...(d.data() as any) })));
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const f = filter.toLowerCase();
    return patients.filter(
      (p) =>
        (p.email || '').toLowerCase().includes(f) || (p.displayName || '').toLowerCase().includes(f)
    );
  }, [filter, patients]);

  const callApprove = httpsCallable<
    { patientUid: string; decision: 'approved' | 'rejected' },
    { ok: boolean }
  >(functions, 'approvePatient');

  const approve = async (uid: string) => {
    setPatients((prev) => prev.filter((p) => p.uid !== uid));
    await callApprove({ patientUid: uid, decision: 'approved' });
  };
  const reject = async (uid: string) => {
    setPatients((prev) => prev.filter((p) => p.uid !== uid));
    await callApprove({ patientUid: uid, decision: 'rejected' });
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Approbations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Rechercher..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            {filtered.length === 0 && <p className="text-gray-600">Aucun patient en attente.</p>}
            <ul className="space-y-2">
              {filtered.map((p) => (
                <li key={p.uid} className="border rounded p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{p.displayName || 'Patient'}</p>
                    <p className="text-sm text-gray-600">{p.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 rounded bg-green-600 text-white"
                      onClick={() => approve(p.uid)}
                    >
                      Approuver
                    </button>
                    <button
                      className="px-3 py-1 rounded bg-red-600 text-white"
                      onClick={() => reject(p.uid)}
                    >
                      Refuser
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
