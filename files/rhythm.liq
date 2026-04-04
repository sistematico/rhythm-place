#!/usr/bin/liquidsoap

settings.log.file.set(true)
settings.log.file.path.set("/var/log/liquidsoap/radio.log")

settings.server.telnet.set(true)
settings.server.telnet.bind_addr.set("127.0.0.1")
settings.server.telnet.port.set(1234)

spotify = input.external.rawaudio(
  channels=2,
  samplerate=44100,
  restart=true,
  buffer=2.0,
  max=5.0,
  "/usr/local/bin/librespot-wrapper.sh"
)

sm = insert_metadata(spotify)

server.register(
  "update_meta",
  usage="update_meta <title>|<artist>|<album>",
  description="Update stream metadata",
  fun(s) -> begin
    parts = string.split(separator="|", s)
    title = list.nth(default="", parts, 0)
    artist = list.nth(default="", parts, 1)
    album = list.nth(default="", parts, 2)
    sm.insert_metadata([("title", title), ("artist", artist), ("album", album), ("song", "#{artist} - #{title}")])
    "OK: #{artist} - #{title}"
  end
)

silence = blank()
radio = fallback(track_sensitive=false, [sm, silence])

output.icecast(
  %mp3(bitrate=192),
  host="127.0.0.1",
  port=9000,
  password="hackme",
  mount="/main.mp3",
  name="Rhythm Place",
  description="A place to dance",
  genre="Various",
  url="https://rhythm.place",
  encoding="UTF-8",
  radio
)

#silence = blank()
#radio = fallback(track_sensitive=false, [meta, silence])
# # Você pode usar um fallback com música local:
# # backup = playlist("/srv/radio/backup-playlist.m3u")
# # radio = fallback(track_sensitive=false, [spotify, backup])
# radio = fallback(track_sensitive=false, [spotify, silence])

# output.icecast(
#   %mp3(bitrate=192),
#   host="127.0.0.1",
#   port=9000,
#   password="hackme",
#   mount="/main.mp3",
#   name="Rhythm Place",
#   description="A place to dance",
#   genre="Various",
#   url="https://rhythm.place",
#   encoding="UTF-8",
#   icy_metadata=true,
#   radio
# )