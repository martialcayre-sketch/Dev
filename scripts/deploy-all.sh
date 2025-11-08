#!/bin/bash
set -e

echo "🚀 Déploiement complet de NeuroNutrition"
echo "========================================="
echo ""

# 1. Build les packages partagés
echo "📦 Build des packages partagés..."
pnpm -C packages/shared-questionnaires build
echo "✅ Packages built"
echo ""

# 2. Build les frontends
echo "🏗️  Build des applications frontend..."
pnpm build:web
echo "✅ Frontends built"
echo ""

# 3. Deploy API sur Cloud Run
echo "☁️  Déploiement de l'API sur Cloud Run..."
gcloud run deploy api \
  --source=api \
  --region=europe-west1 \
  --allow-unauthenticated \
  --project=neuronutrition-app
echo "✅ API déployée"
echo ""

# 4. Deploy Firebase Hosting
echo "🔥 Déploiement Firebase Hosting (patient + practitioner)..."
firebase deploy --only hosting:patient,hosting:practitioner --project neuronutrition-app
echo "✅ Hosting déployé"
echo ""

echo "🎉 Déploiement complet terminé !"
echo ""
echo "URLs:"
echo "  - Patient: https://neuronutrition-app.web.app"
echo "  - Practitioner: https://neuronutrition-app.web.app"
echo "  - API: https://api-[hash]-ew.a.run.app (via /api/** sur hosting)"
