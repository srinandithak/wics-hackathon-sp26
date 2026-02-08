import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../contexts/AppContext';

const Vinyl = () => (
  <Image source={require('../assets/images/vinyl.png')} style={styles.vinyl} />
);

export default function Welcome({ navigation }) {
  const { currentFontSizes } = useApp();
  return (
    <View style={styles.container}>
      <Vinyl />
      <Text style={[styles.appName, { fontSize: currentFontSizes.hero * 0.85 }]}>UTX.FM</Text>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
        >
          <Text style={[styles.primaryButtonText, { fontSize: currentFontSizes.subtitle }]}>Log in</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Onboarding')}
          activeOpacity={0.85}
        >
          <Text style={[styles.secondaryButtonText, { fontSize: currentFontSizes.subtitle }]}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6ecd9',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  appName: {
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: 2,
    marginBottom: 8,
  },
  vinyl: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 48,
  },
  buttons: {
    width: '100%',
    maxWidth: 280,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#db775b',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  secondaryButtonText: {
    color: '#1a1a1a',
    fontSize: 17,
    fontWeight: '700',
  },
});
