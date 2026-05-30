import { db } from "@/db";
import { songsTable } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

/**
 * POST /api/songs/played
 *
 * Called by liquidsoap when a track finishes playing.
 * Increments the play count and updates playedAt.
 *
 * Body (JSON): { "path": "/absolute/path/to/song.flac" }
 *
 * Liquidsoap usage:
 *   def on_track(m) =
 *     let path = m["filename"]
 *     ignore(http.post(
 *       "http://localhost:3030/api/songs/played",
 *       headers=[("content-type", "application/json")],
 *       data='{"path":"#{path}"}'
 *     ))
 *   end
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    typeof (body as Record<string, unknown>).path !== "string"
  ) {
    return Response.json(
      { error: "Missing required field: path" },
      { status: 400 },
    );
  }

  const path = (body as { path: string }).path;

  const [updated] = await db
    .update(songsTable)
    .set({
      played: sql`${songsTable.played} + 1`,
      playedAt: new Date(),
    })
    .where(eq(songsTable.path, path))
    .returning({ id: songsTable.id, played: songsTable.played });

  if (!updated) {
    return Response.json({ error: "Song not found" }, { status: 404 });
  }

  return Response.json({ ok: true, played: updated.played });
}
