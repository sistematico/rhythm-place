// import { createFileRoute } from '@tanstack/react-router'

// export const Route = createFileRoute('/api/song/${-genre}')({
//   component: RouteComponent,
// })

// function RouteComponent() {
//   return <div>Hello "/api/song/toute"!</div>
// }



// routes/api/users.$id.ts
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
        let song: Song

        try {
          if (genre) {
            [song] = await db.select().from(songs).where(eq(songs.genre, genre)).orderBy(sql`RANDOM()`).limit(1)
          } else {
            [song] = await db.select().from(songs).orderBy(sql`RANDOM()`).limit(1)
          }

          if (!song) return new Response(JSON.stringify({ song: null, message: 'Música não encontrada' }), { status: 404, headers: { 'Content-Type': 'application/json' } })

          return new Response(JSON.stringify(song), { status: 200, headers: { 'Content-Type': 'application/json' } })
        } catch (error) {
          console.error('Erro ao buscar música:', error);
          return new Response(JSON.stringify({ error: 'Falha ao buscar música' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
        }
      }
    }
  }
})