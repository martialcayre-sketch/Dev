import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { auth, db } from '../lib/firebase';
import { approvePatient, rejectPatient } from '../services/approvalService';

interface PatientItem {
  uid: string;
  email: string;
  displayName?: string;
}

export default function PractitionerApprovals() {
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
      setPatients(
        snap.docs.map((d) => ({
          uid: d.id,
          email: (d.data() as { email?: string; displayName?: string }).email ?? '',
          displayName: (d.data() as { email?: string; displayName?: string }).displayName,
        }))
      );
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const f = filter.toLowerCase();
    return patients.filter(
      (p) => p.email.toLowerCase().includes(f) || (p.displayName || '').toLowerCase().includes(f)
    );
  }, [filter, patients]);

  const doApprove = async (uid: string) => {
    try {
      // Optimistic UI
      setPatients((prev) => prev.filter((p) => p.uid !== uid));
      await approvePatient(uid);
      toast.success('Patient approuvé');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur approbation';
      toast.error(message);
    }
  };

  const doReject = async (uid: string) => {
    try {
      setPatients((prev) => prev.filter((p) => p.uid !== uid));
      await rejectPatient(uid);
      toast('Patient rejeté');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur rejet';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold mb-4">Approbations en attente</h1>
        <Input
          placeholder="Rechercher..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <ul className="mt-4 divide-y">
          {filtered.map((p) => (
            <li key={p.uid} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{p.displayName || 'Patient'}</div>
                <div className="text-sm text-gray-600">{p.email}</div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => doApprove(p.uid)}>Approuver</Button>
                <Button variant="secondary" onClick={() => doReject(p.uid)}>
                  Rejeter
                </Button>
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="py-6 text-center text-gray-500">Aucun patient en attente</li>
          )}
        </ul>
      </div>
    </div>
  );
}
