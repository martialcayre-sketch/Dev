'use client';

import { sendSignInLinkToEmail } from 'firebase/auth';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase/config';

export default function MagicLinkPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const actionCodeSettings = {
    url: 'http://localhost:3000',
    handleCodeInApp: true,
  };

  const sendLink = async () => {
    try {
      await sendSignInLinkToEmail(auth!, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setSent(true);
    } catch (err) {
      setError("Impossible d'envoyer le lien.");
    }
  };

  return (
    <div className="grid gap-4">
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input"
      />
      <Button type="button" onClick={sendLink} className="w-full">
        Envoyer le lien magique
      </Button>
      {sent && <p className="text-sm text-green-600">Lien envoyé — vérifiez votre boîte mail.</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
