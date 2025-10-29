import { onAuthStateChanged } from 'firebase/auth';
import { ReactNode, useEffect, useState } from 'react';

import { auth } from '../lib/firebase';

export default function AuthGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, () => {
      setReady(true);
    });
    return () => unsub();
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
