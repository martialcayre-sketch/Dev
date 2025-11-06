import { auth, firestore } from '@/lib/firebase';
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updatePassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);
  const [showSocialOptions, setShowSocialOptions] = useState(false);
  const [invitationData, setInvitationData] = useState<any>(null);
  // States for direct email/password signup (without invitation)
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  useEffect(() => {
    if (!token) {
      console.log('[Signup] No token found, showing social options');
      setShowSocialOptions(true);
      return;
    }

    // Verify the invitation token
    const verifyInvitation = async () => {
      console.log('[Signup] Verifying token:', token);
      setVerifyingToken(true);
      try {
        const functions = getFunctions(
          auth.app,
          import.meta.env.VITE_FIREBASE_REGION || 'europe-west1'
        );
        const getToken = httpsCallable(functions, 'getInvitationToken');

        console.log('[Signup] Calling getInvitationToken function...');
        const result = await getToken({ token });
        const data = result.data as any;
        console.log('[Signup] Token data received:', data);

        if (!data.valid) {
          console.error('[Signup] Token invalid:', data.error);
          setError(data.error || "Lien d'invitation invalide ou expiré");
          setShowSocialOptions(true);
          setVerifyingToken(false);
          return;
        }

        console.log('[Signup] Token valid, data received');
        setInvitationData(data);

        // IMPORTANT: Sign out any existing session to avoid conflicts
        if (auth.currentUser) {
          console.log('[Signup] Signing out existing user:', auth.currentUser.email);
          await auth.signOut();
        }

        // Store token data but DON'T sign in yet - wait for user to set new password
        // This prevents automatic redirection to dashboard/login
        console.log('[Signup] Token verified, ready for password creation');
        setPatientData({ email: data.email }); // Just store email for display
        setVerifyingToken(false);
      } catch (err: any) {
        console.error('[Signup] Token verification error:', err);
        setError(`Erreur lors de la vérification du lien: ${err?.message || err}`);
        setShowSocialOptions(true);
        setVerifyingToken(false);
      }
    };

    verifyInvitation();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      // First, sign in with temporary password
      if (!invitationData?.email || !invitationData?.tempPassword) {
        throw new Error("Données d'invitation manquantes");
      }

      console.log('[Signup] Signing in with temp password...');
      await signInWithEmailAndPassword(auth, invitationData.email, invitationData.tempPassword);

      const user = auth.currentUser;
      if (!user) throw new Error('Non authentifié');

      console.log('[Signup] Signed in, updating password...');
      // Update password locally
      await updatePassword(user, newPassword);

      // Call secure server-side activation (avoids Firestore rules issues)
      // This will:
      // - Mark token as used
      // - Set patient status to "approved"
      // - Send welcome email to patient
      // - Notify practitioner
      const functions = getFunctions(
        auth.app,
        import.meta.env.VITE_FIREBASE_REGION || 'europe-west1'
      );
      const activate = httpsCallable(functions, 'activatePatient');
      await activate({});

      navigate('/dashboard');
    } catch (err: any) {
      console.error('[Signup] Error:', err);
      if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        setError('Mot de passe temporaire invalide. Le lien a peut-être expiré.');
      } else {
        setError("Erreur lors de l'activation: " + (err?.message || ''));
      }
    } finally {
      setLoading(false);
    }
  };

  // Direct Email/Password Sign Up (no invitation)
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!regEmail) {
      setError('Veuillez saisir un email valide');
      return;
    }
    if (regPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (regPassword !== regConfirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
      const user = cred.user;

      const patientRef = doc(firestore, 'patients', user.uid);
      const existing = await getDoc(patientRef);
      if (!existing.exists()) {
        const practitionerId = invitationData?.practitionerId || null;

        await setDoc(patientRef, {
          email: user.email,
          displayName: user.displayName || null,
          photoURL: user.photoURL || null,
          status: 'approved',
          approvalStatus: 'approved',
          practitionerId,
          invitationToken: token || null,
          createdAt: new Date(),
          activatedAt: new Date(),
          provider: 'password',
        });

        const functions = getFunctions(
          auth.app,
          import.meta.env.VITE_FIREBASE_REGION || 'europe-west1'
        );
        try {
          const activate = httpsCallable(functions, 'activatePatient');
          await activate({});
        } catch (err) {
          console.warn('Failed to call activatePatient:', err);
        }
      }

      navigate('/dashboard');
    } catch (err: any) {
      // Map common Firebase Auth errors to FR messages
      if (err?.code === 'auth/email-already-in-use') {
        setError('Cet email est déjà utilisé. Essayez de vous connecter.');
      } else if (err?.code === 'auth/invalid-email') {
        setError('Email invalide');
      } else if (err?.code === 'auth/weak-password') {
        setError('Mot de passe trop faible (6+ caractères)');
      } else {
        setError('Erreur lors de la création du compte');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Social Sign Up with Google
  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Create or update patient profile
      const patientRef = doc(firestore, 'patients', user.uid);
      const patientDoc = await getDoc(patientRef);

      if (!patientDoc.exists()) {
        // Get invitation data if available
        const practitionerId = invitationData?.practitionerId || null;

        await setDoc(patientRef, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          status: 'approved', // Directly approved
          approvalStatus: 'approved',
          practitionerId,
          invitationToken: token || null, // Store token for later use
          createdAt: new Date(),
          activatedAt: new Date(),
          provider: 'google',
        });

        // Call activation function to send emails and notifications
        const functions = getFunctions(
          auth.app,
          import.meta.env.VITE_FIREBASE_REGION || 'europe-west1'
        );
        try {
          const activate = httpsCallable(functions, 'activatePatient');
          await activate({});
        } catch (err) {
          console.warn('Failed to call activatePatient:', err);
          // Continue anyway
        }
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError("Erreur lors de l'inscription avec Google");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Social Sign Up with Facebook
  const handleFacebookSignUp = async () => {
    setError('');
    setLoading(true);

    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const patientRef = doc(firestore, 'patients', user.uid);
      const patientDoc = await getDoc(patientRef);

      if (!patientDoc.exists()) {
        const practitionerId = invitationData?.practitionerId || null;

        await setDoc(patientRef, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          status: 'approved',
          approvalStatus: 'approved',
          practitionerId,
          invitationToken: token || null,
          createdAt: new Date(),
          activatedAt: new Date(),
          provider: 'facebook',
        });

        const functions = getFunctions(
          auth.app,
          import.meta.env.VITE_FIREBASE_REGION || 'europe-west1'
        );
        try {
          const activate = httpsCallable(functions, 'activatePatient');
          await activate({});
        } catch (err) {
          console.warn('Failed to call activatePatient:', err);
        }
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError("Erreur lors de l'inscription avec Facebook");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Social Sign Up with LinkedIn/Microsoft
  const handleLinkedInSignUp = async () => {
    setError('');
    setLoading(true);

    try {
      const provider = new OAuthProvider('microsoft.com');
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const patientRef = doc(firestore, 'patients', user.uid);
      const patientDoc = await getDoc(patientRef);

      if (!patientDoc.exists()) {
        const practitionerId = invitationData?.practitionerId || null;

        await setDoc(patientRef, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          status: 'approved',
          approvalStatus: 'approved',
          practitionerId,
          invitationToken: token || null,
          createdAt: new Date(),
          activatedAt: new Date(),
          provider: 'microsoft',
        });

        const functions = getFunctions(
          auth.app,
          import.meta.env.VITE_FIREBASE_REGION || 'europe-west1'
        );
        try {
          const activate = httpsCallable(functions, 'activatePatient');
          await activate({});
        } catch (err) {
          console.warn('Failed to call activatePatient:', err);
        }
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError("Erreur lors de l'inscription avec LinkedIn");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Show social signup options if no invitation or error
  if (showSocialOptions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl">
          <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-2">
            🧠 NeuroNutrition
          </h1>
          <p className="text-center text-gray-600 mb-8">Créer un compte patient</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
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
              S'inscrire avec Google
            </button>

            <button
              onClick={handleFacebookSignUp}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg shadow-sm bg-[#1877F2] text-sm font-medium text-white hover:bg-[#166FE5] transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              S'inscrire avec Facebook
            </button>

            <button
              onClick={handleLinkedInSignUp}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg shadow-sm bg-[#0A66C2] text-sm font-medium text-white hover:bg-[#004182] transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              S'inscrire avec LinkedIn
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Ou avec email</span>
            </div>
          </div>

          {/* Email/password signup form */}
          <form className="space-y-4" onSubmit={handleEmailSignUp}>
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="votre@email.com"
              />
            </div>
            <div>
              <label
                htmlFor="reg-password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mot de passe
              </label>
              <input
                id="reg-password"
                type="password"
                minLength={6}
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label htmlFor="reg-confirm" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe
              </label>
              <input
                id="reg-confirm"
                type="password"
                minLength={6}
                required
                value={regConfirm}
                onChange={(e) => setRegConfirm(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Création du compte...' : 'Créer mon compte'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/login" className="text-sm text-indigo-600 hover:text-indigo-500">
              Déjà un compte ? Se connecter
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while verifying token
  if (verifyingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Vérification de votre invitation...
          </h2>
          <p className="text-gray-600">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  if (error && !patientData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => {
              setError('');
              setShowSocialOptions(true);
            }}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
          >
            Créer un compte sans invitation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-2">
          Bienvenue {patientData?.firstname || patientData?.displayName}
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Créez votre mot de passe pour activer votre compte
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Minimum 6 caractères"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Confirmez votre mot de passe"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Activation en cours...' : 'Activer mon compte'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600 mb-4">Ou activez votre compte avec :</p>
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
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
              Google
            </button>
            <button
              onClick={handleFacebookSignUp}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2 bg-[#1877F2] rounded-lg text-sm font-medium text-white hover:bg-[#166FE5] transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>
            <button
              onClick={handleLinkedInSignUp}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2 bg-[#0A66C2] rounded-lg text-sm font-medium text-white hover:bg-[#004182] transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
