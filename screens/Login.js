import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '../hooks/use-color-scheme';
import { Colors } from '../constants/theme';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';

export default function Login({ navigation }) {
  const { signIn } = useAuth();
  const { currentFontSizes } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const inputBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Enter email and password.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      // Auth state updates and navigator switches to Main
    } catch (err) {
      Alert.alert('Login failed', err.message || 'Check email and password and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text, fontSize: currentFontSizes.title }]}>Log in</Text>
          <Text style={[styles.hint, { color: colors.icon, fontSize: currentFontSizes.base }]}>
            Use your @my.utexas.edu email
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, styles.labelFirst, { color: colors.icon, fontSize: currentFontSizes.caption }]}>Email</Text>
          <TextInput
            style={[
              styles.input,
              { color: colors.text, backgroundColor: inputBg, borderColor: 'transparent', fontSize: currentFontSizes.base },
            ]}
            placeholder="you@my.utexas.edu"
            placeholderTextColor={colors.icon}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />
          <Text style={[styles.label, { color: colors.icon, fontSize: currentFontSizes.caption }]}>Password</Text>
          <TextInput
            style={[
              styles.input,
              { color: colors.text, backgroundColor: inputBg, borderColor: 'transparent', fontSize: currentFontSizes.base },
            ]}
            placeholder="••••••••"
            placeholderTextColor={colors.icon}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.buttonText, { fontSize: currentFontSizes.subtitle }]}>Log in</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={colors.tint} />
          <Text style={[styles.backText, { color: colors.tint, fontSize: currentFontSizes.base }]}>Back</Text>
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
