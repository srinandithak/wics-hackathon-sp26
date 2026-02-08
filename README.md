# UTX.FM

**UTX.FM** is a music discovery + live events app built for the **UT Austin indie music scene**. It helps students discover **UT student artists/bands** and the events they’re playing, without having to rely on scattered Instagram posts or word of mouth.

- **Demo video**: link coming
- **Slides**: link coming

## Why we built it

UT Austin has **so many talented student artists and bands**, but discovery is fragmented—mostly happening through **Instagram stories**, group chats, and word of mouth. There isn’t a dedicated, searchable place for UT students to find **artists, bands, and campus-area shows**.

UTX.FM is our attempt to be that place: a student-first platform where you can discover UT indie artists, see what’s coming up, and go with friends.

## What it does

- **UT-only access**: sign up with your `@my.utexas.edu` email (UT students only).
- **Listener onboarding**: save favorite artists (comma-separated) and get a discovery feed.
- **Artist onboarding**: create an artist profile (bio/genres/similar artists) so listeners can find you.
- **Discover artists**: a simple matching score ranks artists based on overlap with your favorite artists (see `screens/Artists.js`).
- **Find events**: browse events ranked by **friends attending** (see `screens/Events.js`).
- **Calendar**: view upcoming “Going” events in a calendar view (see `screens/Calendar.js`).
- **Friends**: follow other users and see their event activity (see `screens/Friends.js`).
- **Profile + accessibility**: font sizing + OpenDyslexic toggle for readability (see `screens/Profile.js`, `app/fonts/OpenDyslexic-Regular.otf`).
- **(Optional) Import events from Google**: artists can search Google Events via SerpAPI and add results (see `lib/serpApi.js`).

## Tech stack

- **Mobile**: Expo (SDK ~54) + React Native (`package.json`)
- **Navigation**: Expo Router entry (`app/_layout.tsx`) + React Navigation for app flows (`AppNavigator.js`)
- **Backend**: Supabase (Postgres + Auth) (`lib/supabase.ts`, `contexts/AuthContext.js`)
- **Accessibility**: OpenDyslexic via `expo-font` (`app.json`)
- **External API (optional)**: SerpAPI Google Events search (`lib/serpApi.js`)

## Project structure

```
app/                 Expo Router entry + app fonts
screens/             Main screens (Welcome/Login/Onboarding/Artists/Events/Calendar/Friends/Profile)
contexts/            App settings + auth + confirmed events state
lib/                 Supabase client, DB types, event utils, Serp API helper
components/          Shared UI (bottom nav, themed components)
assets/images/       Branding + UI assets (vinyl, spotify logo, icons)
```

## Run locally

### Prerequisites

- Node.js (Expo SDK 54 typically expects **Node 18+**)
- An Expo-compatible environment (Expo Go, iOS simulator, Android emulator, or a dev build)
- A Supabase project (URL + anon key)

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create a `.env` file in the project root:

```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional (enables “Add from Google” on Events)
EXPO_PUBLIC_SERP_API_KEY=your_serpapi_key
```

These are read in `lib/supabase.ts` and `lib/serpApi.js`.

### 3) Start the app

```bash
npx expo start
```

Other useful commands:

```bash
npm run android
npm run ios
npm run web
npm run start:tunnel
npm run lint
```

## Backend (Supabase) notes

UTX.FM uses **Supabase Auth** (email + password) + **Supabase Postgres**. The app talks to Supabase directly from the client (`lib/supabase.ts`).

### Required tables (shape)

The app expects these tables in the `public` schema (see `lib/database.types.ts`):

- `profiles`
- `events`
- `follows`
- `event_attendance`

<details>
<summary><strong>Optional: Supabase schema + RPC (for developers)</strong></summary>

If you’re setting this up from scratch, you can model columns based on `lib/database.types.ts` and the fields used in the screens (e.g. `events.date_time`, `event_attendance.status`, arrays like `profiles.favorite_artist_names`).

#### Minimal schema (copy/paste SQL)

This is a minimal schema that matches the shapes used by the app:

```sql
-- Enable UUID generation (Supabase usually has this available)
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key,
  name text not null,
  user_type text not null check (user_type in ('listener', 'artist')),
  favorite_artist_names text[] null,
  posts text[] null, -- each element is "Title|||Artist"
  instagram_handle text null,
  bio text null,
  profile_image_url text null,
  similar_artists text[] null,
  genres text[] null,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text null,
  date_time timestamptz not null,
  location text not null,
  venue_type text null,
  created_by uuid not null,
  artist_ids text[] not null default '{}',
  image_url text null,
  created_at timestamptz not null default now()
);

create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null,
  following_id uuid not null,
  created_at timestamptz not null default now(),
  unique (follower_id, following_id)
);

create table if not exists public.event_attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  event_id uuid not null references public.events(id) on delete cascade,
  status text not null check (status in ('going', 'interested')),
  created_at timestamptz not null default now(),
  unique (user_id, event_id)
);

create or replace function public.create_profile(
  p_id uuid,
  p_name text,
  p_user_type text,
  p_instagram_handle text,
  p_genres text[],
  p_favorite_artist_names text[],
  p_bio text,
  p_profile_image_url text,
  p_similar_artists text[]
) returns void
language plpgsql
as $$
begin
  insert into public.profiles (
    id, name, user_type, instagram_handle, genres, favorite_artist_names,
    bio, profile_image_url, similar_artists
  ) values (
    p_id, p_name, p_user_type, p_instagram_handle, p_genres, p_favorite_artist_names,
    p_bio, p_profile_image_url, p_similar_artists
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
```

#### RLS (Row Level Security)

- **Fastest for demos**: turn off RLS on these tables in the Supabase dashboard.
- **Production**: turn on RLS + add policies (e.g., users can update their own `profiles` row, create events as themselves, etc.).

#### Required RPC: `create_profile`

On signup, onboarding calls:

- `supabase.rpc('create_profile', { p_id, p_name, p_user_type, p_instagram_handle, p_genres, p_favorite_artist_names, p_bio, p_profile_image_url, p_similar_artists })`

So your Supabase project must define a `create_profile(...)` function that inserts into `profiles` (and handles conflicts if a row exists).

</details>

## Security + hackathon disclaimers

- **SerpAPI key**: `EXPO_PUBLIC_SERP_API_KEY` is used directly from the client (`lib/serpApi.js`). For production, you’d proxy this through a server to avoid shipping API keys to clients.
- **Email UX**: the UI suggests `@my.utexas.edu` emails (see `screens/Login.js`, `screens/Onboarding.js`), but enforcement depends on your Supabase auth rules.

## What’s next

- Real audio recognition (the mic flow is currently a demo stub in `screens/Artists.js`)
- Spotify OAuth + importing top artists (the Spotify button in onboarding is currently a placeholder)
- Better event ingestion (server-side scraping + deduping + moderation)
- Notifications (friend is going / artist posted / event reminders)

## Team
Shreya Goel, Nichelle Gilbert, Srinanditha Kamath, Shriyaa Balaji

Built with Expo + Supabase.
