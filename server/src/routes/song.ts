import { Hono } from 'hono'
import { eq, sql } from 'drizzle-orm'
import { db } from '../db'
import { songs } from '../db/schema'

const app = new Hono()

app.get('/:genre?', async (c) => {
  const { genre } = c.req.param()

  if (genre) {
    const [song] = await db.select().from(songs).where(eq(songs.genre, genre)).orderBy(sql`RANDOM()`).limit(1)
    if (song) return c.json(song, 200)
  }

  const [noGenreSong] = await db.select().from(songs).orderBy(sql`RANDOM()`).limit(1)

  if (noGenreSong) return c.json({ song: noGenreSong }, 200)

  c.json({ song: null, message: 'Nenhuma música disponível' }, 404)
})

// app.post('/', (c) => c.json('create an author', 201))
// app.get('/:id', (c) => c.json(`get ${c.req.param('id')}`))

export { app as songRoutes }
