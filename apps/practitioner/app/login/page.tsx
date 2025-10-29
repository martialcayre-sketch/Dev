"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, firestore } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const ensurePractitionerAccess = async (uid: string, createIfMissing: boolean = false) => {
    try {
      console.log("🔐 Vérification des accès pour UID:", uid);
      console.log("🌍 NODE_ENV:", process.env.NODE_ENV);
      console.log("🆕 Création auto:", createIfMissing);
      
      const [tokenResult, practitionerDoc] = await Promise.all([
        auth.currentUser?.getIdTokenResult(true),
        getDoc(doc(firestore, "practitioners", uid)),
      ]);

      console.log("🎫 Token claims:", tokenResult?.claims);
      console.log("📄 Document practitioner existe:", practitionerDoc.exists());

      const claims = tokenResult?.claims ?? {};
      const isAllowed =
        claims.role === "practitioner" || claims.admin === true || claims.fullAdmin === true;

      console.log("✓ Claims autorisés:", isAllowed);
      console.log("✓ Document existe:", practitionerDoc.exists());

      // Si le document n'existe pas et qu'on autorise la création
      if (!practitionerDoc.exists() && createIfMissing && auth.currentUser) {
        console.log("🆕 Création automatique du compte praticien...");
        const { setDoc, serverTimestamp } = await import("firebase/firestore");
        
        try {
          await setDoc(doc(firestore, "practitioners", uid), {
            uid: uid,
            email: auth.currentUser.email,
            displayName: auth.currentUser.displayName || "",
            photoURL: auth.currentUser.photoURL || "",
            role: "practitioner",
            status: "pending_approval", // Nécessite approbation admin
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            settings: {
              notifications: true,
              emailNotifications: true,
            }
          });
          console.log("✅ Compte praticien créé avec succès");
          setError("Votre compte a été créé et est en attente d'approbation par un administrateur.");
          return false; // Ne pas autoriser l'accès immédiatement
        } catch (createError) {
          console.error("❌ Erreur création compte:", createError);
          setError("Erreur lors de la création du compte. Veuillez réessayer.");
          return false;
        }
      }

      if (isAllowed || practitionerDoc.exists()) {
        // Vérifier le statut si le document existe
        if (practitionerDoc.exists()) {
          const practitionerData = practitionerDoc.data();
          if (practitionerData.status === "pending_approval") {
            console.log("⏳ Compte en attente d'approbation");
            await auth.signOut();
            setError("Votre compte est en attente d'approbation par un administrateur.");
            return false;
          }
          if (practitionerData.status === "rejected") {
            console.log("❌ Compte rejeté");
            await auth.signOut();
            setError("Votre compte a été refusé. Contactez l'administrateur pour plus d'informations.");
            return false;
          }
        }
        
        console.log("✅ Accès praticien validé");
        return true;
      }

      console.log("⚠️ Accès non autorisé");
      await auth.signOut();
      setError(
        "Votre compte n'existe pas. Utilisez 'Se connecter avec Google' pour créer un compte."
      );
      return false;
    } catch (validationError) {
      console.error("❌ Erreur de validation praticien", validationError);
      await auth.signOut();
      setError(
        "Impossible de vérifier vos accès praticien. Veuillez réessayer ou contacter le support."
      );
      return false;
    }
  };

  // Gère le résultat de la redirection Google et l'état d'authentification
  useEffect(() => {
    let hasHandledRedirect = false;

    const handleRedirectResult = async () => {
      if (hasHandledRedirect) {
        console.log("⏭️ Redirection déjà traitée, skip");
        return;
      }

      try {
        console.log("🔍 Vérification du résultat de redirection Google...");
        const credential = await getRedirectResult(auth);
        
        console.log("📧 Credential reçu:", credential ? "OUI" : "NON");
        
        if (credential?.user) {
          hasHandledRedirect = true;
          console.log("👤 Utilisateur détecté:", credential.user.email);
          setLoading(true);
          
          // Vérifier si c'est un nouvel utilisateur Firebase
          const isNewFirebaseUser =
            credential.user.metadata.creationTime === credential.user.metadata.lastSignInTime;
          
          console.log("🆕 Nouvel utilisateur:", isNewFirebaseUser);
          
          // Permettre la création automatique pour les nouveaux utilisateurs
          const allowed = await ensurePractitionerAccess(credential.user.uid, isNewFirebaseUser);

          console.log("✅ Accès autorisé:", allowed);

          if (!allowed && isNewFirebaseUser) {
            console.log("❌ Compte créé mais en attente d'approbation");
            // Ne pas supprimer le compte, juste afficher le message d'attente
          } else if (!allowed) {
            console.log("❌ Accès refusé");
          }

          if (allowed) {
            console.log("➡️ Redirection vers /dashboard");
            router.push("/dashboard");
          } else {
            console.log("🚫 Accès refusé, reste sur /login");
            setLoading(false);
          }
        } else {
          console.log("ℹ️ Pas de credential de redirection");
          
          // Vérifier si l'utilisateur est déjà connecté (cas où on revient sur /login après connexion)
          const currentUser = auth.currentUser;
          console.log("👤 Utilisateur actuel:", currentUser?.email || "NON");
          
          if (currentUser) {
            console.log("🔄 Utilisateur déjà connecté, vérification des accès...");
            setLoading(true);
            const allowed = await ensurePractitionerAccess(currentUser.uid);
            if (allowed) {
              console.log("➡️ Redirection vers /dashboard (utilisateur déjà connecté)");
              router.push("/dashboard");
            } else {
              setLoading(false);
            }
          }
        }
      } catch (error) {
        console.error("❌ Erreur après redirection Google:", error);
        const errorMessage = (error as Error)?.message || "Erreur lors de la connexion avec Google";
        
        // Gestion spécifique de l'erreur popup-blocked (au cas où)
        if (errorMessage.includes("popup-blocked")) {
          setError("Les popups sont bloqués. La connexion va utiliser une redirection.");
        } else {
          setError(errorMessage);
        }
        setLoading(false);
      }
    };

    handleRedirectResult();
  }, [router]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const allowed = await ensurePractitionerAccess(credential.user.uid);
      if (allowed) {
        router.push("/dashboard");
      }
    } catch (signInError) {
      console.error("Erreur connexion email", signInError);
      setError("Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      
      console.log("🔐 Tentative de connexion Google avec popup...");
      
      try {
        // Essayer d'abord avec popup (plus rapide)
        const credential = await signInWithPopup(auth, provider);
        console.log("✅ Connexion popup réussie:", credential.user.email);
        
        // Force token refresh to get latest custom claims
        console.log("🔄 Rafraîchissement du token pour récupérer les custom claims...");
        await credential.user.getIdToken(true);
        const tokenResult = await credential.user.getIdTokenResult();
        console.log("🎫 Custom claims:", tokenResult.claims);
        
        // Vérifier si c'est un nouvel utilisateur
        const isNewFirebaseUser =
          credential.user.metadata.creationTime === credential.user.metadata.lastSignInTime;
        
        console.log("🆕 Nouvel utilisateur:", isNewFirebaseUser);
        
        // Permettre la création automatique pour les nouveaux utilisateurs
        const allowed = await ensurePractitionerAccess(credential.user.uid, isNewFirebaseUser);

        if (!allowed && isNewFirebaseUser) {
          console.log("❌ Compte créé mais en attente d'approbation");
          // Ne pas supprimer le compte
        } else if (!allowed) {
          console.log("❌ Accès refusé");
        }

        if (allowed) {
          console.log("➡️ Redirection vers /dashboard");
          router.push("/dashboard");
        } else {
          setLoading(false);
        }
      } catch (popupError: any) {
        console.warn("⚠️ Popup bloqué, utilisation de la redirection:", popupError.code);
        
        // Si le popup est bloqué, utiliser la redirection
        if (popupError.code === "auth/popup-blocked" || popupError.code === "auth/cancelled-popup-request") {
          console.log("🔄 Passage en mode redirection...");
          await signInWithRedirect(auth, provider);
          // La suite sera gérée par le useEffect après redirection
        } else {
          throw popupError;
        }
      }
    } catch (error) {
      console.error("❌ Erreur Google Sign-In:", error);
      setError("Erreur lors de la connexion avec Google. Veuillez réessayer.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10">
      <div className="absolute inset-0 bg-grid-pattern bg-[length:32px_32px] opacity-20" />
      <div className="relative z-10 grid w-full max-w-5xl gap-10 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col justify-between space-y-10">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-nn-accent-200">
              Espace praticien
            </span>
            <h1 className="mt-6 text-3xl font-semibold text-white">
              Accédez à votre univers neuro-nutrition clinique.
            </h1>
            <p className="mt-4 text-sm text-white/70">
              Retrouvez vos patients, questionnaires, plans et outils d'analyse avancés dans une interface pensée pour la performance neuro-nutritionnelle.
            </p>
          </div>
          <div className="hidden rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70 lg:block">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-white/50">Sécurité renforcée</h2>
            <ul className="mt-3 space-y-2 text-xs">
              <li>• Authentification Google sécurisée</li>
              <li>• Données hébergées dans Firebase (France/Belgique)</li>
              <li>• Chiffrement des informations de santé et conformité RGPD</li>
            </ul>
          </div>
        </div>
        <form
          onSubmit={handleLogin}
          className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-nn-primary-500/10"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-white/60">Connexion</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Bienvenue cher praticien</h2>
          <p className="mt-3 text-sm text-white/60">
            Connectez-vous avec vos identifiants ou créez un compte avec Google.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-white/60">Email professionnel</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="prenom@cabinet.fr"
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-nn-primary-500/40 focus:outline-none focus:ring-2 focus:ring-nn-primary-500/40"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-white/60">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                placeholder="••••••••"
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-nn-primary-500/40 focus:outline-none focus:ring-2 focus:ring-nn-primary-500/40"
              />
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-nn-primary-500 to-nn-accent-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-nn-primary-500/30 transition hover:from-nn-primary-400 hover:to-nn-accent-400 disabled:opacity-60"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-widest text-white/40">
            <span className="h-px flex-1 bg-white/10" />
            ou
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10 disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
              <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853" />
              <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
              <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.002 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335" />
            </svg>
            {loading ? "Connexion..." : "Se connecter / S'inscrire avec Google"}
          </button>

          <div className="mt-6 rounded-lg border border-nn-accent-500/20 bg-nn-accent-500/5 px-4 py-3">
            <p className="text-xs text-nn-accent-200">
              <strong>Nouveau praticien ?</strong> Utilisez "Se connecter avec Google" pour créer automatiquement votre compte. 
              Votre accès sera activé après validation par un administrateur.
            </p>
          </div>

          <p className="mt-4 text-center text-[11px] uppercase tracking-widest text-white/40">
            Besoin d'aide ? Contactez support@neuronutrition.app
          </p>
        </form>
      </div>
    </div>
  );
}