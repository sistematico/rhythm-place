import { db } from "@/db";
import { songsTable } from "@/db/schema";
import { ilike, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return Response.json([]);
  }

  const pattern = `%${q}%`;

  const songs = await db
    .select({
      id: songsTable.id,
      title: songsTable.title,
      artist: songsTable.artist,
      album: songsTable.album,
    })
    .from(songsTable)
    .where(
      or(
        ilike(songsTable.title, pattern),
        ilike(songsTable.artist, pattern),
        ilike(songsTable.album, pattern),
      ),
    )
    .limit(20);

  return Response.json(songs);
}
