-- ── Blocks (10 жизненно важных блоков цивилизации) ────────────────
create table if not exists blocks (
  id           uuid default gen_random_uuid() primary key,
  slug         text unique not null,
  name         text not null,
  description  text,
  icon         text,
  icon_hover   text,
  color        text default '#00d4ff',
  angle        int  default 0,
  distance     int  default 280,
  order_index  int  default 0,
  created_at   timestamptz default now()
);

-- ── Functions (функции внутри блока) ──────────────────────────────
create table if not exists functions (
  id           uuid default gen_random_uuid() primary key,
  block_id     uuid references blocks(id) on delete cascade not null,
  name         text not null,
  description  text,
  order_index  int  default 0,
  created_at   timestamptz default now()
);

-- ── Professions (профессии внутри функции) ────────────────────────
create table if not exists professions (
  id           uuid default gen_random_uuid() primary key,
  function_id  uuid references functions(id) on delete cascade not null,
  name         text not null,
  description  text,
  order_index  int  default 0,
  created_at   timestamptz default now()
);

-- ── Votes (голоса за профессию) ───────────────────────────────────
create table if not exists votes (
  id             uuid default gen_random_uuid() primary key,
  profession_id  uuid references professions(id) on delete cascade not null,
  user_id        uuid references auth.users(id) on delete cascade not null,
  vote_type      text check (vote_type in ('needed', 'redundant', 'improvable')) not null,
  created_at     timestamptz default now(),
  unique(profession_id, user_id)  -- один голос на профессию
);

-- ── Comments (обсуждения профессии) ───────────────────────────────
create table if not exists comments (
  id             uuid default gen_random_uuid() primary key,
  profession_id  uuid references professions(id) on delete cascade not null,
  user_id        uuid references auth.users(id) on delete cascade not null,
  content        text not null,
  created_at     timestamptz default now()
);

-- ── RLS (Row Level Security) ───────────────────────────────────────

alter table blocks      enable row level security;
alter table functions   enable row level security;
alter table professions enable row level security;
alter table votes       enable row level security;
alter table comments    enable row level security;

-- Контент читают все
create policy "public read blocks"      on blocks      for select using (true);
create policy "public read functions"   on functions   for select using (true);
create policy "public read professions" on professions for select using (true);
create policy "public read votes"       on votes       for select using (true);
create policy "public read comments"    on comments    for select using (true);

-- Голосовать могут только авторизованные (один голос)
create policy "auth vote insert" on votes
  for insert with check (auth.uid() = user_id);

create policy "auth vote update" on votes
  for update using (auth.uid() = user_id);

create policy "auth vote delete" on votes
  for delete using (auth.uid() = user_id);

-- Комментировать могут только авторизованные
create policy "auth comment insert" on comments
  for insert with check (auth.uid() = user_id);

create policy "auth comment delete" on comments
  for delete using (auth.uid() = user_id);
