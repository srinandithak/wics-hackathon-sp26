import React from 'react';
import { Text } from 'react-native';
import { useApp } from '../app/contexts/AppContext';

export function ThemedText({ style, ...props }) {
  const { isDyslexicMode } = useApp();
  
  console.log('ThemedText - isDyslexicMode:', isDyslexicMode);
  
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