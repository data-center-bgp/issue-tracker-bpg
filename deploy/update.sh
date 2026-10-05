#!/usr/bin/env bash
# Update the VPS to the latest main and rebuild (see DEPLOY.md).
# Run from anywhere: ./deploy/update.sh
#
# Nginx serves dist/ directly, so there is nothing to restart. The build
# empties dist/ first, so the site can briefly 404 while it runs.
set -euo pipefail
cd "$(dirname "$0")/.."

git pull --ff-only
npm ci
npm run build

echo "Updated to $(git log -1 --format='%h %s')"
