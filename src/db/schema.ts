import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const songsTable = pgTable("songs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  path: text().notNull().unique(),
  title: varchar({ length: 255 }).notNull(),
  artist: varchar({ length: 255 }),
  album: varchar({ length: 255 }),
  genre: varchar({ length: 100 }),
  duration: integer(),
  played: integer().notNull().default(0),
  playedAt: timestamp({ withTimezone: true }),
  addedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
