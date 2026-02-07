import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '../hooks/use-color-scheme';
import { Colors } from '../constants/theme';

export default function Login({ navigation }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const inputBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Log in</Text>
          <Text style={[styles.hint, { color: colors.icon }]}>
            Use your @my.utexas.edu email
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, styles.labelFirst, { color: colors.icon }]}>Email</Text>
          <TextInput
            style={[
              styles.input,
              { color: colors.text, backgroundColor: inputBg, borderColor: 'transparent' },
            ]}
            placeholder="you@my.utexas.edu"
            placeholderTextColor={colors.icon}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={[styles.label, { color: colors.icon }]}>Password</Text>
          <TextInput
            style={[
              styles.input,
              { color: colors.text, backgroundColor: inputBg, borderColor: 'transparent' },
            ]}
            placeholder="••••••••"
            placeholderTextColor={colors.icon}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={() => navigation.navigate('Main')}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Log in</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={colors.tint} />
          <Text style={[styles.backText, { color: colors.tint }]}>Back</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 32,
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  hint: {
    fontSize: 16,
    marginTop: 8,
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  labelFirst: {
    marginTop: 0,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  button: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 28,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
