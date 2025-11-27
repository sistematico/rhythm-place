import { createFileRoute } from '@tanstack/react-router';
import { eq, sql } from 'drizzle-orm';
import { db } from '../../../db';
import { songs } from '../../../db/schema';

// type Song = typeof songs.$inferSelect;

export const Route = createFileRoute('/api/song/{-$genre}')({
  
  server: {
    handlers: {
      GET: async (ctx) => {
        const { genre } = ctx.params

        if (genre) {
          const [song] = await db.select().from(songs).where(eq(songs.genre, genre)).orderBy(sql`RANDOM()`).limit(1)
          if (!song) {
            console.log('song not found')            
            return new Response(JSON.stringify({ song: null, message: 'Música não encontrada' }))
          }
          return new Response(JSON.stringify(song), { status: 200, headers: { 'Content-Type': 'application/json' } })
        }
        
        const [song] = await db.select().from(songs).orderBy(sql`RANDOM()`).limit(1)
        if (!song) return new Response(JSON.stringify({ song: null, message: 'Música não encontrada' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
        return new Response(JSON.stringify(song), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }
    }
  }
})