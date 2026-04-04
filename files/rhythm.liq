# Use youtube-dl/yt-dlp to grab audio
# Ensure yt-dlp is installed and in your PATH
yt = playlist(mode="normal", "youtube:https://www.youtube.com/watch?v=otCpCn0l4Wo&list=PLBA45B830027E7ADE")

# Fallback to a local file if YouTube fails
#radio = fallback([yt, single("local_fallback.mp3")])
radio = mksafe(yt)

# Output the stream
#output.icecast(%mp3, radio)

output.icecast(
  %mp3(bitrate=128, samplerate=44100, id3v2=true),
  name = "Rhythm Place",
  description = "A place to dance",
  genre = "Various",
  url = "https://rhythm.place",
  host = "localhost",
  port = 9000,
  password = "hackme",
  mount = "/main.mp3",
  encoding = "UTF-8",
  radio)