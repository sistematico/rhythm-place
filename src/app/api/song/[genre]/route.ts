import { db } from "@/db/index";
import { songs } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ genre: string }> },
) {
  const { genre } = await params; // 'a', 'b', or 'c'

  let [song] = await db
    .select()
    .from(songs)
    .where(eq(songs.genre, genre.toLowerCase().trim()))
    .orderBy(sql`RANDOM()`)
    .limit(1);

  if (!song) {
    [song] = await db
      .select()
      .from(songs)
      .where(eq(songs.genre, "various"))
      .orderBy(sql`RANDOM()`)
      .limit(1);
    
    if (!song) return Response.json({ song: null, message: "No song found for the specified genre" }, { status: 404 });
  }

  return Response.json({ song, message: `Random song picked from genre ${genre}` }, { status: 200 });
}
