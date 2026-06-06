import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordHash: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const refreshTokensTable = pgTable("refresh_tokens", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  tokenHash: text().notNull().unique(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const songsTable = pgTable("songs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  path: text().notNull().unique(),
  title: varchar({ length: 255 }).notNull(),
  artist: varchar({ length: 255 }),
  album: varchar({ length: 255 }),
  genre: varchar({ length: 100 }),
  duration: integer(),
  deezerTrackId: integer().unique(),
  played: integer().notNull().default(0),
  playedAt: timestamp({ withTimezone: true }),
  addedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
