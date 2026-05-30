import "dotenv/config";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { songsTable } from "./schema";
import { db } from "./index";

const AUDIO_EXTENSIONS = new Set([".mp3", ".flac", ".ogg", ".wav", ".aac", ".m4a", ".opus"]);

function parseTitleFromPath(filePath: string): string {
  const name = filePath.slice(filePath.lastIndexOf("/") + 1);
  return name.slice(0, name.lastIndexOf(".")).replace(/[-_]/g, " ");
}

async function main() {
  const songsPath = process.env.SONGS_PATH;
  if (!songsPath) throw new Error("SONGS_PATH environment variable is not set.");

  console.log(`Scanning ${songsPath}...`);
  const entries = await readdir(songsPath, { recursive: true });

  const files = entries
    .filter((entry) => {
      const ext = entry.slice(entry.lastIndexOf(".")).toLowerCase();
      return AUDIO_EXTENSIONS.has(ext);
    })
    .map((entry) => join(songsPath, entry));

  console.log(`Found ${files.length} audio file(s).`);
  if (files.length === 0) return;

  const rows = files.map((path) => ({
    path,
    title: parseTitleFromPath(path),
  } satisfies typeof songsTable.$inferInsert));

  const inserted = await db
    .insert(songsTable)
    .values(rows)
    .onConflictDoNothing()
    .returning({ id: songsTable.id });

  console.log(`Done. Inserted ${inserted.length} new song(s), skipped ${files.length - inserted.length} duplicate(s).`);
}

main();
