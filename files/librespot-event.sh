#!/bin/bash

# librespot exporta variáveis de ambiente no evento:
# PLAYER_EVENT = "playing", "paused", "stopped", "changed", etc.
# TRACK_ID = spotify track id
# Mais: OLD_TRACK_ID, DURATION_MS, POSITION_MS

if [ "$PLAYER_EVENT" = "playing" ] || [ "$PLAYER_EVENT" = "changed" ]; then
  # Pegar metadados da track via Spotify API (embed)
  # Endpoint público, não precisa de auth:
  TRACK_ID="$TRACK_ID"

  if [ -n "$TRACK_ID" ]; then
    # Buscar metadata via oEmbed (não precisa de token!)
    META=$(curl -s "https://open.spotify.com/oembed?url=spotify:track:${TRACK_ID}")
    TITLE=$(echo "$META" | jq -r '.title // empty')

    if [ -n "$TITLE" ]; then
      # title do oEmbed vem como "Música - Artista"
      echo "spotify.insert_metadata title=\"${TITLE}\"" | \
        nc -q 1 127.0.0.1 1234 2>/dev/null

      echo "[$(date)] Now playing: ${TITLE}" >> /var/log/librespot-events.log
    fi
  fi
fi