#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR/ansible"

if [[ ! -f .vault_pass ]]; then
  echo "Arquivo ansible/.vault_pass nao encontrado. Rode scripts/ansible-vault-init.sh primeiro."
  exit 1
fi

ansible-playbook -i hosts site.yml "$@"
