-- Run this entire script in your Supabase project:
-- Dashboard > SQL Editor > New query > paste > Run

-- Players table
create table players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  created_at timestamptz default now(),
  won boolean default false,
  last_guess_date date
);

-- Guesses table
create table guesses (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade,
  word text not null,
  result jsonb not null,
  guessed_at timestamptz default now()
);

-- Game config table (stores the baby name and game state)
create table game_config (
  id int primary key default 1,
  baby_name text not null default '',
  is_revealed boolean default false,
  revealed_at timestamptz
);

-- Insert the one config row
insert into game_config (id) values (1)
on conflict (id) do nothing;

-- Allow public read/write for players and guesses (we secure via API routes)
alter table players enable row level security;
alter table guesses enable row level security;
alter table game_config enable row level security;

create policy "Allow all via service role" on players for all using (true);
create policy "Allow all via service role" on guesses for all using (true);
create policy "Allow all via service role" on game_config for all using (true);
