export const MONTH_ORDER = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/**
 * Convert Supabase event row (date_time timestamptz) to UI shape used by Events and Calendar.
 * @param {object} row - { id, title, location, venue_type, date_time, ... }
 * @param {string[]} friendsGoingNames - optional array of display names
 */
export function eventRowToUI(row, friendsGoingNames = []) {
  const d = new Date(row.date_time);
  const day = d.getDate();
  const month = MONTH_ORDER[d.getMonth()];
  const hours = d.getHours();
  const mins = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  const time = `${h}:${mins.toString().padStart(2, '0')} ${ampm}`;
  return {
    id: row.id,
    title: row.title,
    day,
    month,
    time,
    location: row.location,
    venueType: row.venue_type || 'event',
    friendsGoing: friendsGoingNames,
  };
}
