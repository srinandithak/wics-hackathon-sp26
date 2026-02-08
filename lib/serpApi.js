/**
 * Serp API – Google Events search.
 * Set EXPO_PUBLIC_SERP_API_KEY in .env (get key from https://serpapi.com).
 * For production, consider proxying this through a backend so the key isn't in the client.
 */

const SERP_API_KEY = process.env.EXPO_PUBLIC_SERP_API_KEY;
const BASE = 'https://serpapi.com/search';

export async function searchGoogleEvents(query, options = {}) {
  if (!SERP_API_KEY) {
    throw new Error('Missing EXPO_PUBLIC_SERP_API_KEY in .env');
  }
  const params = new URLSearchParams({
    engine: 'google_events',
    q: query.trim() || 'events',
    api_key: SERP_API_KEY,
    gl: options.gl || 'us',
    hl: options.hl || 'en',
  });
  if (options.location) params.set('location', options.location);
  const url = `${BASE}?${params.toString()}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.error) throw new Error(data.error || 'Serp API error');
  const list = data.events_results || [];
  return (options.limit != null ? list.slice(0, options.limit) : list);
}

const MONTH_ABBR = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

/**
 * Best-effort parse Serp event date to ISO string for our DB.
 * Serp gives start_date "Dec 7" and when "Sun, Dec 7, 8:00 – 9:30 PM CST".
 */
export function serpEventToDateTime(serpEvent) {
  const dateObj = serpEvent.date || {};
  const startDate = dateObj.start_date || '';
  const when = dateObj.when || '';
  let year = new Date().getFullYear();
  let month = 0;
  let day = 1;
  let hour = 20;
  let minute = 0;

  const monthMatch = startDate.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*(\d{1,2})/i);
  if (monthMatch) {
    month = MONTH_ABBR[monthMatch[1].slice(0, 3)] ?? 0;
    day = parseInt(monthMatch[2], 10) || 1;
  }

  const timeMatch = when.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
  if (timeMatch) {
    hour = parseInt(timeMatch[1], 10);
    minute = parseInt(timeMatch[2], 10);
    if ((timeMatch[3] || '').toLowerCase() === 'pm' && hour < 12) hour += 12;
    if ((timeMatch[3] || '').toLowerCase() === 'am' && hour === 12) hour = 0;
  }

  const d = new Date(year, month, day, hour, minute);
  if (d.getTime() < Date.now()) d.setFullYear(year + 1);
  return d.toISOString();
}

/**
 * Map a Serp API event result to our events table shape.
 */
export function serpEventToOurEvent(serpEvent, createdByUserId) {
  const address = Array.isArray(serpEvent.address) ? serpEvent.address.join(', ') : '';
  const venueName = serpEvent.venue?.name || '';
  const location = [venueName, address].filter(Boolean).join(' – ') || 'TBD';
  return {
    title: serpEvent.title || 'Untitled event',
    description: serpEvent.description || null,
    location,
    venue_type: 'venue',
    date_time: serpEventToDateTime(serpEvent),
    created_by: createdByUserId,
    artist_ids: [],
  };
}
