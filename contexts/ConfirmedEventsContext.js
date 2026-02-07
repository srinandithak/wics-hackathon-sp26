import React, { createContext, useContext, useState } from 'react';

const ConfirmedEventsContext = createContext(null);

export function ConfirmedEventsProvider({ children }) {
  const [confirmedEvents, setConfirmedEvents] = useState([]);

  const isConfirmed = (eventId) => confirmedEvents.some((e) => e.id === eventId);

  const toggleEvent = (event) => {
    setConfirmedEvents((prev) => {
      const exists = prev.some((e) => e.id === event.id);
      if (exists) return prev.filter((e) => e.id !== event.id);
      return [...prev, event];
    });
  };

  const value = {
    confirmedEvents,
    isConfirmed,
    toggleEvent,
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
