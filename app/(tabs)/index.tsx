import React from 'react';
import AppNavigator from '../../AppNavigator';
import { AppProvider } from '../contexts/AppContext';


export default function Index() {
  return(
      <AppProvider>
        <AppNavigator />;
      </AppProvider>
)};
