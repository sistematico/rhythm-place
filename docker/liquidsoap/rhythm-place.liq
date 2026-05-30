#!/usr/bin/liquidsoap
# rhythm.place — main stream (Docker dev)
# Generated — do not edit manually.

settings.init.allow_root := true
set("log.stdout", true)
set("log.level", 3)

# Next.js app base URL (Docker service name)
app_url = "http://app:3030"

# ─── AutoDJ: busca próxima música via API ──────────────────────────────────────

def next_track() =
  result = process.read.lines("curl -sf #{app_url}/api/songs/next")
  path = list.hd(default="", result)
  if path == "" then
    log("[autodj] API não retornou path — aguardando")
    null()
  else
    log("[autodj] Próxima: #{path}")
    req = request.create(path)
    if req == null() then
      log("[autodj] Falha ao criar request para #{path}")
    end
    req
  end
end

autodj = request.dynamic(
  id = "autodj",
  retry_delay = 5.0,
  timeout = 60.0,
  next_track
)

# ─── Notificar API quando faixa começa a tocar ────────────────────────────────

def on_track(m) =
  path = m["filename"]
  if path != "" then
    body = '{"path":"#{path}"}'
    ignore(process.run(
      "curl -sf -X POST -H 'content-type: application/json' -d '#{body}' #{app_url}/api/songs/played"
    ))
  end
end

autodj.on_track(on_track)

# ─── Fila para injeção manual ─────────────────────────────────────────────────

queue = request.queue(id = "manual_queue")

# ─── Handlers HTTP harbor ─────────────────────────────────────────────────────

def skip_handler(_req, res) =
  log("[harbor] skip recebido")
  autodj.skip()
  ignore(res.status_code(200))
  ignore(res.content_type("text/plain"))
  ignore(res.html("OK"))
end

def play_handler(req, res) =
  body = req.data()
  path  = list.hd(default="", process.read.lines("echo '#{body}' | jq -r '.path'"))
  title = list.hd(default="", process.read.lines("echo '#{body}' | jq -r '.title'"))
  artist = list.hd(default="", process.read.lines("echo '#{body}' | jq -r '.artist'"))
  if path == "" or path == "null" then
    log("[harbor/play] path inválido")
    ignore(res.status_code(400))
    ignore(res.content_type("text/plain"))
    ignore(res.html("path invalido"))
  else
    uri = "annotate:title=\"#{title}\",artist=\"#{artist}\":#{path}"
    r = request.create(uri)
    if r == null() then
      ignore(res.status_code(500))
      ignore(res.content_type("text/plain"))
      ignore(res.html("falha ao criar request"))
    else
      queue.push(r)
      autodj.skip()
      ignore(res.status_code(200))
      ignore(res.content_type("text/plain"))
      ignore(res.html("OK"))
    end
  end
end

harbor.http.register(port = 8080, method = "POST", "/skip", skip_handler)
harbor.http.register(port = 8080, method = "POST", "/play", play_handler)

# ─── Fonte final: fila > autodj > silêncio ────────────────────────────────────

source = fallback(track_sensitive = false, [queue, autodj, blank()])

# ─── Output ────────────────────────────────────────────────────────────────────

output.icecast(
  %mp3(bitrate = 128, samplerate = 44100, stereo = true, id3v2 = true),
  host = "icecast",
  port = 8000,
  password = getenv("ICECAST_SOURCE_PASSWORD"),
  mount = "/main",
  name = "rhythm-place",
  description = "rhythm.place radio stream",
  url = "http://localhost",
  encoding = "UTF-8",
  mksafe(source)
)
