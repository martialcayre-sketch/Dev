import { User } from 'firebase/auth';

import { UserProfile } from './types';

export type GuardResult = { allow: true } | { allow: false; redirect: string };

export function guardRoute(
  user: User | null,
  profile: UserProfile | null,
  requiredRole: 'practitioner' | 'patient'
): GuardResult {
  if (!user) {
    return {
      allow: false,
      redirect: requiredRole === 'practitioner' ? '/login/practitioner' : '/login/patient',
    };
  }
  if (!user.emailVerified) return { allow: false, redirect: '/verify-email' };
  if (!profile) return { allow: false, redirect: '/' };
  if (profile.role !== requiredRole) return { allow: false, redirect: '/' };
  if (requiredRole === 'patient' && profile.approvalStatus !== 'approved') {
    return { allow: false, redirect: '/patient/pending-approval' };
  }
  return { allow: true };
}
