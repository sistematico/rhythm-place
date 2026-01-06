import { sql } from 'drizzle-orm'
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const songs = sqliteTable('songs', {
  id: int().primaryKey({ autoIncrement: true }),
  artist: text(),
  title: text(),
  path: text().notNull(),
  genre: text().notNull().default('various'),
  createdAt: text().notNull().default(sql`(current_timestamp)`)
})

export const views = sqliteTable('views', {
  id: int().primaryKey({ autoIncrement: true }),
  page: text().notNull().unique(),
  // 'count' tracks unique sessions (current/unique visitors)
  count: int().notNull().default(0),
  // 'total' tracks total visits (all hits, not only unique sessions)
  total: int().notNull().default(0)
})

export const sessions = sqliteTable('sessions', {
  id: int().primaryKey({ autoIncrement: true }),
  sessionId: text().notNull().unique(),
  createdAt: int({ mode: 'timestamp' }).notNull()
})
