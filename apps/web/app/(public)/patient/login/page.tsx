'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import ApprovalPending from '@/components/ApprovalPending';
import EmailNotVerified from '@/components/EmailNotVerified';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { signInWithEmailOrUsername, sendEmailVerification } from '@/lib/auth-client';

export default function PatientLoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [approved, setApproved] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const search = useSearchParams();
  const router = useRouter();

  const reason = search.get('reason');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailOrUsername(identifier, password);
      setChecking(true);
      const res = await fetch('/api/patient/check-status');
      const data = await res.json();
      setEmailVerified(data.emailVerified);
      setApproved(data.approvedByPractitioner);
      if (data.emailVerified && data.approvedByPractitioner) {
        router.push('/patient/dashboard');
      }
    } catch (err: any) {
      setError(err?.message ?? 'Connexion impossible');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Espace Patient</CardTitle>
          <CardDescription>Accès réservé aux patients vérifiés et approuvés.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {reason === 'email-not-verified' && (
            <p className="text-sm text-amber-700 bg-amber-50 p-2 rounded">
              Email non vérifié — vérifiez votre messagerie.
            </p>
          )}
          {reason === 'approval-pending' && (
            <p className="text-sm text-amber-700 bg-amber-50 p-2 rounded">
              Approbation praticien en attente.
            </p>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {emailVerified === false && (
            <EmailNotVerified onResend={async () => sendEmailVerification()} />
          )}
          {emailVerified && approved === false && <ApprovalPending />}
          <form onSubmit={onSubmit} className="space-y-3">
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Email ou nom d'utilisateur"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            <input
              className="w-full border rounded px-3 py-2"
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button disabled={checking} className="w-full bg-blue-600 text-white rounded py-2">
              Se connecter
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
