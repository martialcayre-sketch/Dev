Param(
  [string]$ProjectId = "neuronutrition-app",
  [string]$PatientSite = "neuronutrition-app-patient",
  [string]$PractitionerSite = "neuronutrition-app-practitioner"
)

Write-Host "Using project: $ProjectId"
firebase use $ProjectId | Out-Null

Write-Host "Creating Hosting sites (idempotent) ..."
firebase hosting:sites:create $PatientSite 2>$null | Out-Null
firebase hosting:sites:create $PractitionerSite 2>$null | Out-Null

Write-Host "Mapping targets in .firebaserc ..."
firebase target:apply hosting patient $PatientSite
firebase target:apply hosting practitioner $PractitionerSite

Write-Host "Done. Build and deploy with: pnpm build:web && firebase deploy --only hosting:patient,hosting:practitioner"

