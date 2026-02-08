import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

const SETTINGS_KEY = 'app_settings';

const defaultSettings = {
  fontSize: 'medium',
  notifications: {
    pushEnabled: true,
    emailEnabled: false,
    eventReminders: true,
    newFollowers: true,
  },
  privacy: {
    profilePublic: true,
    showEmail: false,
    allowMessages: true,
    showLocation: false,
  },
};

const fontSizes = {
  small: { base: 14, subtitle: 16, title: 24, large: 20, button: 14, caption: 11, hero: 36 },
  medium: { base: 16, subtitle: 18, title: 28, large: 22, button: 16, caption: 12, hero: 44 },
  large: { base: 18, subtitle: 20, title: 32, large: 24, button: 18, caption: 14, hero: 52 },
};

export function AppProvider({ children }) {
  const { profile, signOut: authSignOut, refreshProfile } = useAuth();
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SETTINGS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setSettings((prev) => ({ ...defaultSettings, ...parsed }));
        }
      } catch (_) {}
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)).catch(() => {});
  }, [settings]);

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

  const updateNotifications = (updates) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, ...updates },
    }));
  };

  const updatePrivacy = (updates) => {
    setSettings((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, ...updates },
    }));
  };

  const updateFontSize = (size) => {
    if (['small', 'medium', 'large'].includes(size)) {
      setSettings((prev) => ({ ...prev, fontSize: size }));
    }
  };

  const value = {
    user,
    updateUser,
    logout,
    settings,
    updateNotifications,
    updatePrivacy,
    updateFontSize,
    fontSizes,
    currentFontSizes: fontSizes[settings.fontSize],
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
