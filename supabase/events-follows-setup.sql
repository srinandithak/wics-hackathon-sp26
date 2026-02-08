-- ============================================================
-- Events, Event Attendance, Follows – tables + RLS
-- Run this in Supabase SQL Editor after profiles-setup.sql
-- ============================================================

-- ---------------------------------------------------------------------------
-- 1. EVENTS
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  date_time timestamptz not null,
  location text not null,
  venue_type text,
  created_by uuid not null references auth.users(id) on delete cascade,
  artist_ids uuid[] default '{}',
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

drop policy if exists "Events are viewable by everyone" on public.events;
create policy "Events are viewable by everyone"
  on public.events for select
  using (true);

drop policy if exists "Authenticated users can create events" on public.events;
create policy "Authenticated users can create events"
  on public.events for insert
  with check (auth.uid() = created_by);

drop policy if exists "Creator can update own event" on public.events;
create policy "Creator can update own event"
  on public.events for update
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

drop policy if exists "Creator can delete own event" on public.events;
create policy "Creator can delete own event"
  on public.events for delete
  using (auth.uid() = created_by);


-- ---------------------------------------------------------------------------
-- 2. EVENT_ATTENDANCE (going / interested)
-- ---------------------------------------------------------------------------
create table if not exists public.event_attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  status text not null check (status in ('going', 'interested')),
  created_at timestamptz not null default now(),
  unique(user_id, event_id)
);

alter table public.event_attendance enable row level security;

drop policy if exists "Anyone can view event attendance" on public.event_attendance;
create policy "Anyone can view event attendance"
  on public.event_attendance for select
  using (true);

drop policy if exists "Users can insert own attendance" on public.event_attendance;
create policy "Users can insert own attendance"
  on public.event_attendance for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own attendance" on public.event_attendance;
create policy "Users can update own attendance"
  on public.event_attendance for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own attendance" on public.event_attendance;
create policy "Users can delete own attendance"
  on public.event_attendance for delete
  using (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- 3. FOLLOWS (friends)
-- ---------------------------------------------------------------------------
create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(follower_id, following_id),
  check (follower_id != following_id)
);

alter table public.follows enable row level security;

drop policy if exists "Anyone can view follows" on public.follows;
create policy "Anyone can view follows"
  on public.follows for select
  using (true);

drop policy if exists "Users can follow others" on public.follows;
create policy "Users can follow others"
  on public.follows for insert
  with check (auth.uid() = follower_id);

drop policy if exists "Users can unfollow (delete own follow)" on public.follows;
create policy "Users can unfollow (delete own follow)"
  on public.follows for delete
  using (auth.uid() = follower_id);


-- ---------------------------------------------------------------------------
-- 4. (Optional) Seed a few events so the app has data to show
--    Remove or change the inserts if you already have events.
-- ---------------------------------------------------------------------------
-- Uncomment and set YOUR_USER_ID to a real auth.users id to create sample events:
/*
insert into public.events (title, description, date_time, location, venue_type, created_by, artist_ids)
values
  ('House Show - West Campus', null, '2026-02-15 20:00:00+00', '2400 Nueces St', 'house party', 'YOUR_USER_ID', '{}'),
  ('Open Mic Night', null, '2026-02-21 19:00:00+00', 'Cactus Cafe', 'venue', 'YOUR_USER_ID', '{}'),
  ('Indie Night at the Union', null, '2026-02-22 21:00:00+00', 'Texas Union', 'venue', 'YOUR_USER_ID', '{}');
*/
