# Nouvelle Charte Graphique - Application Patient

## 🎨 Changements effectués

### 1. Palette de couleurs NeuroNutrition

**Fichier modifié** : `apps/patient-vite/tailwind.config.js`

**Ancienne palette** (bleu générique) :

```javascript
primary: {
  400: '#38bdf8',
  500: '#0ea5e9',
  600: '#0284c7',
}
```

**Nouvelle palette NN** (cohérente avec l'app praticien) :

```javascript
'nn-primary': {
  400: '#6f8cf6',  // Bleu-violet clair
  500: '#4f6cf0',  // Bleu-violet principal
  600: '#3f5ce0',  // Bleu-violet foncé
},
'nn-accent': {
  200: '#b9e8ff',  // Cyan très clair
  400: '#6fd6ff',  // Cyan clair
  500: '#2bc7ff',  // Cyan principal
  600: '#1ab7ef',  // Cyan foncé
}
```

### 2. Sidebar Navigation

**Nouveau composant** : `apps/patient-vite/src/components/layout/Sidebar.tsx`

**Caractéristiques** :

- ✅ Navigation verticale sur desktop (masquée sur mobile)
- ✅ Logo NeuroNutrition avec gradient `nn-primary` → `nn-accent`
- ✅ 7 sections principales :
  - 📊 Tableau de bord
  - 📅 Espace consultation
  - 👤 Identification
  - ❤️ Anamnèse
  - 📋 Questionnaires
  - 🥗 Plan nutrition
  - 📄 Documents
- ✅ Highlight actif avec shadow `nn-primary`
- ✅ Encart aide en bas avec gradient

**Code de la navigation** :

```typescript
const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: Home },
  { name: 'Espace consultation', href: '/dashboard/consultation', icon: CalendarCheck },
  { name: 'Identification', href: '/dashboard/identification', icon: User },
  { name: 'Anamnèse', href: '/dashboard/anamnese', icon: HeartPulse },
  { name: 'Questionnaires', href: '/dashboard/questionnaires', icon: ClipboardList },
  { name: 'Plan nutrition', href: '/dashboard/plan', icon: Salad },
  { name: 'Documents', href: '/dashboard/documents', icon: FileText },
];
```

### 3. Layout DashboardShell

**Fichier modifié** : `apps/patient-vite/src/components/layout/DashboardShell.tsx`

**Changements** :

- ✅ Ajout de `<Sidebar />` à gauche
- ✅ Fond sombre `bg-slate-950` (au lieu de clair)
- ✅ Gradient `from-slate-950 via-slate-900/60 to-slate-950`
- ✅ Loading spinner avec bordure `nn-primary-500`
- ✅ Layout flex avec sidebar fixe + contenu scrollable

**Structure** :

```
┌─────────────┬────────────────────┐
│             │  Header (sticky)   │
│   Sidebar   ├────────────────────┤
│   (fixed)   │                    │
│             │   Main Content     │
│             │   (scrollable)     │
│             │                    │
└─────────────┴────────────────────┘
```

### 4. Header

**Fichier modifié** : `apps/patient-vite/src/components/layout/Header.tsx`

**Changements** :

- ✅ Fond sombre `bg-slate-950/70` avec backdrop-blur
- ✅ Bordure `border-white/10`
- ✅ Texte blanc `text-white`
- ✅ Logo masqué sur desktop (visible dans sidebar)
- ✅ Avatar avec bordure arrondie
- ✅ Bouton déconnexion avec `bg-white/5 hover:bg-white/10`

### 5. Icônes Lucide

**Icônes utilisées** (cohérentes avec l'app praticien) :

- 🏠 `Home` - Tableau de bord
- 📅 `CalendarCheck` - Consultations
- 👤 `User` - Identification
- ❤️ `HeartPulse` - Anamnèse
- 📋 `ClipboardList` - Questionnaires
- 🥗 `Salad` - Plan nutrition
- 📄 `FileText` - Documents
- 🔔 `Bell` - Notifications
- 🚪 `LogOut` - Déconnexion

---

## 📦 Dépendances ajoutées

**Fichier modifié** : `apps/patient-vite/package.json`

```json
"dependencies": {
  "clsx": "^2.1.1",  // ✅ Nouvelle dépendance pour classes conditionnelles
  // ... autres dépendances existantes
}
```

---

## 🎨 Éléments de design

### Gradients

**Logo sidebar** :

```css
bg-gradient-to-br from-nn-primary-500 to-nn-accent-500
shadow-lg shadow-nn-primary-500/40
```

**Background principal** :

```css
bg-gradient-to-br from-slate-950 via-slate-900/60 to-slate-950
```

**Encart aide** :

```css
bg-gradient-to-r from-nn-primary-500/15 via-transparent to-nn-accent-500/15
```

### Bordures et effets

**Bordures** : `border-white/10` (semi-transparent)  
**Hover sidebar** : `bg-white/5 hover:bg-white/10`  
**Item actif** : `bg-white/10 shadow-lg shadow-nn-primary-500/20`  
**Backdrop blur** : `backdrop-blur-xl` (header et sidebar)

### Typographie

**Titres sidebar** : `text-xs uppercase tracking-wider text-white/40`  
**Items menu** : `text-sm font-medium`  
**Logo** : `text-lg font-semibold text-white`

---

## 🚀 Déploiement

**Build** : ✅ Succès (731.60 kB JS, 28.95 kB CSS)  
**Deploy** : ✅ Succès  
**URL** : https://neuronutrition-app-patient.web.app

---

## 📸 Comparaison Avant/Après

### Avant

- Fond blanc avec mode sombre optionnel
- Pas de sidebar
- Navigation uniquement dans le header
- Palette bleu générique (`primary-500: #0ea5e9`)
- Design minimaliste

### Après

- ✅ Fond sombre permanent (cohérence avec app praticien)
- ✅ Sidebar navigation avec 7 sections
- ✅ Palette NeuroNutrition (`nn-primary-500: #4f6cf0`, `nn-accent-500: #2bc7ff`)
- ✅ Logo avec gradient brandé
- ✅ Effets visuels (gradients, shadows, blur)
- ✅ Design premium et cohérent

---

## 🎯 Cohérence avec l'app Praticien

| Élément              | Patient               | Praticien             | Statut       |
| -------------------- | --------------------- | --------------------- | ------------ |
| Palette `nn-primary` | ✅ `#4f6cf0`          | ✅ `#4f6cf0`          | ✅ Identique |
| Palette `nn-accent`  | ✅ `#2bc7ff`          | ✅ `#2bc7ff`          | ✅ Identique |
| Sidebar layout       | ✅ Gauche             | ✅ Gauche             | ✅ Identique |
| Background           | ✅ `slate-950`        | ✅ `slate-950`        | ✅ Identique |
| Logo gradient        | ✅ Primary→Accent     | ✅ Primary→Accent     | ✅ Identique |
| Bordures             | ✅ `white/10`         | ✅ `white/10`         | ✅ Identique |
| Header blur          | ✅ `backdrop-blur-xl` | ✅ `backdrop-blur-xl` | ✅ Identique |
| Icônes               | ✅ Lucide             | ✅ Lucide             | ✅ Identique |

---

## ✅ Points clés

1. **Cohérence visuelle** : Les deux apps (patient et praticien) partagent maintenant la même identité visuelle NeuroNutrition
2. **Navigation améliorée** : Sidebar accessible sur desktop avec 7 sections claires
3. **Design premium** : Gradients, shadows, blur effects pour un aspect moderne
4. **Accessibilité** : Contrastes suffisants avec texte blanc sur fond sombre
5. **Responsive** : Sidebar masquée sur mobile, logo dans header pour petits écrans

**La nouvelle charte graphique est maintenant déployée et opérationnelle ! 🎉**
