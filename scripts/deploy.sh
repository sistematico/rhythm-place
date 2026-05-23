#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Executa provisionamento completo no host 'ate'.
"$ROOT_DIR/scripts/ansible-provision.sh" "$@"
