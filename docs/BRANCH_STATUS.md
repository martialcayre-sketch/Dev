# Identifier la branche la plus récente

## Réponse rapide

Pour savoir **quelle branche est la plus récente et la plus à jour**, utilisez le script fourni :

### Linux/Mac
```bash
bash scripts/check-latest-branch.sh
```

### Windows PowerShell
```powershell
.\scripts\check-latest-branch.ps1
```

## État actuel des branches (au 12 novembre 2025)

D'après l'analyse du dépôt, voici les branches les plus récentes :

1. **copilot/check-latest-branch** - 2025-11-12 12:06:42 (la plus récente)
2. **chore/update-firebase-tools** - 2025-11-11 17:48:28
3. **dependabot/npm_and_yarn/dependencies-a021a4e6b2** - 2025-11-11 09:37:44
4. **main** - 2025-11-11 10:12:43

### Conclusion

La branche **main** n'est pas la plus récente actuellement. Plusieurs branches ont des commits plus récents :

- `chore/update-firebase-tools` contient une mise à jour de firebase-tools
- Plusieurs branches Dependabot contiennent des mises à jour de dépendances

## Comment vérifier manuellement

Si vous souhaitez vérifier manuellement sans utiliser le script :

### Lister toutes les branches par date
```bash
git fetch --all
git for-each-ref --sort=-committerdate refs/remotes/origin/ --format='%(committerdate:short) %(refname:short) - %(subject)' | head -10
```

### Comparer une branche avec main
```bash
# Voir les commits sur une branche qui ne sont pas sur main
git log origin/main..origin/nom-de-la-branche

# Voir les commits sur main qui ne sont pas sur une autre branche
git log origin/nom-de-la-branche..origin/main
```

## Recommandations

1. **Pour le développement actif** : Utilisez la branche `main` comme base, elle contient le code stable
2. **Pour les mises à jour** : Considérez merger les branches de mise à jour (Dependabot, firebase-tools) dans main
3. **Vérification régulière** : Exécutez le script `check-latest-branch` régulièrement pour suivre l'évolution des branches

## Commandes Git utiles

```bash
# Récupérer les dernières informations
git fetch --all

# Voir l'historique de toutes les branches
git log --all --graph --oneline --decorate

# Comparer deux branches
git diff origin/main..origin/autre-branche

# Voir les branches fusionnées dans main
git branch -r --merged origin/main

# Voir les branches non fusionnées dans main
git branch -r --no-merged origin/main
```

## Voir aussi

- [Documentation Git](https://git-scm.com/doc)
- [Guide des branches Git](https://git-scm.com/book/fr/v2/Les-branches-avec-Git-Les-branches-en-bref)
