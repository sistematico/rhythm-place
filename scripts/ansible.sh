#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR/ansible"

create_vault() {
  VAULT_FILE="$ROOT_DIR/ansible/group_vars/all/vault.yml"
  VAULT_EXAMPLE="$ROOT_DIR/ansible/group_vars/all/vault.yml.example"
  VAULT_PASS_FILE="$ROOT_DIR/ansible/.vault_pass"

  if [[ ! -f "$VAULT_PASS_FILE" ]]; then
    echo "Crie a senha do vault em: $VAULT_PASS_FILE"
    umask 177
    read -r -s -p "Senha do vault: " VAULT_PASS
    echo
    printf '%s\n' "$VAULT_PASS" > "$VAULT_PASS_FILE"
  fi

  if [[ ! -f "$VAULT_FILE" ]]; then
    cp "$VAULT_EXAMPLE" "$VAULT_FILE"
  fi

  ansible-vault encrypt "$VAULT_FILE" --vault-password-file "$VAULT_PASS_FILE"
  echo "Vault inicializado em $VAULT_FILE"
}

if [[ ! -f .vault_pass ]]; then
  echo "Vault não encontrado. Criando vault..."
  create_vault
fi

ansible-playbook -i hosts site.yml "$@"
