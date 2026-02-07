import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

const defaultFontSizes = {
  title: 28,
  large: 22,
  base: 15,
  button: 16,
  subtitle: 18,
};

export function AppProvider({ children }) {
  const [user, setUser] = useState({
    username: 'Your Name',
    instagramId: 'username',
  });
  const [currentFontSizes] = useState(defaultFontSizes);

  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const logout = () => {
    setUser({ username: 'Your Name', instagramId: 'username' });
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
