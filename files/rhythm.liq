#!/usr/bin/env liquidsoap

live = input.harbor("aovivo", port=8098, user="dj", password="hackme")

def next_main()
  def request_function() =
    lines = process.read.lines("curl -s http://localhost:4060/api/song | jq -r '.song.path'")
    uri = list.hd(default="", lines)
    #log("Próxima música: #{uri}")
    request.create(uri)
  end
  request.dynamic(id="next_track", request_function)
end
autodj_main = next_main()

def next_dance()
  def request_function() =
    lines = process.read.lines("curl -s http://localhost:4060/api/song/dance | jq -r '.song.path'")
    uri = list.hd(default="", lines)
    request.create(uri)
  end
  request.dynamic(id="next_track", request_function)
end
autodj_dance = next_dance()

def next_rock()
  def request_function() =
    lines = process.read.lines("curl -s http://localhost:4060/api/song/rock | jq -r '.song.path'")
    uri = list.hd(default="", lines)
    request.create(uri)
  end
  request.dynamic(id="next_track", request_function)
end
autodj_rock = next_rock()

main = fallback(track_sensitive=false, [live, autodj_main])
dance = fallback(track_sensitive=false, [live, autodj_dance])
rock = fallback(track_sensitive=false, [live, autodj_rock])

#radio = crossfade(main)

output.icecast(
  %mp3(bitrate=128, samplerate=44100, id3v2=true), 
  name = "Rhythm Place",
  description = "Where Every Beat Finds You!",
  genre = "Various",
  url = "https://rhythm.place",
  host = "localhost", 
  port = 8090, 
  password = "hackme", 
  mount = "/main", 
  encoding = "UTF-8",
  mksafe(main))

output.icecast(
  %mp3(bitrate=128, samplerate=44100, id3v2=true), 
  name = "Rhythm Place",
  description = "Where Every Beat Finds You!",
  genre = "Dance",
  url = "https://rhythm.place",
  host = "localhost", 
  port = 8092, 
  password = "hackme", 
  mount = "/dance", 
  encoding = "UTF-8",
  mksafe(dance))

output.icecast(
  %mp3(bitrate=128, samplerate=44100, id3v2=true), 
  name = "Rhythm Place",
  description = "Where Every Beat Finds You!",
  genre = "Rock",
  url = "https://rhythm.place",
  host = "localhost", 
  port = 8094, 
  password = "hackme", 
  mount = "/rock", 
  encoding = "UTF-8",
  mksafe(rock))