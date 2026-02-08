import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

const defaultFontSizes = {
  title: 28,
  large: 22,
  base: 15,
  button: 16,
  subtitle: 18,
};

export function AppProvider({ children }) {
  const { profile, signOut: authSignOut, refreshProfile } = useAuth();
  const [currentFontSizes] = useState(defaultFontSizes);

  const user = profile
    ? {
        id: profile.id,
        username: profile.name ?? 'Your Name',
        instagramId: profile.instagram_handle ?? '',
      }
    : { id: null, username: 'Your Name', instagramId: '' };

  const updateUser = async (updates) => {
    if (!user.id) return;
    const { error } = await supabase
      .from('profiles')
      .update({
        ...(updates.username != null && { name: updates.username }),
        ...(updates.instagramId != null && { instagram_handle: updates.instagramId }),
      })
      .eq('id', user.id);
    if (!error) await refreshProfile();
  };

  const logout = async () => {
    await authSignOut();
  };

  const value = {
    user,
    updateUser,
    logout,
    currentFontSizes,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
