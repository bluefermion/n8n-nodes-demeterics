#!/bin/bash
set -euo pipefail

# Optional overrides:
#   DIR=/opt/n8n/n8n_data ./restart.sh
#   COMPOSE_FILE=/opt/n8n/docker-compose.yml ./restart.sh
#   REMOTE=origin BRANCH=main ./restart.sh
#   STASH=1 ./restart.sh          # auto-stash local changes during pull

DIR=${DIR:-/opt/n8n/n8n_data}
COMPOSE_FILE=${COMPOSE_FILE:-/opt/n8n/docker-compose.yml}

# Move to repo root (directory of this script)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Update working tree from git if available
if [ -d .git ]; then
  echo "[demeterics] Updating repository via git"
  REMOTE=${REMOTE:-origin}
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD || echo HEAD)
  if [ "$CURRENT_BRANCH" = "HEAD" ]; then
    BRANCH=${BRANCH:-main}
  else
    BRANCH=${BRANCH:-$CURRENT_BRANCH}
  fi

  # Check for local changes
  if ! git diff --quiet || ! git diff --cached --quiet; then
    if [ "${STASH:-0}" = "1" ]; then
      echo "[demeterics] Local changes detected — stashing before pull"
      git stash push -u -m "restart.sh auto-stash $(date +%F_%T)"
      STASHED=1
    else
      echo "[demeterics] Local changes detected. Set STASH=1 to auto-stash, or commit/discard changes."
      exit 1
    fi
  fi

  git fetch --all --prune
  git pull --rebase "$REMOTE" "$BRANCH"

  if [ "${STASHED:-0}" = "1" ]; then
    echo "[demeterics] Restoring stashed changes"
    git stash pop || true
  fi
else
  echo "[demeterics] Not a git repository — skipping git pull"
fi

echo "[demeterics] Install latest package"
pnpm install

echo "[demeterics] Building and installing into: ${DIR}/custom"
make install-custom DIR="${DIR}"

echo "[demeterics] Restarting n8n via docker compose"
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  sudo docker compose -f "${COMPOSE_FILE}" restart n8n
elif command -v docker-compose >/dev/null 2>&1; then
  sudo docker-compose -f "${COMPOSE_FILE}" restart n8n
else
  echo "Error: docker compose/docker-compose not found" >&2
  exit 1
fi

# Optional: verify files inside container
# sudo docker exec -it n8n sh -lc 'ls -la /home/node/.n8n/custom/node_modules/n8n-nodes-demeterics/dist/nodes'
docker compose -f "$COMPOSE_FILE" logs -f --tail 100 n8n

