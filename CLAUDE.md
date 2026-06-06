# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Tooling

Always use Bun in this repository.

- Use `bun install`, `bun add`, `bunx`, and `bun run <script>`.
- Do not use `pnpm`, `npm`, or `yarn` in instructions or commands.

## Commands

```bash
bun run dev          # Start dev server (Next.js)
bun run build        # Production build
bun run start        # Start production server on :3030
bun run lint         # Biome linter check
bun run format       # Biome formatter (writes in-place)
bun run check        # TypeScript type-check (no emit)

# Database (Drizzle Kit — requires DATABASE_URL in env)
bun run push         # Push schema to DB without migrations
bun run generate     # Generate migration files
bun run migrate      # Run pending migrations
bun run seed         # Seed the database (src/db/seed.ts)
```

## Architecture

**Rhythm Place** is a Next.js 16 / React 19 internet radio site backed by an Icecast2 audio stream fed by Liquidsoap.

### Key data flows

- **Stream proxy** — The browser never talks to Icecast directly. `src/app/radio/stream/route.ts` proxies the audio stream, and `src/app/api/stream-health/route.ts` reports stream availability. Both call helpers in `src/lib/radio.ts`.
- **Now-playing polling** — `src/app/api/now-playing/route.ts` fetches Icecast's `/status-json.xsl`, parses the active source, and returns a `NowPlaying` object. The client polls every 15 s via `RadioPlayerContext`.
- **Radio player state** — `src/contexts/radio-player.tsx` owns all playback state (play/pause, volume, mute, stream URL with cache-busting timestamp, now-playing metadata). The `<audio>` element lives in the provider so it never unmounts during navigation. Components consume state via `useRadioPlayer()`.
- **Song database** — PostgreSQL (via `src/db/index.ts` / Drizzle ORM). The single table `songsTable` (`src/db/schema.ts`) tracks tracks known to Liquidsoap, play counts, and timestamps. Routes under `src/app/api/songs/` handle search, next-up, and played-history queries.

### Environment variables

| Variable | Where used |
|---|---|
| `DATABASE_URL` | Drizzle ORM — required at runtime |
| `ICECAST_INTERNAL_BASE_URL` | `src/lib/radio.ts` — first candidate base URL when reaching Icecast (falls back to `http://icecast:8000`, `127.0.0.1:8000`, `localhost:8000`) |
| `NEXT_PUBLIC_STREAM_URL` | Public stream URL shown to users |
| `NEXT_PUBLIC_BUILD_VERSION` / `NEXT_PUBLIC_BUILD_DATE` | Injected at build time by `next.config.ts` from `git rev-parse --short HEAD` |

### Linter / formatter

Biome (v2) is the only linter and formatter — no ESLint or Prettier. Config: `biome.json`. Two non-default rules are disabled: `suspicious/noUnknownAtRules` (Tailwind v4 directives) and `style/noNonNullAssertion`.

### Infrastructure

The app runs behind Nginx on a single VPS. Audio streaming uses Icecast2 (internal only, proxied by Nginx) and Liquidsoap. Provisioning is done with Ansible (`ansible/`); deploy with `./scripts/deploy.sh`. A local Docker stack (`./scripts/docker-stack.sh`) mirrors the production setup.
