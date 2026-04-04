#!/bin/bash

# Configurações
CLIENT_ID="1467f2fd762c465ab5bf8f9a7cef8151"
CLIENT_SECRET="79cf6b80d94641d286cfcd24c1b470b3"
REFRESH_TOKEN="AQCUCVegaPqFx3g8HzVziB8bOce3ZkfW5x4dtE2oNtu3heV2TVMxJT1wWAHk-4A7Bhl7x9FnDRKcfwrD2U1Oc8AVaVLYSSQ3kcOsx-X94kHaAVK45fFvHyvIIntZmBDKm-0"
DEVICE_NAME="Rhythm Place"

# Esperar o librespot registrar no Spotify
sleep 30

# Obter access token
ACCESS_TOKEN=$(curl -s -X POST https://accounts.spotify.com/api/token \
  -u "${CLIENT_ID}:${CLIENT_SECRET}" \
  -d grant_type=refresh_token \
  -d refresh_token="${REFRESH_TOKEN}" | jq -r '.access_token')

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
  echo "[$(date)] Falha ao obter token" >> /var/log/liquidsoap/autoplay.log
  exit 1
fi

# Buscar o device_id do librespot
DEVICE_ID=""
for i in $(seq 1 10); do
  DEVICE_ID=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
    "https://api.spotify.com/v1/me/player/devices" | \
    jq -r ".devices[] | select(.name==\"${DEVICE_NAME}\") | .id")

  if [ -n "$DEVICE_ID" ] && [ "$DEVICE_ID" != "null" ]; then
    break
  fi
  echo "[$(date)] Tentativa $i - dispositivo não encontrado" >> /var/log/liquidsoap/autoplay.log
  sleep 10
done

if [ -z "$DEVICE_ID" ] || [ "$DEVICE_ID" = "null" ]; then
  echo "[$(date)] Dispositivo não encontrado após 10 tentativas" >> /var/log/liquidsoap/autoplay.log
  exit 1
fi

echo "[$(date)] Dispositivo encontrado: $DEVICE_ID" >> /var/log/liquidsoap/autoplay.log

# Transferir playback pro librespot e retomar
curl -s -X PUT "https://api.spotify.com/v1/me/player" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"device_ids\":[\"${DEVICE_ID}\"],\"play\":true}"

echo "[$(date)] Playback transferido" >> /var/log/liquidsoap/autoplay.log