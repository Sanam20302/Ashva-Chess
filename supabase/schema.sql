-- Run this in the Supabase SQL editor for your project.
-- This app is designed for a small, trusted group (e.g. your office),
-- so it uses permissive "allow all" policies rather than user accounts.
-- Don't reuse this schema for anything with public/untrusted traffic
-- without adding real auth + tighter RLS policies.

create table if not exists games (
  code text primary key,
  pgn text not null default '',
  fen text not null default 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  turn text not null default 'w',
  host_color text not null default 'w',
  host_name text,
  guest_name text,
  status text not null default 'waiting', -- 'waiting' | 'active' | 'finished'
  winner text, -- 'w' | 'b' | null (draw or in progress)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists game_messages (
  id bigint generated always as identity primary key,
  game_code text not null references games(code) on delete cascade,
  sender text not null,
  color text not null, -- 'w' | 'b'
  body text not null,
  created_at timestamptz not null default now()
);

alter table games enable row level security;
alter table game_messages enable row level security;

create policy "allow all on games" on games
  for all using (true) with check (true);

create policy "allow all on game_messages" on game_messages
  for all using (true) with check (true);

-- Enable Realtime for both tables so opponents see moves and chat live.
alter publication supabase_realtime add table games;
alter publication supabase_realtime add table game_messages;

-- Optional housekeeping: clear out old abandoned rooms after a few days.
-- Safe to run manually or on a schedule (e.g. a Supabase cron job).
-- delete from games where updated_at < now() - interval '3 days';
