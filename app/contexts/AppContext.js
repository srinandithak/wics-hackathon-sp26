// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { createContext, useContext, useEffect, useState } from 'react';
// import * as Font from 'expo-font';

// const AppContext = createContext();

// export const AppProvider = ({ children }) => {
//   // User data
//   const [user, setUser] = useState({
//     username: 'Your Name',
//     instagramId: 'username',
//     isLoggedIn: false,
//   });

//   // App settings
//   const [settings, setSettings] = useState({
//     fontSize: 'medium',
//     notifications: {
//       pushEnabled: true,
//       emailEnabled: false,
//       eventReminders: true,
//       newFollowers: true,
//     },
//     privacy: {
//       profilePublic: true,
//       showEmail: false,
//       allowMessages: true,
//       showLocation: false,
//     },
//   });

//   // Font size definitions - used across all screens
//   const fontSizes = {
//     small: {
//       base: 14,
//       subtitle: 16,
//       title: 24,
//       large: 20,
//       button: 14,
//     },
//     medium: {
//       base: 16,
//       subtitle: 18,
//       title: 28,
//       large: 22,
//       button: 16,
//     },
//     large: {
//       base: 18,
//       subtitle: 20,
//       title: 32,
//       large: 24,
//       button: 18,
//     },
//   };

//   // Load data from storage when app starts
//   useEffect(() => {
//     loadData();
//   }, []);

//   // Save data whenever it changes
//   useEffect(() => {
//     saveData();
//   }, [user, settings]);

//   const loadData = async () => {
//     try {
//       const savedUser = await AsyncStorage.getItem('user');
//       const savedSettings = await AsyncStorage.getItem('settings');
      
//       if (savedUser) {
//         setUser(JSON.parse(savedUser));
//       }
//       if (savedSettings) {
//         setSettings(JSON.parse(savedSettings));
//       }
//     } catch (error) {
//       console.error('Error loading data:', error);
//     }
//   };

//   const saveData = async () => {
//     try {
//       await AsyncStorage.setItem('user', JSON.stringify(user));
//       await AsyncStorage.setItem('settings', JSON.stringify(settings));
//     } catch (error) {
//       console.error('Error saving data:', error);
//     }
//   };

//   // Update user data
//   const updateUser = (updates) => {
//     setUser(prev => ({ ...prev, ...updates }));
//   };

//   // Update settings
//   const updateSettings = (updates) => {
//     setSettings(prev => ({ ...prev, ...updates }));
//   };

//   // Update notification settings
//   const updateNotifications = (updates) => {
//     setSettings(prev => ({
//       ...prev,
//       notifications: { ...prev.notifications, ...updates }
//     }));
//   };

//   // Update privacy settings
//   const updatePrivacy = (updates) => {
//     setSettings(prev => ({
//       ...prev,
//       privacy: { ...prev.privacy, ...updates }
//     }));
//   };

//   // Update font size
//   const updateFontSize = (size) => {
//     if (['small', 'medium', 'large'].includes(size)) {
//       setSettings(prev => ({ ...prev, fontSize: size }));
//     }
//   };

//   // Logout function
//   const logout = async () => {
//     try {
//       await AsyncStorage.clear();
//       setUser({ username: '', instagramId: '', isLoggedIn: false });
//       setSettings({
//         fontSize: 'medium',
//         notifications: {
//           pushEnabled: true,
//           emailEnabled: false,
//           eventReminders: true,
//           newFollowers: true,
//         },
//         privacy: {
//           profilePublic: true,
//           showEmail: false,
//           allowMessages: true,
//           showLocation: false,
//         },
//       });
//     } catch (error) {
//       console.error('Error logging out:', error);
//     }
//   };

//   const value = {
//     // User data
//     user,
//     updateUser,
    
//     // Settings
//     settings,
//     updateSettings,
//     updateNotifications,
//     updatePrivacy,
//     updateFontSize,
    
//     // Font sizes (calculated based on current setting)
//     fontSizes,
//     currentFontSizes: fontSizes[settings.fontSize],
    
//     // Actions
//     logout,
//   };

//   return (
//     <AppContext.Provider value={value}>
//       {children}
//     </AppContext.Provider>
//   );
// };

// // Custom hook to use the context
// export const useApp = () => {
//   const context = useContext(AppContext);
//   if (!context) {
//     throw new Error('useApp must be used within AppProvider');
//   }
//   return context;
// };

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import * as Font from 'expo-font';

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // User data
  const [user, setUser] = useState({
    username: 'Your Name',
    instagramId: 'username',
    isLoggedIn: false,
  });

  // App settings
  const [settings, setSettings] = useState({
    fontSize: 'medium',
    dyslexicMode: false, // <-- new
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
  });

  // Fonts loaded
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Load Dyslexic font
  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        Dyslexic: require('../../assets/images/OpenDyslexic-Regular.otf'), // replace with your path
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  // Font size definitions
  const fontSizes = {
    small: { base: 14, subtitle: 16, title: 24, large: 20, button: 14 },
    medium: { base: 16, subtitle: 18, title: 28, large: 22, button: 16 },
    large: { base: 18, subtitle: 20, title: 32, large: 24, button: 18 },
  };

  // Load data from AsyncStorage
  useEffect(() => {
    loadData();
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    saveData();
  }, [user, settings]);

  const loadData = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('user');
      const savedSettings = await AsyncStorage.getItem('settings');
      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedSettings) setSettings(JSON.parse(savedSettings));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // User update
  const updateUser = (updates) => setUser(prev => ({ ...prev, ...updates }));

  // Settings update
  const updateSettings = (updates) => setSettings(prev => ({ ...prev, ...updates }));
  const updateNotifications = (updates) =>
    setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, ...updates } }));
  const updatePrivacy = (updates) =>
    setSettings(prev => ({ ...prev, privacy: { ...prev.privacy, ...updates } }));
  const updateFontSize = (size) => {
    if (['small', 'medium', 'large'].includes(size)) {
      setSettings(prev => ({ ...prev, fontSize: size }));
    }
  };

  // Dyslexic Mode toggle
  const updateDyslexicMode = (enabled) => {
    setSettings(prev => ({ ...prev, dyslexicMode: enabled }));
  };

  // Logout
  const logout = async () => {
    try {
      await AsyncStorage.clear();
      setUser({ username: '', instagramId: '', isLoggedIn: false });
      setSettings({
        fontSize: 'medium',
        dyslexicMode: false,
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
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Determine font family
  const fontFamily = settings.dyslexicMode && fontsLoaded ? 'Dyslexic' : 'System';

  const value = {
  user,
  updateUser,
  settings,
  updateSettings,
  dyslexicMode: settings?.dyslexicMode ?? false,
  fontSizes,
  currentFontSizes: fontSizes[settings?.fontSize ?? 'medium'],
  fontFamily,
  logout,
};

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
