// // Thin compatibility wrapper for existing themed-text implementation.
// export { ThemedText } from './themed-text';

import React from 'react';
import { Text } from 'react-native';
import { useApp } from '../contexts/AppContext';

export function ThemedText({ style, ...props }) {
  const { isDyslexicMode } = useApp();
  
  return (
    <Text
      {...props}
      style={[
        style,
        isDyslexicMode && { fontFamily: 'OpenDyslexic' }
      ]}
    />
  );
}