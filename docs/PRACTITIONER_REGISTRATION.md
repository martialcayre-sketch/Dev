# Système d'inscription et approbation des praticiens

## 🎯 Fonctionnement

### Pour les nouveaux praticiens

1. **Connexion via Google Sign-In**
   - Accéder à `/login` sur l'app practitioner
   - Cliquer sur "Se connecter / S'inscrire avec Google"
   - Sélectionner son compte Google professionnel

2. **Création automatique du compte**
   - Le système crée automatiquement un document dans `practitioners/{uid}`
   - Statut initial : `pending_approval`
   - Informations enregistrées :
     - `uid` : ID Firebase de l'utilisateur
     - `email` : Email Google
     - `displayName` : Nom d'affichage
     - `photoURL` : Photo de profil
     - `role` : "practitioner"
     - `status` : "pending_approval"
     - `createdAt` : Date de création
     - `settings` : Configuration par défaut

3. **Message de confirmation**
   - Un message s'affiche : "Votre compte a été créé et est en attente d'approbation"
   - L'utilisateur ne peut pas encore accéder au dashboard
   - Le compte reste dans Firebase Auth

### Pour les administrateurs

1. **Page d'administration**
   - URL : `/admin/practitioners`
   - Liste tous les praticiens avec leurs statuts

2. **Approbation des comptes**
   - **En attente** : Praticiens avec `status: "pending_approval"`
     - Bouton "Approuver" → Change le statut en `approved`
     - Bouton "Rejeter" → Change le statut en `rejected`
   
3. **Gestion des statuts**
   - **Approuvé** (`approved`) : Peut accéder au dashboard
   - **En attente** (`pending_approval`) : Ne peut pas accéder
   - **Rejeté** (`rejected`) : Ne peut pas accéder

## 📊 Structure Firestore

### Collection `practitioners`

```typescript
{
  uid: string,                    // ID Firebase Auth
  email: string,                  // Email du praticien
  displayName: string,            // Nom complet
  photoURL?: string,              // URL photo de profil
  role: "practitioner",           // Rôle fixe
  status: "pending_approval" | "approved" | "rejected",
  createdAt: Timestamp,           // Date de création
  updatedAt: Timestamp,           // Dernière modification
  approvedAt?: Timestamp,         // Date d'approbation (si approved)
  rejectedAt?: Timestamp,         // Date de rejet (si rejected)
  settings: {
    notifications: boolean,
    emailNotifications: boolean
  }
}
```

## 🔐 Logique d'authentification

### Fonction `ensurePractitionerAccess`

```typescript
async function ensurePractitionerAccess(
  uid: string, 
  createIfMissing: boolean = false
): Promise<boolean>
```

**Paramètres :**
- `uid` : ID de l'utilisateur Firebase
- `createIfMissing` : `true` pour créer le compte si inexistant (nouveau user)

**Logique :**

1. **Vérification du document practitioner**
   ```typescript
   const practitionerDoc = await getDoc(doc(firestore, "practitioners", uid));
   ```

2. **Création automatique (si nouveau utilisateur)**
   ```typescript
   if (!practitionerDoc.exists() && createIfMissing) {
     await setDoc(doc(firestore, "practitioners", uid), {
       uid, email, displayName, photoURL,
       role: "practitioner",
       status: "pending_approval",
       // ...
     });
     return false; // Refuser l'accès immédiat
   }
   ```

3. **Vérification du statut**
   ```typescript
   if (practitionerDoc.exists()) {
     const status = practitionerDoc.data().status;
     
     if (status === "pending_approval") {
       // Afficher message d'attente
       return false;
     }
     
     if (status === "rejected") {
       // Afficher message de rejet
       return false;
     }
     
     if (status === "approved") {
       // Autoriser l'accès
       return true;
     }
   }
   ```

## 🚀 Workflow complet

### Inscription d'un nouveau praticien

```
┌─────────────────────────────────────────────────┐
│ 1. Praticien clique "Google Sign-In"           │
└───────────────┬─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│ 2. Authentification Google réussie             │
│    → isNewFirebaseUser = true                  │
└───────────────┬─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│ 3. ensurePractitionerAccess(uid, true)         │
│    → Document practitioner n'existe pas        │
└───────────────┬─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│ 4. Création du document                         │
│    practitioners/{uid}                          │
│    status: "pending_approval"                  │
└───────────────┬─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│ 5. Affichage message                            │
│    "Compte créé, en attente d'approbation"     │
│    → return false (pas d'accès)                │
└─────────────────────────────────────────────────┘
```

### Approbation par l'admin

```
┌─────────────────────────────────────────────────┐
│ 1. Admin accède à /admin/practitioners         │
└───────────────┬─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│ 2. Liste des praticiens "pending_approval"     │
└───────────────┬─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│ 3. Admin clique "Approuver"                    │
└───────────────┬─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│ 4. Update Firestore                             │
│    status: "approved"                           │
│    approvedAt: Timestamp                        │
└───────────────┬─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│ 5. Praticien peut maintenant se connecter      │
│    et accéder au dashboard                      │
└─────────────────────────────────────────────────┘
```

## 🧪 Test en local (Émulateurs)

### Étape 1 : Créer un compte praticien

1. Démarrer les émulateurs : `.\scripts\dev-local.ps1`
2. Ouvrir http://localhost:3010/login
3. Cliquer sur "Se connecter / S'inscrire avec Google"
4. Sélectionner un compte Google (l'émulateur simule l'auth)
5. Vérifier le message : "Compte créé, en attente d'approbation"

### Étape 2 : Vérifier dans Firestore

1. Ouvrir http://localhost:5000 (Emulator UI)
2. Aller dans "Firestore"
3. Collection `practitioners` → Voir le nouveau document
4. Vérifier `status: "pending_approval"`

### Étape 3 : Approuver le compte

**Option A : Via l'interface admin**
1. Se connecter avec un compte admin existant
2. Aller sur http://localhost:3010/admin/practitioners
3. Cliquer "Approuver" sur le compte

**Option B : Manuellement dans Firestore**
1. Dans l'Emulator UI, aller dans Firestore
2. Sélectionner le document du praticien
3. Modifier `status` de `"pending_approval"` à `"approved"`
4. Ajouter un champ `approvedAt` avec la date actuelle

### Étape 4 : Se reconnecter

1. Retourner sur http://localhost:3010/login
2. Se reconnecter avec Google
3. Cette fois, accès autorisé → Redirection vers `/dashboard`

## 📝 Notes importantes

### Sécurité

- ✅ Les comptes ne sont pas supprimés automatiquement
- ✅ Workflow d'approbation manuel pour éviter les inscriptions abusives
- ✅ Séparation claire entre Firebase Auth et Firestore
- ✅ Vérification du statut à chaque connexion

### Firebase Rules

Il faudra ajouter des règles Firestore pour sécuriser la collection `practitioners` :

```javascript
// firestore.rules
match /practitioners/{userId} {
  // Lecture : uniquement par l'utilisateur lui-même ou un admin
  allow read: if request.auth != null && 
    (request.auth.uid == userId || 
     request.auth.token.admin == true);
  
  // Écriture : uniquement lors de la création par l'utilisateur lui-même
  // Les mises à jour de statut doivent passer par Cloud Functions ou admin
  allow create: if request.auth != null && 
    request.auth.uid == userId &&
    request.resource.data.status == "pending_approval";
  
  // Update : uniquement par les admins
  allow update: if request.auth != null && 
    request.auth.token.admin == true;
}
```

### Prochaines améliorations

- [ ] Notifications email aux admins lors de nouvelles inscriptions
- [ ] Notifications email aux praticiens lors d'approbation/rejet
- [ ] Cloud Function pour validation automatique basée sur domaine email
- [ ] Logs d'audit des approbations/rejets
- [ ] Interface admin plus complète avec filtres et recherche
- [ ] Possibilité de réactiver un compte rejeté

---

**Résumé** : Les praticiens peuvent maintenant créer leur compte via Google Sign-In. Le compte est créé automatiquement mais nécessite une approbation admin via `/admin/practitioners` avant de pouvoir accéder au dashboard.
