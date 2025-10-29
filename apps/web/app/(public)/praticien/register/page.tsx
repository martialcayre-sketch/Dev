'use client';
import { useRouter } from 'next/navigation';

export default function PractitionerRegisterPage() {
  const router = useRouter();
  // Page désactivée: seul le praticien prédéfini peut se connecter.
  if (typeof window !== 'undefined') {
    router.replace('/praticien/login');
  }
  return null;
}
