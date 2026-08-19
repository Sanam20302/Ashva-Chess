# Endgame

A simple chess app you can self-host: play against a built-in computer
opponent, or host/join a live game with a friend using a short room code —
no accounts, no chess.com, works fine on a locked-down office network.

## What's inside

- **Vs Computer** — same local game as before: click a piece, click a
  highlighted square, choose difficulty (1–3 ply minimax with alpha-beta
  pruning), play either color.
- **Host a Game** — generates a 5-character room code, waits for someone to
  join, then plays live.
- **Join a Game** — type in a friend's code and drop straight into the game.
- Both multiplayer players see moves, captures, and the move list sync in
  real time, plus a small chat panel to talk trash.
- **Rematch** button once a game ends, without needing a new code.

Gameplay rules/engine are unchanged from the original single-file version —
this just adds a lobby and networking on top.

## Stack

- Next.js (App Router, JavaScript)
- [chess.js](https://github.com/jhlywa/chess.js) for rules/move validation
- [Supabase](https://supabase.com) (Postgres + Realtime) for game state and
  chat — free tier is plenty for a handful of friends

## 1. Set up Supabase

1. Create a free project at supabase.com.
2. Open the SQL editor and run everything in `supabase/schema.sql`. This
   creates the `games` and `game_messages` tables, sets permissive RLS
   policies (fine for a small private tool — see the note in that file), and
   turns on Realtime for both tables.
3. Go to Settings → API and copy the **Project URL** and **anon public**
   key.

## 2. Run locally

```bash
npm install
cp .env.local.example .env.local
# paste your Supabase URL + anon key into .env.local
npm run dev
```

Open http://localhost:3000. Vs-computer mode works even without Supabase
configured; Host/Join are disabled until the env vars are set.

## 3. Deploy to Vercel

1. Push this repo to GitHub (or GitLab/Bitbucket).
2. In Vercel, "Add New Project" → import the repo → framework preset
   Next.js is auto-detected.
3. Add the two environment variables from `.env.local.example` under
   Project Settings → Environment Variables (Production **and** Preview).
4. Deploy. Share the URL with your office — one person clicks **Host a
   Game**, sends the room code over Slack/Teams, the other clicks **Join a
   Game** and types it in.

## Notes

- Room codes are short-lived and unauthenticated by design — anyone with
  the code can join. That's the intended trade-off for a quick game with
  coworkers, not a public product. Don't put anything sensitive in the chat.
- Stale/abandoned rooms just sit in the `games` table; there's a commented-out
  cleanup query at the bottom of `supabase/schema.sql` if you want to prune
  them periodically.
- If your office network blocks Supabase's domain too, multiplayer won't
  connect — vs-computer mode has no external dependency once the page loads.
