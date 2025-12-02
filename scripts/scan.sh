#!/usr/bin/env bash
set -euo pipefail

PKG_NAME=$(node -p "require('./package.json').name" 2>/dev/null || echo "")
if [[ -z "$PKG_NAME" || "$PKG_NAME" == "undefined" ]]; then
  echo "Could not determine package name; skipping scan"
  exit 0
fi

echo "Scanning community package: $PKG_NAME"

# Check if package exists on npm; if not, skip to avoid scanner crash
if ! npm view "$PKG_NAME" name >/dev/null 2>&1; then
  echo "Package '$PKG_NAME' is not published on npm yet. Skipping scanner."
  exit 0
fi

# Run scanner against the published package name
npx @n8n/scan-community-package "$PKG_NAME"
