-- Run this in Supabase SQL Editor.
-- 1) Favorite artists = array of strings (for Discover matching only).
-- 2) My Songs = stored in posts (each element "Title|||Artist").

-- Add column for favorite artist names (strings only)
alter table public.profiles
  add column if not exists favorite_artist_names text[] default '{}';

comment on column public.profiles.favorite_artist_names is 'Favorite artist names (strings) for Discover Artists matching only';
comment on column public.profiles.posts is 'My Songs: each element is "Title|||Artist"';

-- Optional: migrate existing favorite_artists (jsonb) into favorite_artist_names (text[])
-- Uncomment and run once if you have existing data to keep:
/*
update public.profiles
set favorite_artist_names = (
  select array_agg(distinct (elem->>'artist'))
  from jsonb_array_elements(coalesce(favorite_artists, '[]'::jsonb)) elem
)
where favorite_artists is not null and jsonb_array_length(favorite_artists) > 0;
*/

-- Drop the old create_profile (with p_favorite_artists jsonb) so the name is unique
drop function if exists public.create_profile(uuid, text, text, text, text[], jsonb, text, text, text[]);

-- Create create_profile with favorite_artist_names (text[]) and posts
create or replace function public.create_profile(
  p_id uuid,
  p_name text,
  p_user_type text,
  p_instagram_handle text default null,
  p_genres text[] default '{}',
  p_favorite_artist_names text[] default '{}',
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
    id, name, user_type, instagram_handle, genres, favorite_artist_names,
    bio, profile_image_url, similar_artists, posts
  )
  values (
    p_id, coalesce(nullif(trim(p_name), ''), 'User'),
    p_user_type, nullif(trim(p_instagram_handle), ''),
    coalesce(p_genres, '{}'), coalesce(p_favorite_artist_names, '{}'),
    p_bio, p_profile_image_url, coalesce(p_similar_artists, '{}'),
    '{}'
  )
  on conflict (id) do update set
    name = excluded.name,
    user_type = excluded.user_type,
    instagram_handle = excluded.instagram_handle,
    genres = excluded.genres,
    favorite_artist_names = excluded.favorite_artist_names,
    bio = excluded.bio,
    profile_image_url = excluded.profile_image_url,
    similar_artists = excluded.similar_artists;
end;
$$;

grant execute on function public.create_profile to authenticated;
grant execute on function public.create_profile to anon;