import { auth, firestore } from '@/lib/firebase';
import {
  FacebookAuthProvider,
  getRedirectResult,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle redirect result on component mount
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const user = result.user;

          // Check if user exists in patients collection
          const patientDoc = await getDoc(doc(firestore, 'patients', user.uid));

          if (!patientDoc.exists()) {
            // Create patient profile if doesn't exist
            await setDoc(doc(firestore, 'patients', user.uid), {
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              status: 'approved',
              approvalStatus: 'approved',
              createdAt: new Date(),
              provider: result.providerId || 'google',
            });
          }

          navigate('/dashboard');
        }
      } catch (err: any) {
        if (err.code !== 'auth/popup-closed-by-user') {
          console.error('Redirect error:', err);
          setError('Erreur lors de la connexion');
        }
      }
    };

    handleRedirect();
  }, [navigate]);

  // Email/Password Sign In
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if user is a patient
      const patientDoc = await getDoc(doc(firestore, 'patients', user.uid));
      if (!patientDoc.exists()) {
        setError('Compte patient introuvable');
        await auth.signOut();
        return;
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError('Email ou mot de passe incorrect');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Google Sign In
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();

      // Try popup first
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user exists in patients collection
        const patientDoc = await getDoc(doc(firestore, 'patients', user.uid));

        if (!patientDoc.exists()) {
          // Create patient profile if doesn't exist
          await setDoc(doc(firestore, 'patients', user.uid), {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            status: 'approved',
            approvalStatus: 'approved',
            createdAt: new Date(),
            provider: 'google',
          });
        }

        navigate('/dashboard');
      } catch (popupError: any) {
        // If popup fails, try redirect
        if (
          popupError.code === 'auth/popup-blocked' ||
          popupError.code === 'auth/cancelled-popup-request' ||
          popupError.message?.includes('Cross-Origin-Opener-Policy')
        ) {
          console.log('Popup blocked, using redirect instead');
          await signInWithRedirect(auth, provider);
        } else {
          throw popupError;
        }
      }
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      setError('Erreur lors de la connexion avec Google');
    } finally {
      setLoading(false);
    }
  };

  // Facebook Sign In
  const handleFacebookSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const provider = new FacebookAuthProvider();

      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user exists in patients collection
        const patientDoc = await getDoc(doc(firestore, 'patients', user.uid));

        if (!patientDoc.exists()) {
          await setDoc(doc(firestore, 'patients', user.uid), {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            status: 'approved',
            approvalStatus: 'approved',
            createdAt: new Date(),
            provider: 'facebook',
          });
        }

        navigate('/dashboard');
      } catch (popupError: any) {
        if (
          popupError.code === 'auth/popup-blocked' ||
          popupError.code === 'auth/cancelled-popup-request' ||
          popupError.message?.includes('Cross-Origin-Opener-Policy')
        ) {
          await signInWithRedirect(auth, provider);
        } else {
          throw popupError;
        }
      }
    } catch (err: any) {
      console.error('Facebook Sign In error:', err);
      setError('Erreur lors de la connexion avec Facebook');
    } finally {
      setLoading(false);
    }
  };

  // LinkedIn Sign In (Microsoft OAuth)
  const handleLinkedInSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const provider = new OAuthProvider('microsoft.com');
      provider.setCustomParameters({
        tenant: 'common', // or your specific tenant ID
      });

      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user exists in patients collection
        const patientDoc = await getDoc(doc(firestore, 'patients', user.uid));

        if (!patientDoc.exists()) {
          await setDoc(doc(firestore, 'patients', user.uid), {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            status: 'approved',
            approvalStatus: 'approved',
            createdAt: new Date(),
            provider: 'microsoft',
          });
        }

        navigate('/dashboard');
      } catch (popupError: any) {
        if (
          popupError.code === 'auth/popup-blocked' ||
          popupError.code === 'auth/cancelled-popup-request' ||
          popupError.message?.includes('Cross-Origin-Opener-Policy')
        ) {
          await signInWithRedirect(auth, provider);
        } else {
          throw popupError;
        }
      }
    } catch (err: any) {
      console.error('LinkedIn Sign In error:', err);
      setError('Erreur lors de la connexion avec LinkedIn/Microsoft');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            🧠 NeuroNutrition
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">Connexion patient</p>
        </div>

        {/* Social Sign In Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuer avec Google
          </button>

          <button
            onClick={handleFacebookSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-[#1877F2] text-sm font-medium text-white hover:bg-[#166FE5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Continuer avec Facebook
          </button>

          <button
            onClick={handleLinkedInSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-[#0A66C2] text-sm font-medium text-white hover:bg-[#004182] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A66C2] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            Continuer avec LinkedIn
          </button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Ou avec email</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="votre@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
              Mot de passe oublié ?
            </a>
            <a href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              Créer un compte
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
