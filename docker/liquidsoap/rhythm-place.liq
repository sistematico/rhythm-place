#!/usr/bin/liquidsoap
# rhythm.place — main stream (Docker dev)
# Mirrors the production liquidsoap config; connects to the 'icecast' container.

set("log.stdout", true)
set("log.level", 3)

# ─── Sources ───────────────────────────────────────────────────────────────────

playlist = playlist(
  mode = "randomize",
  reload = 3600,
  "/var/lib/liquidsoap/playlists"
)

# Fallback to silence when playlist is exhausted or unavailable
source = fallback(track_sensitive = false, [playlist, blank()])

# ─── Output ────────────────────────────────────────────────────────────────────

output.icecast(
  %mp3(bitrate = 128, samplerate = 44100, stereo = true),
  host = "icecast",
  port = 8000,
  password = getenv("ICECAST_SOURCE_PASSWORD"),
  mount = "/stream",
  name = "rhythm-place",
  description = "rhythm.place radio stream",
  url = "http://localhost",
  source
)
