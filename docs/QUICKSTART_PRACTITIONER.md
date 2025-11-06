# 🚀 Guide de démarrage rapide - Inscription praticien

## Test en local (Émulateurs)

### 1. Démarrer l'environnement

```powershell
# Windows
.\scripts\dev-local.ps1

# Mac/Linux
./scripts/dev-local.sh
```

Ou avec npm :

```bash
pnpm dev:stack:win  # Windows
pnpm dev:stack:mac  # Mac
```

### 2. Créer un compte praticien

1. Ouvrir **http://localhost:3010/login**
2. Cliquer sur **"Se connecter / S'inscrire avec Google"**
3. Dans le popup de l'émulateur, sélectionner ou créer un compte de test
4. ✅ Le compte est créé avec le statut `pending_approval`
5. Message affiché : "Votre compte a été créé et est en attente d'approbation"

### 3. Approuver le compte

**Option A : Interface web (à venir)**

Accéder à **http://localhost:3010/admin/practitioners** avec un compte admin

**Option B : Script automatique**

```bash
node scripts/approve-practitioner-dev.mjs your.email@example.com
```

**Option C : Manuellement dans Firestore**

1. Ouvrir **http://localhost:5000** (Emulator UI)
2. Cliquer sur **Firestore**
3. Collection **practitioners** → Trouver votre document
4. Modifier `status` : `"pending_approval"` → `"approved"`
5. Ajouter `approvedAt` : Date actuelle

### 4. Se connecter

1. Retourner sur **http://localhost:3010/login**
2. Cliquer sur **"Se connecter avec Google"**
3. Sélectionner le même compte
4. ✅ **Redirection automatique vers le dashboard !**

## 📊 Vérifications

### Firestore Emulator

**Collection : `practitioners`**

Document après création :

```json
{
  "uid": "abc123...",
  "email": "john@example.com",
  "displayName": "John Doe",
  "photoURL": "https://...",
  "role": "practitioner",
  "status": "pending_approval",  // ← À changer en "approved"
  "createdAt": { "_seconds": ... },
  "updatedAt": { "_seconds": ... },
  "settings": {
    "notifications": true,
    "emailNotifications": true
  }
}
```

Après approbation :

```json
{
  // ... même contenu
  "status": "approved",  // ✅ Changé
  "approvedAt": { "_seconds": ... }  // ✅ Ajouté
}
```

## 🔧 Dépannage

### "Votre compte n'existe pas"

➡️ **Cause** : Le document n'a pas été créé dans Firestore

**Solutions** :

1. Vérifier que les émulateurs sont bien lancés
2. Vérifier la collection `practitioners` dans l'Emulator UI
3. Essayer de se reconnecter avec Google Sign-In

### "En attente d'approbation"

➡️ **Cause** : Le compte existe mais n'est pas encore approuvé

**Solutions** :

1. Utiliser le script d'approbation
2. Modifier manuellement le statut dans Firestore
3. Attendre qu'un admin approuve le compte

### "Compte rejeté"

➡️ **Cause** : Le compte a été rejeté par un admin

**Solutions** :

1. Contacter l'administrateur
2. En dev, changer le statut manuellement dans Firestore

### Popup Google bloqué

➡️ **Cause** : Le navigateur bloque les popups

**Solutions** :

1. Autoriser les popups pour localhost:3010
2. Le système basculera automatiquement en mode redirection

## 📝 Statuts possibles

| Statut             | Description                           | Accès dashboard |
| ------------------ | ------------------------------------- | --------------- |
| `pending_approval` | Compte créé, en attente d'approbation | ❌ Non          |
| `approved`         | Compte approuvé par un admin          | ✅ Oui          |
| `rejected`         | Compte rejeté par un admin            | ❌ Non          |

## 🎯 Workflow complet

```
Utilisateur                     Système                     Admin
    │                              │                          │
    │ 1. Clic Google Sign-In       │                          │
    ├─────────────────────────────>│                          │
    │                              │                          │
    │ 2. Auth Google OK            │                          │
    │<─────────────────────────────┤                          │
    │                              │                          │
    │                              │ 3. Création document     │
    │                              │    status: pending       │
    │                              │                          │
    │ 4. Message d'attente         │                          │
    │<─────────────────────────────┤                          │
    │                              │                          │
    │                              │ 5. Notification          │
    │                              ├─────────────────────────>│
    │                              │                          │
    │                              │ 6. Clic "Approuver"      │
    │                              │<─────────────────────────┤
    │                              │                          │
    │                              │ 7. Update status         │
    │                              │    → approved            │
    │                              │                          │
    │ 8. Reconnexion               │                          │
    ├─────────────────────────────>│                          │
    │                              │                          │
    │ 9. Accès autorisé            │                          │
    │    → Dashboard               │                          │
    │<─────────────────────────────┤                          │
    │                              │                          │
```

## 🔗 Liens utiles

- **Login praticien** : http://localhost:3010/login
- **Dashboard** : http://localhost:3010/dashboard
- **Admin praticiens** : http://localhost:3010/admin/practitioners
- **Emulator UI** : http://localhost:5000
- **Firestore** : http://localhost:5000/firestore
- **Auth** : http://localhost:5000/auth

## 📚 Documentation complète

Pour plus de détails sur le système d'inscription, voir :

- [`docs/PRACTITIONER_REGISTRATION.md`](./PRACTITIONER_REGISTRATION.md) - Workflow complet
- [`docs/DEV_LOCAL.md`](./DEV_LOCAL.md) - Configuration locale
- [`scripts/README.md`](../scripts/README.md) - Scripts disponibles

---

**Besoin d'aide ?** Contactez l'équipe de développement ou consultez la documentation complète.
