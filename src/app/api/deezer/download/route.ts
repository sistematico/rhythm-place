import { spawn } from "node:child_process";
import { mkdir, readdir } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import NodeID3 from "node-id3";
import { db } from "@/db";
import { songsTable } from "@/db/schema";
import { downloadQueued } from "@/lib/deezer-queue";

export const dynamic = "force-dynamic";

const GODEEZ_BIN = "/usr/local/bin/godeez";
const DOWNLOAD_DIR =
  process.env.GODEEZ_DOWNLOAD_DIR ?? "/var/music/rtm/uploads";
const DEEZER_ARL = process.env.DEEZER_ARL;
const AUDIO_EXTS = new Set([".mp3", ".flac", ".m4a", ".ogg", ".wav", ".aac"]);
const PERCENT_RE = /(\d+(?:\.\d+)?)\s*%/;

const enc = new TextEncoder();

function sseChunk(event: string, data: unknown): Uint8Array {
  return enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

async function scanAudioFiles(dir: string): Promise<Set<string>> {
  const files = new Set<string>();
  async function scan(d: string) {
    try {
      for (const entry of await readdir(d, { withFileTypes: true })) {
        const full = join(d, entry.name);
        if (entry.isDirectory()) await scan(full);
        else if (AUDIO_EXTS.has(extname(entry.name).toLowerCase()))
          files.add(full);
      }
    } catch {
      // ignore unreadable subdirectories
    }
  }
  await scan(dir);
  return files;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawId = searchParams.get("trackId") ?? "";

  // Validate: only digit strings up to 15 chars (covers all current Deezer IDs)
  if (!/^\d{1,15}$/.test(rawId)) {
    return new Response("Invalid track ID", { status: 400 });
  }
  const trackId = parseInt(rawId, 10);
  if (!Number.isSafeInteger(trackId) || trackId <= 0) {
    return new Response("Invalid track ID", { status: 400 });
  }

  await mkdir(DOWNLOAD_DIR, { recursive: true });

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        try {
          controller.enqueue(sseChunk(event, data));
        } catch {
          // stream already closed
        }
      }

      send("queued", {});

      try {
        await downloadQueued(async () => {
          if (request.signal.aborted) return;

          if (!DEEZER_ARL) throw new Error("DEEZER_ARL não configurado no servidor.");

          const before = await scanAudioFiles(DOWNLOAD_DIR);

          await new Promise<void>((resolve, reject) => {
            const child = spawn(
              `DEEZER_ARL=${DEEZER_ARL} ${GODEEZ_BIN}`,
              ["download", "track", String(trackId)],
              {
                cwd: DOWNLOAD_DIR,
              },
            );

            const abort = () => child.kill("SIGTERM");
            request.signal.addEventListener("abort", abort, { once: true });

            let outputLog = "";

            function onData(chunk: Buffer) {
              const text = chunk.toString();
              outputLog += text;
              const match = text.match(PERCENT_RE);
              if (match) {
                send("progress", {
                  percent: Math.min(99, Math.round(parseFloat(match[1]))),
                });
              }
            }

            child.stdout.on("data", onData);
            child.stderr.on("data", onData);

            child.on("error", (err) => {
              request.signal.removeEventListener("abort", abort);
              console.error("[godeez] spawn error:", err);
              reject(err);
            });

            child.on("close", async (code) => {
              request.signal.removeEventListener("abort", abort);

              if (request.signal.aborted) {
                reject(new Error("Aborted"));
                return;
              }

              if (code !== 0) {
                console.error(
                  `[godeez] exited with code ${code}\n${outputLog}`,
                );
                reject(
                  new Error(
                    `godeez saiu com código ${code}: ${outputLog.slice(0, 300)}`,
                  ),
                );
                return;
              }

              try {
                const after = await scanAudioFiles(DOWNLOAD_DIR);
                const newFiles = [...after].filter((f) => !before.has(f));

                if (newFiles.length === 0) {
                  reject(new Error("No audio file found after download"));
                  return;
                }

                const filePath = newFiles[0];
                const tags = await NodeID3.Promise.read(filePath);
                const durationMs = tags.length
                  ? parseInt(tags.length, 10)
                  : null;

                await db
                  .insert(songsTable)
                  .values({
                    path: filePath,
                    title: tags.title ?? basename(filePath, extname(filePath)),
                    artist: tags.artist ?? null,
                    album: tags.album ?? null,
                    genre: tags.genre ?? null,
                    duration: durationMs ? Math.round(durationMs / 1000) : null,
                  })
                  .onConflictDoNothing();

                send("done", {});
                resolve();
              } catch (err) {
                reject(err);
              }
            });
          });
        });
      } catch (err) {
        if (!request.signal.aborted) {
          console.error("[godeez] download error:", err);
          const msg = err instanceof Error ? err.message : String(err);
          const isNotFound = msg.includes("ENOENT");
          send("error", {
            message: isNotFound ? "godeez não encontrado no servidor." : msg,
          });
        }
      } finally {
        try {
          controller.close();
        } catch {
          // already closed
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
