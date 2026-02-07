import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '../hooks/use-color-scheme';
import { Colors } from '../constants/theme';

export default function Onboarding({ navigation }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.hero}>
        <View style={[styles.iconWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(10,126,164,0.12)' }]}>
          <Ionicons name="musical-notes" size={48} color={colors.tint} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>UT Music Scene</Text>
        <Text style={[styles.subtitle, { color: colors.icon }]}>
          Discover student artists & shows on campus
        </Text>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary, { backgroundColor: colors.tint }]}
          onPress={() => navigation.navigate('Main')}
          activeOpacity={0.85}
        >
          <Ionicons name="headset" size={22} color="#fff" style={styles.buttonIcon} />
          <View>
            <Text style={styles.buttonText}>I'm a Listener</Text>
            <Text style={styles.buttonHint}>Discover artists & events</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.buttonSecondary,
            { borderColor: colors.tint, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'transparent' },
          ]}
          onPress={() => navigation.navigate('Main')}
          activeOpacity={0.85}
        >
          <Ionicons name="mic" size={22} color={colors.tint} style={styles.buttonIcon} />
          <View>
            <Text style={[styles.buttonTextSecondary, { color: colors.text }]}>I'm an Artist</Text>
            <Text style={[styles.buttonHintSecondary, { color: colors.icon }]}>Promote your shows</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => navigation.navigate('Login')}
        activeOpacity={0.7}
      >
        <Text style={{ color: colors.tint, fontSize: 15 }}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
    justifyContent: 'space-between',
  },
  hero: {
    alignItems: 'center',
    marginTop: 24,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  buttonGroup: {
    gap: 14,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  buttonPrimary: {},
  buttonSecondary: {
    borderWidth: 2,
  },
  buttonIcon: {
    marginRight: 14,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  buttonHint: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 14,
    marginTop: 2,
  },
  buttonTextSecondary: {
    fontSize: 18,
    fontWeight: '700',
  },
  buttonHintSecondary: {
    fontSize: 14,
    marginTop: 2,
  },
  loginLink: {
    paddingVertical: 20,
    alignSelf: 'center',
  },
});
