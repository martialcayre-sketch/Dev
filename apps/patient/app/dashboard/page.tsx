'use client';

import { useRouter } from 'next/navigation';
import { auth, firestore } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function PatientDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/');
      } else {
        setUser(currentUser);
        fetchPatientData(currentUser.uid);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const fetchPatientData = async (uid: string) => {
    try {
      const patientDoc = await getDoc(doc(firestore, 'patients', uid));
      if (patientDoc.exists()) {
        setPatientData(patientDoc.data());
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Chargement...</div>;
  }

  if (!user) return null;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Mon Espace Patient</h1>
        <button onClick={() => auth.signOut()} style={{ padding: '0.5rem 1rem', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Déconnexion
        </button>
      </div>
      
      {patientData && (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <h2>Bonjour {patientData.firstname} {patientData.lastname}</h2>
          <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>Email: {user.email}</p>
          <p style={{ color: '#6b7280' }}>Statut: 
            <span style={{ marginLeft: '0.5rem', padding: '0.25rem 0.75rem', backgroundColor: patientData.status === 'approved' ? '#dcfce7' : '#fef3c7', borderRadius: '9999px', fontSize: '0.875rem' }}>
              {patientData.status === 'approved' ? 'Compte activé' : 'En attente'}
            </span>
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        <div style={{ padding: '1.5rem', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          <h3>Mes Questionnaires</h3>
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>Aucun questionnaire disponible</p>
        </div>
        <div style={{ padding: '1.5rem', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          <h3>Mes Rendez-vous</h3>
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>Aucun rendez-vous prévu</p>
        </div>
      </div>
    </div>
  );
}