import { auth, firestore } from '@/lib/firebase';
import {
  getRedirectResult,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const ensurePractitionerAccess = async (uid: string, createIfMissing = false) => {
    try {
      const practitionerDoc = await getDoc(doc(firestore, 'practitioners', uid));
      if (!practitionerDoc.exists() && createIfMissing && auth.currentUser) {
        try {
          await setDoc(doc(firestore, 'practitioners', uid), {
            uid,
            email: auth.currentUser.email,
            displayName: auth.currentUser.displayName || '',
            photoURL: auth.currentUser.photoURL || '',
            role: 'practitioner',
            admin: true,
            fullAdmin: true,
            status: 'approved',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            settings: { notifications: true, emailNotifications: true },
          });
          return true;
        } catch (e) {
          setError('Erreur lors de la création du compte.');
          return false;
        }
      }
      if (practitionerDoc.exists()) return true;
      await auth.signOut();
      setError('Compte praticien introuvable. Utilisez Google pour créer votre compte.');
      return false;
    } catch (e) {
      await auth.signOut();
      setError('Impossible de vérifier vos accès praticien.');
      return false;
    }
  };

  useEffect(() => {
    let handled = false;
    const handleRedirect = async () => {
      if (handled) return;
      try {
        const credential = await getRedirectResult(auth);
        if (credential?.user) {
          handled = true;
          setLoading(true);
          const isNew =
            credential.user.metadata.creationTime === credential.user.metadata.lastSignInTime;
          const allowed = await ensurePractitionerAccess(credential.user.uid, isNew);
          if (allowed) navigate('/dashboard');
          else setLoading(false);
        } else if (auth.currentUser) {
          setLoading(true);
          const allowed = await ensurePractitionerAccess(auth.currentUser.uid);
          if (allowed) navigate('/dashboard');
          else setLoading(false);
        }
      } catch (e) {
        console.error(e);
        setError('Erreur lors de la connexion avec Google');
        setLoading(false);
      }
    };
    handleRedirect();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const allowed = await ensurePractitionerAccess(cred.user.uid);
      if (allowed) navigate('/dashboard');
    } catch (e) {
      setError('Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      try {
        const cred = await signInWithPopup(auth, provider);
        const allowed = await ensurePractitionerAccess(cred.user.uid, true);
        if (allowed) navigate('/dashboard');
        else setLoading(false);
      } catch (popupError: any) {
        if (
          popupError.code === 'auth/popup-blocked' ||
          popupError.code === 'auth/cancelled-popup-request'
        ) {
          await signInWithRedirect(auth, provider);
        } else throw popupError;
      }
    } catch (e) {
      setError('Erreur lors de la création du compte');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-5xl w-full grid gap-8 lg:grid-cols-2">
        <div className="p-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-700">
            Espace praticien
          </span>
          <h1 className="mt-6 text-3xl font-semibold text-slate-900">
            Accédez à votre univers neuro-nutrition clinique.
          </h1>
          <p className="mt-4 text-sm text-slate-600">
            Retrouvez vos patients, questionnaires, plans et outils d'analyse avancés.
          </p>
        </div>
        <form onSubmit={handleLogin} className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
            Connexion
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Bienvenue cher praticien</h2>
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Email professionnel
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="prenom@cabinet.fr"
                className="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-widest text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            ou
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                fill="#4285F4"
              />
              <path
                d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                fill="#FBBC05"
              />
              <path
                d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.002 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z"
                fill="#EA4335"
              />
            </svg>
            {loading ? 'Connexion...' : 'Se connecter avec Google'}
          </button>

          <div className="mt-6 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-slate-700">
            <p className="text-xs">
              <strong>Première connexion ?</strong> Votre compte praticien sera créé automatiquement
              lors de votre première connexion avec Google. Accès immédiat à votre espace.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
