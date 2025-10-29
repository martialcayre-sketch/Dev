#!/bin/bash
# Script pour démarrer l'environnement de développement complet (Mac/Linux)
# Lance 3 terminaux : Émulateurs + Patient + Practitioner
# Usage: ./scripts/dev-local.sh

set -e

echo "🚀 Lancement de l'environnement de développement NeuroNutrition..."
echo ""

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Vérifier qu'on est dans le bon dossier
if [ ! -f "$PROJECT_ROOT/firebase.json" ]; then
    echo "❌ Erreur: firebase.json introuvable"
    echo "   Ce script doit être exécuté depuis le dossier racine du projet"
    exit 1
fi

echo "📦 Démarrage de 3 environnements..."
echo ""
echo "   1️⃣  Émulateurs Firebase (Auth, Firestore, Functions)"
echo "   2️⃣  App Patient (port 3020)"
echo "   3️⃣  App Practitioner (port 3010)"
echo ""

cd "$PROJECT_ROOT"

# Fonction pour ouvrir un nouveau terminal selon l'OS
open_terminal() {
    local title="$1"
    local command="$2"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        osascript -e "tell app \"Terminal\" to do script \"cd '$PROJECT_ROOT' && echo '$title' && $command\""
    elif command -v gnome-terminal &> /dev/null; then
        # Linux avec GNOME
        gnome-terminal --title="$title" -- bash -c "cd '$PROJECT_ROOT' && echo '$title' && $command; exec bash"
    elif command -v xterm &> /dev/null; then
        # Linux avec xterm
        xterm -title "$title" -e "cd '$PROJECT_ROOT' && echo '$title' && $command; bash" &
    else
        echo "⚠️  Terminal non supporté, utilisez les commandes manuelles"
        exit 1
    fi
}

# Terminal 1: Émulateurs Firebase
echo "🔥 Lancement des émulateurs Firebase..."
open_terminal "🔥 Firebase Emulators" "firebase emulators:start --only functions,firestore,auth"

# Attendre 3 secondes pour que les émulateurs démarrent
sleep 3

# Terminal 2: App Patient
echo "👤 Lancement de l'app Patient..."
open_terminal "👤 Patient App (port 3020)" "export NEXT_PUBLIC_USE_EMULATORS=1 && pnpm --filter @neuronutrition/patient dev"

# Attendre 2 secondes
sleep 2

# Terminal 3: App Practitioner
echo "👨‍⚕️ Lancement de l'app Practitioner..."
open_terminal "👨‍⚕️ Practitioner App (port 3010)" "export NEXT_PUBLIC_USE_EMULATORS=1 && export NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR=1 && pnpm --filter @neuronutrition/practitioner dev"

echo ""
echo "✅ Environnement de développement lancé !"
echo ""
echo "📋 URLs disponibles:"
echo "   🔥 Émulateurs UI:  http://localhost:5000"
echo "   👤 Patient:        http://localhost:3020"
echo "   👨‍⚕️ Practitioner:  http://localhost:3010"
echo "   🔧 API Health:     http://localhost:5002/neuronutrition-app/europe-west1/api/health"
echo ""
echo "💡 Astuce: Fermez les 3 terminaux pour arrêter tous les services"
echo ""
