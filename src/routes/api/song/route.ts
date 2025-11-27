import { createFileRoute } from '@tanstack/react-router';
import { sql } from 'drizzle-orm';
import { db } from '../../../db';
import { songs } from '../../../db/schema';

export const Route = createFileRoute('/api/song')({
  server: {
    handlers: {
      GET: async () => {
        const  [song] = await db.select().from(songs).orderBy(sql`RANDOM()`).limit(1)
        if (!song) return new Response(JSON.stringify({ song: null, message: 'Música não encontrada' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
        return new Response(JSON.stringify(song), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }
    }
  }
})