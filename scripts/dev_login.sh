#!/usr/bin/env bash
set -euo pipefail

if [[ -n "${FIREBASE_TOKEN:-}" ]]; then
  echo "Using FIREBASE_TOKEN from environment."
  exit 0
fi

echo "Launching 'firebase login'..."
firebase login || true

