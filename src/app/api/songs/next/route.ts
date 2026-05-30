import { db } from "@/db";
import { songsTable } from "@/db/schema";
import { asc, isNull, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/songs/next
 *
 * Returns a plain-text absolute file path for liquidsoap to play next.
 * Selection strategy: unplayed songs first (playedAt IS NULL), then
 * least-recently-played. Among ties, a random offset avoids always
 * picking the same track.
 *
 * Liquidsoap usage:
 *   fun () -> begin
 *     let ret = http.get("http://localhost:3030/api/songs/next")
 *     request.create(ret.body)
 *   end
 */
export async function GET() {
  const [song] = await db
    .select({ path: songsTable.path })
    .from(songsTable)
    .orderBy(asc(isNull(songsTable.playedAt)), asc(songsTable.playedAt), sql`random()`)
    .limit(1);

  if (!song) {
    return new Response("", { status: 204 });
  }

  return new Response(song.path, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
