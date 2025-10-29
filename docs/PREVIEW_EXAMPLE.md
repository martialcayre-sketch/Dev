# Exemple de commentaire GitHub Actions

Voici un exemple du commentaire qui sera automatiquement ajouté dans chaque Pull Request :

---

## 🚀 Firebase Hosting Preview

Vos previews sont prêts !

### 👤 Patient

- **URL**: https://neuronutrition-app-patient--pr-42-patient-abc123def.web.app
- **Channel**: `pr-42-patient`
- **Expire**: dans 7 jours

### 👨‍⚕️ Practitioner

- **URL**: https://neuronutrition-app-practitioner--pr-42-practitioner-xyz789.web.app
- **Channel**: `pr-42-practitioner`
- **Expire**: dans 7 jours

### 🧪 Tests à effectuer

- [ ] Page placeholder affichée correctement
- [ ] API Functions accessible : `/api/health`
- [ ] Pas d'erreurs dans la console

---

*Preview créé automatiquement par GitHub Actions*

---

## Avantages

- **URL unique** : Chaque PR a ses propres URLs de preview
- **Isolation** : Pas de risque d'interférence avec d'autres branches
- **Temporaire** : Les previews expirent automatiquement après 7 jours
- **Automatique** : Mis à jour à chaque nouveau commit sur la PR
- **Partageable** : Vous pouvez partager ces URLs avec votre équipe pour validation

## Structure des URLs

Format des URLs générées :

```text
https://<project-id>--<channel-id>-<random-hash>.web.app
```

Exemple :

```text
https://neuronutrition-app-patient--pr-123-patient-a1b2c3d4.web.app
                  ^                    ^    ^        ^
                  |                    |    |        |
              Project ID            PR num  Target  Random hash
```

## Commandes utiles

### Lister tous les channels actifs

```bash
firebase hosting:channel:list
```

### Supprimer un channel manuellement

```bash
firebase hosting:channel:delete pr-42-patient
```

### Déployer manuellement sur un channel

```bash
firebase hosting:channel:deploy my-preview --only patient
```
