#!/bin/bash
# Copier shared-questionnaires compilé dans node_modules avant le build Cloud
mkdir -p node_modules/@neuronutrition/shared-questionnaires
cp -r ../packages/shared-questionnaires/dist node_modules/@neuronutrition/shared-questionnaires/
cp ../packages/shared-questionnaires/package.json node_modules/@neuronutrition/shared-questionnaires/
echo "✓ Copied shared-questionnaires to node_modules"
