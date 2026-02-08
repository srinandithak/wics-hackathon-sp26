// AppNavigator.js
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ConfirmedEventsProvider } from './contexts/ConfirmedEventsContext';
import Profile from './screens/Profile';
import Welcome from './screens/Welcome';
import Onboarding from './screens/Onboarding';
import Login from './screens/Login';
import Artists from './screens/Artists';
import Calendar from './screens/Calendar';
import Events from './screens/Events';
import Friends from './screens/Friends';
import BottomNavigation from './components/BottomNavigation';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainNavigator = () => (
  <Tab.Navigator tabBar={(props) => <BottomNavigation {...props} />}>
    <Tab.Screen name="Artists" component={Artists} options={{ headerShown: false }} />
    <Tab.Screen name="Events" component={Events} options={{ headerShown: false }} />
    <Tab.Screen name="Calendar" component={Calendar} options={{ headerShown: false }} />
    <Tab.Screen name="Friends" component={Friends} options={{ headerShown: false }} />
    <Tab.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
  </Tab.Navigator>
);

function AuthStack() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (session) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainNavigator} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Welcome">
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Onboarding" component={Onboarding} />
    </Stack.Navigator>
  );
}

const AppNavigator = () => (
  <AuthProvider>
    <AppProvider>
      <ConfirmedEventsProvider>
        <AuthStack />
      </ConfirmedEventsProvider>
    </AppProvider>
  </AuthProvider>
);

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppNavigator;
