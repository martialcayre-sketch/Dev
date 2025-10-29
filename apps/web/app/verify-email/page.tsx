'use client';
import { reload, sendEmailVerification } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { auth } from '@/lib/firebase/client';

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const resend = async () => {
    if (!auth?.currentUser) return;
    setLoading(true);
    try {
      await sendEmailVerification(auth.currentUser);
      alert('E-mail de vérification renvoyé.');
    } finally {
      setLoading(false);
    }
  };

  const iveVerified = async () => {
    if (!auth?.currentUser) return;
    await reload(auth.currentUser);
    if (auth.currentUser.emailVerified) {
      // After verified, just send them back to welcome; middleware will route to correct space
      router.push('/welcome');
    } else {
      alert('Email non encore vérifié.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded shadow p-6 space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Vérifiez votre e-mail</h1>
        <p>Un e-mail de vérification vous a été envoyé. Cliquez sur le lien, puis revenez ici.</p>
        <div className="flex gap-2 justify-center">
          <button
            disabled={loading}
            onClick={resend}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Renvoyer l&apos;e-mail
          </button>
          <button onClick={iveVerified} className="px-4 py-2 bg-gray-200 rounded">
            J&apos;ai vérifié
          </button>
        </div>
      </div>
    </div>
  );
}
