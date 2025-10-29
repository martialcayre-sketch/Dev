'use client';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { collection, getDocs, type DocumentData } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { auth, db } from '@/lib/firebase/client';

export default function PatientSignupPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [practitioner, setPractitioner] = useState('');
  const [options, setOptions] = useState<Array<{ id: string; username?: string; label: string }>>(
    []
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setError(null);
  }, [email, username, password, confirm]);

  useEffect(() => {
    (async () => {
      // Prefer practitioners collection if present; fall back to users where role==practitioner
      const tryCollections = async () => {
        try {
          const pSnap = await getDocs(collection(db, 'practitioners'));
          if (!pSnap.empty) {
            const arr = pSnap.docs.map((d) => ({
              id: d.id,
              username: (d.data() as DocumentData).username as string | undefined,
              label: ((d.data() as DocumentData).username as string | undefined) || d.id,
            }));
            setOptions(arr);
            setPractitioner(arr[0]?.username || arr[0]?.id || '');
            return;
          }
        } catch {
          // ignore and fallback
        }
        // fallback
        try {
          const uSnap = await getDocs(collection(db, 'users'));
          const arr = uSnap.docs
            .map((d) => ({
              id: d.id,
              label:
                ((d.data() as DocumentData).displayName as string | undefined) ||
                ((d.data() as DocumentData).email as string | undefined) ||
                d.id,
            }))
            .filter(() => true);
          setOptions(arr);
          setPractitioner(arr[0]?.id || '');
        } catch {
          // ignore
        }
      };
      await tryCollections();
    })();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setError('Email invalide');
    if (password.length < 8) return setError('Mot de passe min. 8 caractères');
    if (password !== confirm) return setError('Les mots de passe ne correspondent pas');
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await fetch('/api/patient/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: cred.user.uid,
          email,
          username,
          practitionerUsername: practitioner,
          displayName,
        }),
      });
      await sendEmailVerification(cred.user);
      setMessage('Compte créé. Vérifiez votre email pour valider votre compte.');
      setTimeout(() => router.push('/patient/login'), 1500);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "Échec de l'inscription";
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Créer un compte Patient</CardTitle>
          <CardDescription>
            Un email de vérification est obligatoire avant toute approbation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-700">{message}</p>}
          <form onSubmit={onSubmit} className="space-y-3">
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Nom affiché"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <select
              className="w-full border rounded px-3 py-2"
              value={practitioner}
              onChange={(e) => setPractitioner(e.target.value)}
            >
              <option value="">-- Sélectionner un praticien --</option>
              {options.map((o) => (
                <option key={o.id} value={o.username || o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            <input
              className="w-full border rounded px-3 py-2"
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              className="w-full border rounded px-3 py-2"
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" required />
              <span>J&apos;accepte les CGU</span>
            </label>
            <button className="w-full bg-blue-600 text-white rounded py-2">S&apos;inscrire</button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
