/**
 * My Songs are stored in profiles.posts as text[].
 * Each element is "Title|||Artist" (delimiter chosen to avoid conflict with titles containing |).
 */

export const MY_SONGS_DELIMITER = '|||';

export function postsToSongs(posts) {
  if (!Array.isArray(posts)) return [];
  return posts
    .map((entry) => {
      if (typeof entry !== 'string') return null;
      const i = entry.indexOf(MY_SONGS_DELIMITER);
      if (i === -1) return { title: entry.trim(), artist: '' };
      return {
        title: entry.slice(0, i).trim(),
        artist: entry.slice(i + MY_SONGS_DELIMITER.length).trim(),
      };
    })
    .filter((s) => s && (s.title || s.artist));
}

export function songsToPosts(songs) {
  if (!Array.isArray(songs)) return [];
  return songs.map((s) => `${(s.title || '').trim()}${MY_SONGS_DELIMITER}${(s.artist || '').trim()}`);
}
