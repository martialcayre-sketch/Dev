#!/bin/bash
# Script pour configurer Workload Identity Federation pour GitHub Actions

PROJECT_ID="neuronutrition-app"
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
POOL_NAME="github-actions-pool"
PROVIDER_NAME="github-provider"
SA_NAME="github-deployer"
REPO="martialcayre-sketch/Dev"

echo "🔧 Configuration Workload Identity pour GitHub Actions..."

# 1. Créer le service account
echo "📝 Création du service account..."
gcloud iam service-accounts create $SA_NAME \
  --display-name="GitHub Actions Deployer" \
  --project=$PROJECT_ID

# 2. Donner les permissions nécessaires
echo "🔐 Attribution des rôles..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.builder"

# 3. Créer le Workload Identity Pool
echo "🏊 Création du Workload Identity Pool..."
gcloud iam workload-identity-pools create $POOL_NAME \
  --location="global" \
  --display-name="GitHub Actions Pool" \
  --project=$PROJECT_ID

# 4. Créer le provider GitHub
echo "🔗 Création du provider GitHub..."
gcloud iam workload-identity-pools providers create-oidc $PROVIDER_NAME \
  --location="global" \
  --workload-identity-pool=$POOL_NAME \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --project=$PROJECT_ID

# 5. Lier le service account au repository GitHub
echo "🔗 Liaison service account <-> GitHub repo..."
gcloud iam service-accounts add-iam-policy-binding \
  "${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/attribute.repository/${REPO}" \
  --project=$PROJECT_ID

# 6. Afficher les valeurs pour les secrets GitHub
echo ""
echo "✅ Configuration terminée !"
echo ""
echo "📋 Ajouter ces secrets dans GitHub (Settings → Secrets and variables → Actions) :"
echo ""
echo "GCP_WORKLOAD_IDENTITY_PROVIDER:"
echo "projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/providers/${PROVIDER_NAME}"
echo ""
echo "GCP_DEPLOYER_SA:"
echo "${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
echo ""
echo "GCP_PROJECT_ID:"
echo "${PROJECT_ID}"
