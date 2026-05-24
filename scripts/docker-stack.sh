#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env.docker"
ENV_EXAMPLE="$ROOT_DIR/.env.docker.example"
PLAYLIST_DIR="$ROOT_DIR/playlists"

usage() {
  cat <<'EOF'
Uso: ./scripts/docker-stack.sh <comando>

Comandos:
  up         Prepara a playlist e sobe a stack com build
  down       Para e remove a stack
  restart    Recria a playlist e reinicia a stack
  playlist   Regera a playlist a partir de MUSIC_DIR
  logs       Exibe logs da stack ou de um servico especifico
  ps         Lista os containers da stack
  config     Mostra a configuracao resolvida do docker compose
EOF
}

die() {
  printf 'Erro: %s\n' "$1" >&2
  exit 1
}

ensure_env_file() {
  if [[ -f "$ENV_FILE" ]]; then
    return
  fi

  cp "$ENV_EXAMPLE" "$ENV_FILE"
  printf 'Arquivo %s criado a partir do exemplo. Ajuste MUSIC_DIR e as senhas antes de subir a stack.\n' "$ENV_FILE"
}

trim_quotes() {
  local value="$1"

  value="${value#\"}"
  value="${value%\"}"
  value="${value#\'}"
  value="${value%\'}"

  printf '%s' "$value"
}

get_music_dir() {
  local line

  ensure_env_file
  line="$(sed -n 's/^MUSIC_DIR=//p' "$ENV_FILE" | head -n 1)"
  line="$(trim_quotes "$line")"

  [[ -n "$line" ]] || die "Defina MUSIC_DIR em $ENV_FILE"
  [[ -d "$line" ]] || die "A pasta MUSIC_DIR nao existe: $line"

  (
    cd "$line"
    pwd
  )
}

compose() {
  ensure_env_file

  if docker compose version >/dev/null 2>&1; then
    docker compose --env-file "$ENV_FILE" "$@"
    return
  fi

  if command -v docker-compose >/dev/null 2>&1; then
    docker-compose --env-file "$ENV_FILE" "$@"
    return
  fi

  die "Docker Compose nao esta disponivel"
}

prepare_playlist() {
  local music_dir
  local file
  local rel_path
  local link_path
  local count=0

  music_dir="$(get_music_dir)"

  rm -rf "$PLAYLIST_DIR"
  mkdir -p "$PLAYLIST_DIR"

  while IFS= read -r -d '' file; do
    rel_path="${file#"$music_dir"/}"
    link_path="$PLAYLIST_DIR/$rel_path"

    mkdir -p "$(dirname "$link_path")"
    ln -s "/music/$rel_path" "$link_path"
    count=$((count + 1))
  done < <(
    find "$music_dir" -type f \(
      -iname '*.aac' -o
      -iname '*.flac' -o
      -iname '*.m4a' -o
      -iname '*.mp3' -o
      -iname '*.ogg' -o
      -iname '*.opus' -o
      -iname '*.wav' -o
      -iname '*.webm'
    \) -print0
  )

  [[ "$count" -gt 0 ]] || die "Nenhum arquivo de audio encontrado em $music_dir"

  printf 'Playlist preparada com %s arquivos em %s\n' "$count" "$PLAYLIST_DIR"
}

command="${1:-}"

case "$command" in
  up)
    prepare_playlist
    compose up --build -d
    ;;
  down)
    compose down
    ;;
  restart)
    prepare_playlist
    compose down
    compose up --build -d
    ;;
  playlist)
    prepare_playlist
    ;;
  logs)
    shift || true
    compose logs -f "$@"
    ;;
  ps)
    compose ps
    ;;
  config)
    compose config
    ;;
  help|-h|--help|'')
    usage
    ;;
  *)
    usage
    exit 1
    ;;
esac