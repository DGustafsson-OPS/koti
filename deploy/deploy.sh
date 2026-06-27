#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/home/tervakuja-koti/htdocs/koti.tervakuja.fi"
SERVICE_NAME="koti"
NODE_BIN="/home/koti-ssh/.nvm/versions/node/v22.23.1/bin"
DEPLOY_HOST="${DEPLOY_HOST:-koti.tervakuja.fi}"
DEPLOY_USER="${DEPLOY_USER:-koti-ssh}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "→ Syncing source to ${DEPLOY_USER}@${DEPLOY_HOST}:${APP_DIR}"
rsync -rlvz --delete --omit-dir-times --no-perms \
  --exclude node_modules \
  --exclude .next \
  --exclude .git \
  --exclude release \
  --exclude .env \
  --exclude data \
  --exclude "*.db" \
  --exclude .env.local \
  "${REPO_ROOT}/" "${DEPLOY_USER}@${DEPLOY_HOST}:${APP_DIR}/"

echo "→ Building and restarting on server"
ssh "${DEPLOY_USER}@${DEPLOY_HOST}" bash -s <<EOF
set -euo pipefail
export PATH="${NODE_BIN}:\$PATH"
cd "${APP_DIR}"

if [ ! -f .env ]; then
  echo "Missing ${APP_DIR}/.env — create it from .env.example first"
  exit 1
fi

set -a
source .env
set +a

npm ci --include=dev
npm run db:push
npm run build

rm -rf release
mkdir -p release
cp -r .next/standalone/. release/
mkdir -p release/.next
cp -r .next/static release/.next/static
cp -r public release/public 2>/dev/null || mkdir -p release/public

mkdir -p "${APP_DIR}/data/uploads"
chmod 750 "${APP_DIR}/data" "${APP_DIR}/data/uploads" 2>/dev/null || true

EOF

echo "→ Restarting service"
ssh root@virtual05.dennisgustafsson.net "systemctl restart ${SERVICE_NAME} && sleep 2 && curl -sf -o /dev/null -w '%{http_code}' http://127.0.0.1:8088/ && echo ' OK'"

echo "→ Deploy complete: https://koti.tervakuja.fi"
