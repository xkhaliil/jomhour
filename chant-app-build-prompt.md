# Build Prompt: Real-Time Stadium Chant App

> Paste this whole prompt into a coding agent (Claude Code, Cursor, etc.) as the
> starting instruction for a new repository. It's written to be self-contained.

---

## 1. Role and Objective

You are a senior full-stack engineer building a production-quality web application
from scratch. Work incrementally, explain key decisions as you make them, and ask
me before making irreversible infrastructure choices (e.g. picking an auth
provider) if I haven't specified one below.

## 2. Project Summary

Build **a real-time stadium fan-chant app**. An admin running a live match selects
a "chant" from a pre-written library and triggers it to go live. Every fan who has
joined that match's session (via a shared link/QR code, no app install) sees the
chant lyrics appear on their phone with a karaoke-style progressive highlight,
timed so that thousands of people in a stadium read and shout the same words at
the same moment, purely from each phone's own screen — there is no audio
broadcast between phones.

The product has three user-facing surfaces:

1. **Public match page** — countdown to kickoff, match info, a "join" link/QR
   code, and a "invite your section" share action.
2. **Fan live view** — full-screen, distraction-free display that shows either an
   idle/waiting state, the currently-live chant with a synchronized highlight
   animation and countdown ring, and a small "up next" preview. Includes a
   language toggle (Arabic / English) and light/dark mode.
3. **Admin dashboard** — authenticated. CRUD for chants belonging to a match, a
   "Go Live" action per chant, an AI-assisted chant-drafting tool, and the
   QR/share link for the session.

## 3. Tech Stack (fixed — do not substitute)

- **Framework**: Next.js (App Router, TypeScript)
- **ORM**: Prisma
- **Database**: Supabase Postgres
- **Real-time transport**: Supabase Realtime (Broadcast channels) — used
  specifically *because* Vercel serverless/edge functions cannot hold persistent
  WebSocket connections. Do not attempt to build a custom WebSocket server.
- **Hosting**: Vercel
- **Auth**: Supabase Auth, email/password, for the admin role only. Fans never
  authenticate.
- **Styling**: Tailwind CSS

## 4. The Core Hard Problem: Synchronization at Scale

This is the most important section. Get this right before anything else.

**Do not** push per-frame animation updates over the wire to clients. With
potentially tens of thousands of concurrent fans, this would be both wasteful and
prone to desync from network jitter.

**Instead**, use a "shared clock, local playback" model:

1. Each chant has a fixed script: text, a `durationSec`, and a pacing value
   (`lettersPerSec`).
2. When the admin triggers "Go Live," the server:
   - Writes `currentChantId` and `startedAt` (a timestamp ~2 seconds in the
     future, to allow propagation time) to the `LiveSession` row for that match.
   - Publishes a single Supabase Realtime broadcast event (`go_live`) on the
     channel for that match, containing the chant payload and `startedAt`.
3. Each fan's client, on receiving (or on initial page load fetching) this
   payload, runs its **own local timer** and computes which part of the text to
   highlight using `elapsed = serverNow - startedAt` and the pacing value. No
   further server messages are needed for the duration of the chant.
4. Because every client is independently counting down to the same absolute
   timestamp, inconsistent delivery latency across thousands of phones does not
   cause visible desync — only clock drift does, which is corrected by step 5.
5. Implement a clock-sync handshake: a simple `/api/time` route that returns
   `Date.now()` on the server. On load, the client calls this 3–5 times in quick
   succession, measures round-trip time for each, and computes
   `offset = serverTime - (clientSendTime + roundTripTime / 2)` — using the
   median offset across samples. Store this offset and apply it whenever
   computing "server now" from the local clock.
6. On reconnect (e.g. after a dropped stadium WiFi connection), the client must
   re-fetch current `LiveSession` state via a normal HTTP request rather than
   waiting for the next broadcast, so it can resume mid-chant correctly.

**Text segmentation gotcha**: chants are primarily Arabic. Do not use
`string.length` or naive character indexing to compute highlight position —
Arabic combining diacritics and ligatures don't map 1:1 to visual letters. Use
`Intl.Segmenter` with `granularity: "grapheme"` to split text into visually
correct units before applying the pacing calculation.

## 5. Data Model (Prisma)

```prisma
model Match {
  id        String       @id @default(cuid())
  slug      String       @unique
  teamA     String
  teamB     String
  kickoffAt DateTime
  venue     String?
  status    String       @default("scheduled") // scheduled | live | ended
  chants    Chant[]
  session   LiveSession?
  createdAt DateTime     @default(now())
}

model Chant {
  id            String  @id @default(cuid())
  matchId       String
  match         Match   @relation(fields: [matchId], references: [id])
  title         String
  textAr        String
  textTranslit  String?
  durationSec   Int     @default(60)
  lettersPerSec Float   @default(1)
  sortOrder     Int     @default(0)
}

model LiveSession {
  matchId        String    @id
  match          Match     @relation(fields: [matchId], references: [id])
  currentChantId String?
  startedAt      DateTime?
  nextChantId    String?
  status         String    @default("idle") // idle | live | ended
}
```

Extend this if needed (e.g. an `Admin` model if you don't rely solely on Supabase
Auth's own user table), but keep the shape above as the backbone.

## 6. Routes / Pages

- `/[matchSlug]` — public countdown + share page. Server-rendered, reads match
  data via Prisma. No realtime subscription needed here.
- `/[matchSlug]/live` — fan live view. Server-renders the current `LiveSession`
  state for instant correct display on load, then hydrates a client component
  that subscribes to `supabase.channel('match:{slug}')` for `go_live` events and
  runs the local highlight animation described in Section 4.
- `/admin` — login (Supabase Auth).
- `/admin/[matchSlug]` — chant list (CRUD), "Go Live" button per chant, "Add
  Chant" form with an AI-draft assist button, and the QR code / copy-link
  control for the fan join URL.

## 7. Server-Side Contracts

Implement these as Next.js Server Actions (preferred) or Route Handlers:

- `createChant(matchId, data)` / `updateChant(id, data)` / `deleteChant(id)` —
  standard CRUD via Prisma. Admin-only; verify the Supabase session server-side.
- `goLive(matchId, chantId)` — writes `LiveSession` and publishes the Realtime
  broadcast, as described in Section 4. Use the Supabase **service role** key
  for this server-side client — never expose it to the browser.
- `draftChantWithAI(prompt)` — calls an LLM to draft chant title + Arabic text
  (and optionally a transliteration) from a short admin-provided prompt (e.g.
  team name, theme, occasion). Return a structured suggestion the admin can edit
  before saving — never auto-save AI output directly as a published chant.
- `GET /api/time` — returns `{ now: Date.now() }`, used for clock sync. Keep this
  route trivial and fast; no DB call.

## 8. Environment / Infra Notes

- Use Supabase's **pooled** connection string (port 6543, Supavisor/PgBouncer)
  for the runtime `DATABASE_URL` used by Prisma in serverless functions. Use the
  direct connection string only for running `prisma migrate`.
- Public client code uses the Supabase **anon** key only, and only for
  subscribing to Realtime broadcast — never for writes.
- Before testing with more than a few hundred simultaneous fans, check the
  Supabase project's Realtime concurrent-connection limit for its plan and raise
  it via Supabase support if needed — this is a hard ceiling, not just a
  performance concern.

## 9. Non-Functional Requirements

- Full Arabic RTL support throughout the fan view and admin chant editor.
- The fan live view must be usable one-handed, in bright daylight (stadium
  sun), and must not require any login or app install — anyone with the link
  joins instantly.
- Graceful degradation: if a fan's connection drops, show a calm "reconnecting"
  state rather than a broken UI, and resume correctly once reconnected.
- Keep the realtime payload tiny (text + timing only) — never put images, audio,
  or video through the broadcast channel.

## 10. Suggested Build Order

1. Prisma schema + migrations against Supabase Postgres.
2. Admin CRUD for chants (no realtime yet) — get the data layer solid first.
3. Fan live view hardcoded to a single test chant, no Realtime — verify the
   local highlight animation and Arabic grapheme segmentation work correctly.
4. Add Supabase Realtime: wire up `goLive` + the client subscription. Test with
   two browser tabs side by side and confirm they animate in lockstep.
5. Add the clock-sync handshake and verify sync holds even when one tab's
   system clock is artificially offset.
6. Add reconnect/resume handling.
7. Add the AI chant-drafting assist, QR code generation, and share action.
8. Load-test the Realtime channel with a tool like `k6` or `artillery` before
   trusting it with a real crowd, and confirm the Supabase plan's connection
   limit covers expected attendance.

## 11. Acceptance Criteria

- Two devices opening the same fan live view link, with their system clocks
  intentionally offset by a few seconds, animate the chant highlight in visible
  sync once the clock-sync handshake has run.
- A fan who opens the live view mid-chant sees the correct current highlight
  position immediately, not the chant restarting from the beginning.
- A fan who briefly loses connection and reconnects resumes at the correct
  position without a page reload.
- Arabic text with diacritics highlights letter-by-letter without visually
  skipping or duplicating characters.
