import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { eventRowToUI } from '../lib/eventUtils';

const ConfirmedEventsContext = createContext(null);

export function ConfirmedEventsProvider({ children }) {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [confirmedEvents, setConfirmedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadConfirmedEvents = useCallback(async () => {
    if (!userId) {
      setConfirmedEvents([]);
      setLoading(false);
      return;
    }
    try {
      const { data: attendance, error: attError } = await supabase
        .from('event_attendance')
        .select('event_id')
        .eq('user_id', userId)
        .eq('status', 'going');

      if (attError) {
        console.warn('ConfirmedEvents load:', attError.message);
        setConfirmedEvents([]);
        setLoading(false);
        return;
      }

      const eventIds = (attendance || []).map((a) => a.event_id).filter(Boolean);
      if (eventIds.length === 0) {
        setConfirmedEvents([]);
        setLoading(false);
        return;
      }

      const { data: events, error: evError } = await supabase
        .from('events')
        .select('*')
        .in('id', eventIds);

      if (evError) {
        console.warn('ConfirmedEvents events load:', evError.message);
        setConfirmedEvents([]);
        setLoading(false);
        return;
      }

      const list = (events || []).map((row) => eventRowToUI(row));
      setConfirmedEvents(list);
    } catch (e) {
      console.warn(e);
      setConfirmedEvents([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadConfirmedEvents();
  }, [loadConfirmedEvents]);

  const isConfirmed = (eventId) => confirmedEvents.some((e) => e.id === eventId);

  const toggleEvent = async (event) => {
    if (!userId) return;
    const going = confirmedEvents.some((e) => e.id === event.id);
    if (going) {
      await supabase
        .from('event_attendance')
        .delete()
        .eq('user_id', userId)
        .eq('event_id', event.id);
    } else {
      await supabase.from('event_attendance').insert({
        user_id: userId,
        event_id: event.id,
        status: 'going',
      });
    }
    await loadConfirmedEvents();
  };

  const value = {
    confirmedEvents,
    isConfirmed,
    toggleEvent,
    loading,
    refresh: loadConfirmedEvents,
  };

  return (
    <ConfirmedEventsContext.Provider value={value}>
      {children}
    </ConfirmedEventsContext.Provider>
  );
}

export function useConfirmedEvents() {
  const ctx = useContext(ConfirmedEventsContext);
  if (!ctx) throw new Error('useConfirmedEvents must be used inside ConfirmedEventsProvider');
  return ctx;
}
