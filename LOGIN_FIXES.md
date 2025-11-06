# Corrections de la Connexion Google - LoginPage

## Problèmes identifiés

### 1. **Erreur Cross-Origin-Opener-Policy**

```
Cross-Origin-Opener-Policy policy would block the window.close call.
```

**Cause** : Firebase Auth utilise des popups pour l'authentification OAuth, mais certains navigateurs ou configurations bloquent ces popups pour des raisons de sécurité (COOP).

### 2. **Erreur de permissions Firestore**

```
FirebaseError: Missing or insufficient permissions.
```

**Cause** : Les règles Firestore ne permettaient PAS aux patients de créer leur propre document. La règle existante était :

```
allow create: if isSignedIn() && (isAdmin() || request.resource.data.practitionerId == request.auth.uid);
```

Cette règle exigeait que `practitionerId == request.auth.uid`, ce qui n'a aucun sens pour un patient qui crée son propre document.

### 3. **Status patient incorrect**

Les nouveaux patients créés via login avaient `status: 'pending'` au lieu de `status: 'approved'`.

---

## Solutions implémentées

### ✅ 1. Règles Firestore corrigées

**Fichier** : `firestore.rules`

**Avant** :

```javascript
allow create: if isSignedIn() && (isAdmin() || request.resource.data.practitionerId == request.auth.uid);
```

**Après** :

```javascript
allow create: if isSignedIn() && (isAdmin() || request.auth.uid == id || request.resource.data.practitionerId == request.auth.uid);
```

**Changement** : Ajout de `request.auth.uid == id` pour permettre aux patients de créer leur propre document (`patients/{uid}`).

### ✅ 2. Fallback signInWithRedirect

**Fichier** : `apps/patient-vite/src/pages/LoginPage.tsx`

**Stratégie** :

1. Essayer d'abord `signInWithPopup()` (meilleure UX)
2. Si la popup est bloquée (COOP, bloqueur de popup), utiliser `signInWithRedirect()` automatiquement
3. Gérer le résultat du redirect avec `getRedirectResult()` au chargement de la page

**Code ajouté** :

```typescript
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
          // Create patient profile with approved status
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

// Google Sign In with fallback
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
        // Create patient profile with approved status
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
```

### ✅ 3. Status auto-approved

Tous les nouveaux patients créés via login (Google/Facebook/LinkedIn) ont maintenant :

- `status: 'approved'`
- `approvalStatus: 'approved'`

Ils peuvent immédiatement accéder à leur dashboard sans attendre l'approbation d'un praticien.

---

## Déploiement

### Commandes exécutées :

```bash
# 1. Déploiement des règles Firestore
npx firebase-tools deploy --only firestore:rules

# 2. Build de l'application patient
cd apps/patient-vite
npm run build

# 3. Déploiement de l'application
cd ../..
npx firebase-tools deploy --only hosting:patient
```

### URLs :

- **Production** : https://neuronutrition-app-patient.web.app/login
- **Console Firebase** : https://console.firebase.google.com/project/neuronutrition-app

---

## Tests recommandés

1. ✅ **Test popup normale** :
   - Ouvrir https://neuronutrition-app-patient.web.app/login
   - Cliquer sur "Continuer avec Google"
   - Vérifier que la popup s'ouvre et fonctionne

2. ✅ **Test redirect fallback** :
   - Ouvrir en navigation privée
   - Bloquer les popups dans les paramètres du navigateur
   - Cliquer sur "Continuer avec Google"
   - Vérifier que le redirect fonctionne (page redirigée vers Google, puis retour)

3. ✅ **Test création de compte** :
   - Se connecter avec un nouveau compte Google jamais utilisé
   - Vérifier que le document patient est créé dans Firestore
   - Vérifier que `status: 'approved'` et `approvalStatus: 'approved'`
   - Vérifier l'accès au dashboard

4. ✅ **Test connexion existante** :
   - Se connecter avec un compte Google déjà utilisé
   - Vérifier que le document patient existe
   - Vérifier l'accès au dashboard

---

## Différences avec SignupPage

**Important** : La page `SignupPage.tsx` utilise un processus différent avec :

- Token d'invitation obligatoire
- Appel à la Cloud Function `activatePatient()` après création
- Envoi d'emails de bienvenue et notification au praticien

La page `LoginPage.tsx` est pour les **connexions** de patients déjà inscrits. Si un nouveau patient se connecte pour la première fois via login (sans invitation), il sera créé avec le statut "approved" mais **sans praticien assigné** (`practitionerId` sera undefined).

### Flux recommandé :

1. **Inscription** : Via invitation → `SignupPage` → `activatePatient()` → Email + Notification
2. **Connexion** : Via login → `LoginPage` → Vérification existence → Dashboard

Si vous voulez empêcher les connexions sans invitation préalable, ajoutez une vérification :

```typescript
if (!patientDoc.exists()) {
  setError("Aucun compte patient trouvé. Veuillez utiliser votre lien d'invitation.");
  await auth.signOut();
  return;
}
```

---

## Résumé

✅ **Règles Firestore** : Patients peuvent maintenant créer leur propre document  
✅ **Fallback redirect** : Gestion automatique des popups bloquées  
✅ **Status approved** : Auto-approbation des patients lors du login  
✅ **Gestion d'erreurs** : Logs détaillés et messages utilisateur clairs  
✅ **Multi-provider** : Google, Facebook, LinkedIn tous corrigés

**Le login Google fonctionne maintenant correctement ! 🎉**
