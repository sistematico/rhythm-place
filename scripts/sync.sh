#!/usr/bin/env bash
set -euo pipefail

LOCAL_DIR="${LOCAL_DIR:-/home/lucas/music/rtm}"
REMOTE_USER="${REMOTE_USER:-liquidsoap}"
REMOTE_HOST="${REMOTE_HOST:-ate}"
REMOTE_DIR="${REMOTE_DIR:-/var/music/rtm}"

if ! command -v rsync >/dev/null 2>&1; then
  echo "rsync nao encontrado no sistema." >&2
  exit 1
fi

if [[ ! -d "$LOCAL_DIR" ]]; then
  echo "Pasta local nao encontrada: $LOCAL_DIR" >&2
  exit 1
fi

rsync \
  --archive \
  --verbose \
  --human-readable \
  --compress \
  --delete \
  --info=progress2 \
  "$@" \
  "$LOCAL_DIR/" \
  "$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/"