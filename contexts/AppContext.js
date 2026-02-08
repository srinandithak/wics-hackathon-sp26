import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
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
  const [isDyslexicMode, setIsDyslexicMode] = useState(false);

  // Load saved dyslexic mode
  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem('dyslexicMode');
        if (saved !== null) setIsDyslexicMode(JSON.parse(saved));
      } catch (err) {
        console.error('Error loading dyslexic mode:', err);
      }
    };
    load();
  }, []);

  const toggleDyslexicMode = async () => {
    const next = !isDyslexicMode;
    setIsDyslexicMode(next);
    try {
      await AsyncStorage.setItem('dyslexicMode', JSON.stringify(next));
    } catch (err) {
      console.error('Error saving dyslexic mode:', err);
    }
  };

  const user = profile
    ? {
        id: profile.id,
        username: profile.name ?? 'Your Name',
        instagramId: profile.instagram_handle ?? 'username',
      }
    : { id: null, username: 'Your Name', instagramId: 'username' };

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
    isDyslexicMode,
    toggleDyslexicMode,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
