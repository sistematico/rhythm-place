FROM debian:bookworm-slim

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends liquidsoap \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /var/lib/liquidsoap/playlists /var/log/liquidsoap

VOLUME ["/var/lib/liquidsoap/playlists"]

CMD ["liquidsoap", "/etc/liquidsoap/rhythm-place.liq"]
