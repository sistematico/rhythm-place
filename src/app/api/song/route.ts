import { db } from "@/db/index";
import { songs } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  const [song] = await db
    .select()
    .from(songs)
    .where(eq(songs.genre, "various"))
    .orderBy(sql`RANDOM()`)
    .limit(1);
  
  if (!song) return Response.json({ song: null, message: "No song found" }, { status: 404 });
  
  return Response.json({ song, message: "Random song picked" }, { status: 200 });
}
