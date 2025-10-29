#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
NAME="neuronutrition-app"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$APP_DIR/../${NAME}-backup-$STAMP.tar.gz"

dry_run=true
if [[ "${NUKE:-NO}" == "YES" ]]; then dry_run=false; fi

log() { echo "[bootstrap] $*"; }
doit() { if $dry_run; then echo "[dry-run] $*"; else eval "$*"; fi }

log "Scoping to $APP_DIR"

if $dry_run; then
  log "Dry-run mode: set NUKE=YES to apply changes."
fi

if [ -d "$APP_DIR" ]; then
  log "Creating backup at $BACKUP"
  doit "tar -czf '$BACKUP' -C '$(dirname "$APP_DIR")' '$(basename "$APP_DIR")'"
fi

log "Ensuring directories exist"
doit "mkdir -p '$APP_DIR/apps/web' '$APP_DIR/apps/mobile' '$APP_DIR/functions'"

log "Bootstrap complete. Open in Dev Container and run pnpm i."

