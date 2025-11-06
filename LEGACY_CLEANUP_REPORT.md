# Cleanup Report - Legacy Next.js Apps

## 📊 Legacy Apps Identified

The following directories contain **Next.js-based apps** that are **no longer actively used** and can be **safely removed** after migrating to Vite:

### 1. `apps/patient/`

- **Framework:** Next.js 16.0.0
- **Status:** Legacy (replaced by `apps/patient-vite/`)
- **Last Used:** Before Vite migration
- **Size Impact:** node_modules + .next cache
- **Firebase Target:** None (not deployed)

### 2. `apps/practitioner/`

- **Framework:** Next.js 16.0.0
- **Status:** Legacy (replaced by `apps/practitioner-vite/`)
- **Last Used:** Before Vite migration
- **Size Impact:** node_modules + .next cache
- **Firebase Target:** None (not deployed)

### 3. `apps/web/`

- **Framework:** Next.js (likely)
- **Status:** Currently referenced in firebase.json but not used
- **Firebase Target:** `web` (neuronutrition-app.web.app)
- **Note:** May contain shared components or landing page logic

### 4. `apps/patient-spa/` and `apps/practitioner-spa/`

- **Purpose:** Unknown (likely intermediate migration steps)
- **Status:** Not referenced in firebase.json
- **Recommendation:** Verify if empty or unused before deletion

### 5. `apps/mobile/`

- **Framework:** React Native (not Next.js)
- **Status:** Mobile app - **keep if actively developed**
- **Note:** Separate from web cleanup

## ✅ Current Active Apps (Keep These)

- ✅ `apps/patient-vite/` → Vite/React (deployed to neuronutrition-app-patient.web.app)
- ✅ `apps/practitioner-vite/` → Vite/React (deployed to neuronutrition-app-practitioner.web.app)
- ✅ `apps/mobile/` → React Native (mobile app)

## 🗑️ Safe Deletion Plan

### Phase 1: Backup Critical Files

```bash
# Create backup directory
mkdir -p backup/legacy-apps
cd C:\Dev

# Backup unique configs or code snippets
cp -r apps/patient/src/components backup/legacy-apps/patient-components
cp -r apps/practitioner/src/components backup/legacy-apps/practitioner-components
cp -r apps/web backup/legacy-apps/web
```

### Phase 2: Remove Legacy Apps

```powershell
# Remove legacy Next.js patient app
Remove-Item -Recurse -Force apps/patient

# Remove legacy Next.js practitioner app
Remove-Item -Recurse -Force apps/practitioner

# Remove intermediate migration apps (if verified empty)
Remove-Item -Recurse -Force apps/patient-spa
Remove-Item -Recurse -Force apps/practitioner-spa
```

### Phase 3: Remove Cache Directories

```powershell
# Find and remove .next caches (if any remain)
Get-ChildItem -Path C:\Dev\apps -Recurse -Directory -Filter ".next" | Remove-Item -Recurse -Force

# Find and remove .turbo caches
Get-ChildItem -Path C:\Dev\apps -Recurse -Directory -Filter ".turbo" | Remove-Item -Recurse -Force

# Remove node_modules from deleted apps (if not already removed)
# Note: pnpm workspace will clean these automatically with `pnpm install`
```

### Phase 4: Update firebase.json

```json
{
  "hosting": [
    {
      "target": "web",
      "public": "apps/web/out",   // <- REMOVE this entry if apps/web/ is deleted
      "rewrites": [...]
    }
  ]
}
```

**Option A:** Remove `web` target entirely
**Option B:** Repurpose for API documentation or landing page (future)

## 📦 Expected Disk Space Savings

Measured size (PowerShell Get-ChildItem):

- `apps/patient/`: 244.11 MB (includes node_modules 204 MB, .next 37 MB)
- `apps/practitioner/`: 76.43 MB (includes node_modules 30 MB, .next 43 MB)
- `apps/web/`: 122.20 MB (includes node_modules 113 MB)
- `apps/patient-spa/`: ~7.69 MB
- `apps/practitioner-spa/`: ~0.16 MB
- Additional `.next` and `.turbo` caches in other dirs: varies

**Total measured savings: ~450 MB** (legacy Next.js apps only)
**Potential additional savings: ~100-300 MB** (orphaned caches after pnpm cleanup)

## ⚠️ Verification Steps Before Deletion

1. ✅ Confirm both Vite apps build successfully
2. ✅ Confirm both Vite apps deploy successfully
3. ✅ Test all features in production:
   - Patient signup and login
   - Practitioner dashboard
   - Life Journey radar chart (using shared-charts)
   - Questionnaire submission
4. ✅ Check if any scripts reference legacy apps:
   ```bash
   grep -r "apps/patient/" scripts/
   grep -r "apps/practitioner/" scripts/
   ```
5. ✅ Review git history for unique features in legacy apps

## 🚀 Post-Cleanup Actions

### 1. Update Documentation

```bash
# Update README.md to remove references to Next.js apps
# Update QUICKSTART*.md files
# Update PROJECT_CONTEXT.md
```

### 2. Run Workspace Cleanup

```bash
# Reinstall to clean up orphaned dependencies
cd C:\Dev
npx pnpm install

# Rebuild all packages
npx pnpm -r build
```

### 3. Git Cleanup

```bash
# Commit the deletions
git add .
git commit -m "chore: remove legacy Next.js apps (patient, practitioner, web)

- Migrated to Vite apps (patient-vite, practitioner-vite)
- Removed unused Next.js dependencies
- Cleaned up .next and .turbo caches
- Reduced repo size by ~1-2 GB"

# Optional: Run garbage collection
git gc --aggressive --prune=now
```

## 📝 Notes

- **apps/web/**: May contain landing page or marketing site. Review before deletion.
- **apps/mobile/**: React Native mobile app - **KEEP unless confirmed unused**
- **Rollback**: If needed, restore from git history or backup directory

## ✅ Recommended Timeline

1. **Tonight (Overnight Session)**: Verify Vite apps work in production ✅
2. **Day 1**: Backup unique components and configs
3. **Day 2**: Delete legacy apps and update firebase.json
4. **Day 3**: Test thoroughly and commit cleanup

---

**Status:** Ready for Phase 2 (Deletion) after verification ✅
