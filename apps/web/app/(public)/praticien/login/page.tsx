'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { signInWithEmailOrUsername } from '@/lib/auth-client';

export default function PractitionerLoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const search = useSearchParams();
  const reason = search.get('reason');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailOrUsername(identifier, password);
      router.push('/praticien/dashboard');
    } catch (err: any) {
      setError(err?.message ?? 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md space-y-4">
        <CardHeader>
          <CardTitle>Espace Praticien</CardTitle>
          <CardDescription>Connectez-vous pour gérer vos patients.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {reason && (
            <p className="text-sm text-amber-700 bg-amber-50 p-2 rounded">
              Accès protégé — veuillez vous connecter.
            </p>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
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
            <button className="w-full bg-blue-600 text-white rounded py-2">Se connecter</button>
          </form>
          <div className="text-sm text-gray-600">
            <Link href="/welcome" className="underline">
              Retour
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
