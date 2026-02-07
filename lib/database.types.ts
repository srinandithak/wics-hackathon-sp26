/**
 * Database types for Supabase tables.
 * Use with createClient<Database>() for typed queries.
 */
export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export type UserType = 'listener' | 'artist';
export type AttendanceStatus = 'going' | 'interested';

export interface FavoriteSong {
  title: string;
  artist: string;
}

export interface Profile {
  id: string;
  name: string;
  user_type: UserType;
  favorite_artists: FavoriteSong[] | null;
  instagram_handle: string | null;
  bio: string | null;
  profile_image_url: string | null;
  similar_artists: string[] | null;
  genres: string[] | null;
  posts?: string[] | null;  // optional: DB default is []
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  date_time: string;
  location: string;
  venue_type: string | null;
  created_by: string;
  artist_ids: string[];
  image_url: string | null;
  created_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface EventAttendance {
  id: string;
  user_id: string;
  event_id: string;
  status: AttendanceStatus;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Omit<Profile, 'created_at'> & { created_at?: string }; Update: Partial<Profile> };
      events: { Row: Event; Insert: Omit<Event, 'id' | 'created_at'> & { id?: string; created_at?: string }; Update: Partial<Event> };
      follows: { Row: Follow; Insert: Omit<Follow, 'id' | 'created_at'> & { id?: string; created_at?: string }; Update: Partial<Follow> };
      event_attendance: { Row: EventAttendance; Insert: Omit<EventAttendance, 'id' | 'created_at'> & { id?: string; created_at?: string }; Update: Partial<EventAttendance> };
    };
  };
}
