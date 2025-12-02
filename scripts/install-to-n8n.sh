#!/usr/bin/env bash
set -euo pipefail

# Install the built package into an n8n user folder (community nodes location).
#
# Usage:
#   sudo scripts/install-to-n8n.sh [/opt/n8n]
#
# Notes:
# - Ensure your n8n service uses this folder via `N8N_USER_FOLDER`.
# - Example systemd override:
#     sudo mkdir -p /etc/systemd/system/n8n.service.d
#     printf "[Service]\nEnvironment=N8N_USER_FOLDER=%s\n" "/opt/n8n" | sudo tee /etc/systemd/system/n8n.service.d/override.conf
#     sudo systemctl daemon-reload && sudo systemctl restart n8n

TARGET_DIR="${1:-/opt/n8n}"

echo "Installing to: ${TARGET_DIR}"

if [[ $EUID -ne 0 ]]; then
  echo "This script may need sudo to install into ${TARGET_DIR}" >&2
fi

echo "Building package…"
pnpm install --frozen-lockfile || pnpm install
pnpm build

echo "Packing tarball…"
TARBALL=$(npm pack | tail -n1)
TARBALL_PATH="$(pwd)/${TARBALL}"
echo "Created: ${TARBALL_PATH}"

echo "Installing into n8n user folder node_modules…"
npm install --prefix "${TARGET_DIR}" "${TARBALL_PATH}"

echo "Installed at: ${TARGET_DIR}/node_modules/n8n-nodes-demeterics"
echo "Restart your n8n service to load the node."
echo "If needed, set N8N_USER_FOLDER=${TARGET_DIR} in your service environment."

