-- ============================================================
-- Seed: events + event_attendance
-- Run in Supabase SQL Editor (run once).
-- ============================================================

-- 1. Events
insert into public.events (title, description, date_time, location, venue_type, created_by, artist_ids)
values
  ('House Show - West Campus', null, '2026-02-15 20:00:00+00', '2400 Nueces St', 'house party', '5182a2ee-ee2c-4cb4-9a90-36fd08016fbd', '{}'),
  ('Open Mic Night', null, '2026-02-21 19:00:00+00', 'Cactus Cafe', 'venue', '5182a2ee-ee2c-4cb4-9a90-36fd08016fbd', '{}'),
  ('Indie Night at the Union', null, '2026-02-22 21:00:00+00', 'Texas Union', 'venue', '5182a2ee-ee2c-4cb4-9a90-36fd08016fbd', '{}'),
  ('Pop-up at Co-op', null, '2026-02-28 18:00:00+00', 'University Co-op', 'pop-up', '5182a2ee-ee2c-4cb4-9a90-36fd08016fbd', '{}');

-- 2. You're "going" to the first 2 events (they show on Calendar)
insert into public.event_attendance (user_id, event_id, status)
select '5182a2ee-ee2c-4cb4-9a90-36fd08016fbd'::uuid, id, 'going'
from public.events
where created_by = '5182a2ee-ee2c-4cb4-9a90-36fd08016fbd'::uuid
order by date_time
limit 2
on conflict (user_id, event_id) do nothing;
