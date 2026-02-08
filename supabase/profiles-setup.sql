-- ============================================================
-- Profiles table + RLS for Supabase (run in SQL Editor)
-- ============================================================
--
-- If onboarding fails with RLS or "Not authenticated":
-- In Supabase Dashboard → Authentication → Providers → Email
-- turn OFF "Confirm email" so signUp() returns a session immediately.
--

-- 1. Create profiles table (skip if you already have it and just run the RLS section below)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'User',
  user_type text not null check (user_type in ('listener', 'artist')) default 'listener',
  instagram_handle text,
  bio text,
  profile_image_url text,
  similar_artists text[],
  genres text[],
  favorite_artists jsonb,  -- array of { "title": string, "artist": string }
  posts text[] default '{}',
  created_at timestamptz not null default now()
);

-- (No trigger: the app creates the profile row in onboarding after signUp.)

-- 2. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 3. Drop existing policies if re-running (avoid duplicates)
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Profiles are viewable by everyone" on public.profiles;

-- 4. RLS policies

-- Users can read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can insert a row only when id = their auth id (for onboarding sign-up)
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Users can update only their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Optional: allow anyone to read profiles (e.g. for Discover Artists list)
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

-- "Profiles are viewable by everyone" is needed so the Discover Artists screen can list all profiles.

-- 5. RPC so app can create profile right after signUp (avoids RLS timing/session issues)
create or replace function public.create_profile(
  p_id uuid,
  p_name text,
  p_user_type text,
  p_instagram_handle text default null,
  p_genres text[] default '{}',
  p_favorite_artists jsonb default null,
  p_bio text default null,
  p_profile_image_url text default null,
  p_similar_artists text[] default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if auth.uid() != p_id then
    raise exception 'Can only create profile for yourself';
  end if;
  insert into public.profiles (
    id, name, user_type, instagram_handle, genres, favorite_artists,
    bio, profile_image_url, similar_artists
  )
  values (
    p_id, coalesce(nullif(trim(p_name), ''), 'User'),
    p_user_type, nullif(trim(p_instagram_handle), ''),
    coalesce(p_genres, '{}'), p_favorite_artists,
    p_bio, p_profile_image_url, coalesce(p_similar_artists, '{}')
  )
  on conflict (id) do update set
    name = excluded.name,
    user_type = excluded.user_type,
    instagram_handle = excluded.instagram_handle,
    genres = excluded.genres,
    favorite_artists = excluded.favorite_artists,
    bio = excluded.bio,
    profile_image_url = excluded.profile_image_url,
    similar_artists = excluded.similar_artists;
end;
$$;

grant execute on function public.create_profile to authenticated;
grant execute on function public.create_profile to anon;
