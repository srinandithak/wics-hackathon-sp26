// AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Profile from './screens/Profile';
import Onboarding from './screens/Onboarding';
import Login from './screens/Login';
import Artists from './screens/Artists';
import Calendar from './screens/Calendar';
import Events from './screens/Events';
import Friends from './screens/Friends';
import BottomNavigation from './components/BottomNavigation';  // import BottomNavigation

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainNavigator = () => {
    return (
        <Tab.Navigator tabBar={(props) => <BottomNavigation {...props} />}>
            <Tab.Screen name="Artists" component={Artists} options={{ headerShown: false }}/>
            <Tab.Screen name="Events" component={Events} options={{ headerShown: false }}/>
            <Tab.Screen name="Calendar" component={Calendar} options={{ headerShown: false }}/>
            <Tab.Screen name="Profile" component={Profile} options={{ headerShown: false }}/>
            <Tab.Screen name="Friends" component={Friends} options={{ headerShown: false }}/>
        </Tab.Navigator>
    );
};

const AppNavigator = () => {
    return (
        <UserProvider>
            <PostsProvider>
                <NavigationContainer>
                    <Stack.Navigator>
                        <Stack.Screen name="Onboarding" component={Onboarding} options={{ headerShown: false }} />
                        <Stack.Screen name="Main" component={MainNavigator} options={{ headerShown: false }} />
                        <Stack.Screen name="Login" component={Login} />
                    </Stack.Navigator>
                </NavigationContainer>
            </PostsProvider>
        </UserProvider>
    );
};

export default AppNavigator;
