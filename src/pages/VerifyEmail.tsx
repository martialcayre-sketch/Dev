import { sendEmailVerification, reload } from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import Button from '../components/ui/Button';
import { auth } from '../lib/firebase';
import { getCurrentUserProfile } from '../services/userService';

export default function VerifyEmail() {
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  const refresh = useCallback(async () => {
    if (!auth.currentUser) return;

    await reload(auth.currentUser);
    const profile = await getCurrentUserProfile();

    if (auth.currentUser.emailVerified) {
      if (profile?.role === 'practitioner') return navigate('/practitioner/home');
      if (profile?.role === 'patient') {
        if (profile.approvalStatus === 'approved') return navigate('/patient/home');
        return navigate('/patient/pending-approval');
      }
      return;
    }

    toast('Email non encore vérifié.');
  }, [navigate]);

  useEffect(() => {
    // try automatic refresh when mounting
    refresh();
  }, [refresh]);

  const resend = async () => {
    if (!auth.currentUser) return;
    try {
      setSending(true);
      await sendEmailVerification(auth.currentUser);
      toast.success('E-mail de vérification renvoyé.');
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message ?? "Impossible d'envoyer l'e-mail";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6 text-center space-y-4">
        <h1 className="text-2xl font-semibold">Vérifiez votre e-mail</h1>
        <p>Un e-mail de vérification vous a été envoyé. Cliquez sur le lien, puis revenez ici.</p>
        <div className="flex gap-2 justify-center">
          <Button onClick={resend} loading={sending}>
            Renvoyer l&apos;e-mail
          </Button>
          <Button variant="secondary" onClick={refresh}>
            J&apos;ai vérifié
          </Button>
        </div>
      </div>
    </div>
  );
}
