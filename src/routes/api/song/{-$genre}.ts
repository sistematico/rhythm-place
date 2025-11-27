import { createFileRoute } from '@tanstack/react-router';
import { eq, sql } from 'drizzle-orm';
import { db } from '../../../db';
import { songs } from '../../../db/schema';

type Song = typeof songs.$inferSelect;

export const Route = createFileRoute('/api/song/{-$genre}')({
  
  server: {
    handlers: {
      GET: async (ctx) => {
        const { genre } = ctx.params

        let song: Song | null = null;

        if (genre) {
          [song] = await db.select().from(songs).where(eq(songs.genre, genre)).orderBy(sql`RANDOM()`).limit(1)
          if (!song) {
            [song] = await db.select().from(songs).orderBy(sql`RANDOM()`).limit(1)
          }
        } else {
          [song] = await db.select().from(songs).orderBy(sql`RANDOM()`).limit(1)
        }
          
        if (!song) return new Response(JSON.stringify({ song: null, message: 'Música não encontrada' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
        return new Response(JSON.stringify(song), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }
    }
  }
})