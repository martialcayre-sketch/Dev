import { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Navigate } from 'react-router-dom';

import { auth } from '../lib/firebase';
import { UserProfile } from '../lib/types';
import { getCurrentUserProfile } from '../services/userService';

interface Props {
  role: 'practitioner' | 'patient';
  children: ReactNode;
}

export default function ProtectedRoute({ role, children }: Props) {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      const p = await getCurrentUserProfile();
      if (mounted) {
        setProfile(p);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user]);

  if (!user)
    return (
      <Navigate to={role === 'practitioner' ? '/login/practitioner' : '/login/patient'} replace />
    );
  if (loading) return null;
  if (!profile) return <Navigate to="/" replace />;

  if (profile.role !== role) return <Navigate to="/" replace />;

  if (!user.emailVerified) return <Navigate to="/verify-email" replace />;

  if (role === 'patient' && profile.approvalStatus !== 'approved') {
    return <Navigate to="/patient/pending-approval" replace />;
  }

  return <>{children}</>;
}
