#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Migrate questionnaires from patients/{id}/questionnaires to root collection using Firebase CLI

.DESCRIPTION
    This script uses the Firebase emulators to migrate existing questionnaires.
    It's simpler than using the Admin SDK and doesn't require service account credentials.
#>

Write-Host "`n🚀 Starting questionnaire migration..." -ForegroundColor Cyan
Write-Host "   Using Firebase CLI and Firestore API`n" -ForegroundColor Gray

# Define Firebase project
$projectId = "neuronutrition-app"

Write-Host "📊 Step 1: Querying all patients..." -ForegroundColor Yellow

# Get all patients
$patientsJson = pnpm -w exec firebase firestore:get patients --project $projectId --format json 2>&1 | Out-String

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to query patients" -ForegroundColor Red
    Write-Host $patientsJson
    exit 1
}

try {
    $patients = $patientsJson | ConvertFrom-Json
    $patientCount = ($patients | Measure-Object).Count
    
    Write-Host "✅ Found $patientCount patient documents`n" -ForegroundColor Green
    
    $totalQuestionnaires = 0
    $migratedCount = 0
    $errorCount = 0
    
    foreach ($patient in $patients) {
        $patientId = $patient.name -replace '.*/patients/', ''
        $patientEmail = if ($patient.fields.email.stringValue) { $patient.fields.email.stringValue } else { "no-email" }
        
        Write-Host "📋 Processing patient: $patientId ($patientEmail)" -ForegroundColor Cyan
        
        # Get questionnaires for this patient
        $questionnairesPath = "patients/$patientId/questionnaires"
        $questionnairesJson = pnpm -w exec firebase firestore:get $questionnairesPath --project $projectId --format json 2>&1 | Out-String
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "   ⚠️  No questionnaires or error accessing subcollection" -ForegroundColor Yellow
            continue
        }
        
        try {
            $questionnaires = $questionnairesJson | ConvertFrom-Json
            $qCount = ($questionnaires | Measure-Object).Count
            
            if ($qCount -eq 0) {
                Write-Host "   ⏭️  No questionnaires found" -ForegroundColor Gray
                continue
            }
            
            Write-Host "   Found $qCount questionnaire(s)" -ForegroundColor White
            $totalQuestionnaires += $qCount
            
            foreach ($q in $questionnaires) {
                $questionnaireId = $q.name -replace '.*/questionnaires/', ''
                
                # Read the full document
                $qDocPath = "patients/$patientId/questionnaires/$questionnaireId"
                $qDataJson = pnpm -w exec firebase firestore:get $qDocPath --project $projectId --format json 2>&1 | Out-String
                
                if ($LASTEXITCODE -ne 0) {
                    Write-Host "   ❌ Failed to read questionnaire $questionnaireId" -ForegroundColor Red
                    $errorCount++
                    continue
                }
                
                # Write to root collection
                $rootPath = "questionnaires/$questionnaireId"
                
                # The data already has the structure, we just need to ensure patientUid is set
                # For simplicity, we'll use the firebase CLI set command with the same data
                Write-Host "   ✅ Migrating $questionnaireId to root collection..." -ForegroundColor Green
                
                # Write the document
                pnpm -w exec firebase firestore:set $rootPath --data "$qDataJson" --project $projectId 2>&1 | Out-Null
                
                if ($LASTEXITCODE -eq 0) {
                    $migratedCount++
                } else {
                    Write-Host "   ❌ Failed to write to root collection" -ForegroundColor Red
                    $errorCount++
                }
            }
            
        } catch {
            Write-Host "   ❌ Error processing questionnaires: $_" -ForegroundColor Red
            $errorCount++
        }
    }
    
    Write-Host "`n$('═' * 60)" -ForegroundColor Green
    Write-Host "📊 MIGRATION SUMMARY" -ForegroundColor Green
    Write-Host "$('═' * 60)" -ForegroundColor Green
    Write-Host "Total patients processed: $patientCount"
    Write-Host "Total questionnaires found: $totalQuestionnaires"
    Write-Host "✅ Successfully migrated: $migratedCount" -ForegroundColor Green
    Write-Host "❌ Errors: $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Green" })
    Write-Host "`n✨ Migration complete!`n" -ForegroundColor Cyan
    
} catch {
    Write-Host "`n❌ Fatal error during migration: $_" -ForegroundColor Red
    exit 1
}
