import { createFileRoute } from '@tanstack/react-router';
import { eq, sql } from 'drizzle-orm';
import { db } from '../../../db';
import { songs } from '../../../db/schema';

export const Route = createFileRoute('/api/song/$genre')({
  server: {
    handlers: {
      GET: async (ctx) => {
        try {
          const { genre } = ctx.params
          const [song] = await db.select().from(songs).where(eq(songs.genre, genre)).orderBy(sql`RANDOM()`).limit(1)
          if (!song) {
            const [noGenreSong] = await db.select().from(songs).orderBy(sql`RANDOM()`).limit(1)
            if (noGenreSong) return new Response(JSON.stringify({ song: noGenreSong, message: 'Música não encontrada' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
          }
          return new Response(JSON.stringify(song), { status: 200, headers: { 'Content-Type': 'application/json' } })
        } catch (error) {
          console.error('Erro ao buscar música por gênero:', error)
          return new Response(JSON.stringify({ error: 'Erro ao buscar música' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
        }
      }
    }
  }
})