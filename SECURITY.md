# Sécurité

- Aucun secret/credential ne doit être commité dans le dépôt.
- Utiliser des variables d’environnement localement (`.env.local`, `.env`) et des Secrets GitHub en CI.
- Les règles Firestore et Storage sont en mode MVP restrictif: self-scope + rôle `admin` via custom claims.
- Examiner et ajuster CSP côté Next.js si vous ajoutez des intégrations externes.

