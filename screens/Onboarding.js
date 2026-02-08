import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Animated, Easing, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../lib/supabase';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const AnimatedVinyl = () => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.Image
      source={require('../assets/images/vinyl.png')}
      style={{ width: 100, height: 100, transform: [{ rotate: spin }], marginBottom: 24 }}
    />
  );
};

export default function OnboardingScreen({ navigation }) {
  const { signUp } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [instagram, setInstagram] = useState('');
  const [genre, setGenre] = useState('');
  const [isArtist, setIsArtist] = useState(null);
  const [favoriteArtistsInput, setFavoriteArtistsInput] = useState('');
  const [similarArtistsInput, setSimilarArtistsInput] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 7 = "Making your profile…" (after sign up + profile insert)
  useEffect(() => {
    if (step !== 7) return;
    const run = async () => {
      setLoading(true);
      try {
        const data = await signUp(email.trim(), password);
        const userId = data.user?.id;
        if (!userId) throw new Error('No user id after sign up');

        const favoriteNames = favoriteArtistsInput.split(',').map((s) => s.trim()).filter(Boolean);
        const favoriteSongs = favoriteNames.map((name) => ({ title: name, artist: name }));
        const similarArtists = isArtist === true
          ? similarArtistsInput.split(',').map((s) => s.trim()).filter(Boolean)
          : [];
        const { error: rpcError } = await supabase.rpc('create_profile', {
          p_id: userId,
          p_name: name.trim() || 'User',
          p_user_type: isArtist === true ? 'artist' : 'listener',
          p_instagram_handle: instagram.trim() || null,
          p_genres: genre ? [genre] : [],
          p_favorite_artists: favoriteSongs,
          p_bio: null,
          p_profile_image_url: null,
          p_similar_artists: similarArtists.length ? similarArtists : null,
        });

        if (rpcError) throw rpcError;
        // Auth state will update and navigator will switch to Main
      } catch (err) {
        console.error(err);
        Alert.alert('Error', err.message || 'Sign up or profile creation failed. Try again.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [step]);



  const vinylIcon = (
    <Image
      source={require('../assets/images/vinyl.png')}
      style={{ width: 26, height: 26 }}
    />
  );

  if (step === 7) {
    return (
      <View style={styles.containerCenter}>
        <AnimatedVinyl />
        <Text style={styles.title}>Thank you.</Text>
        <Text style={styles.subtitle}>Making your profile…</Text>
        {loading && <ActivityIndicator size="large" style={{ marginTop: 16 }} />}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Welcome new user…</Text>

        {/* Name (required) */}
        {step >= 0 && (
          <View style={styles.row}>
            {vinylIcon}
            <View style={styles.block}>
              <Text style={styles.label}>Enter your first and last name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                returnKeyType="next"
                onSubmitEditing={() => name.trim() && setStep(1)}
              />
            </View>
          </View>
        )}

{/* Artist? */}
{step >= 1 && (
  <View style={styles.row}>
    {vinylIcon}

    <View style={{ flex: 1, marginLeft: 10 }}>
      <Text style={styles.label}>Are you an artist?</Text>

      {/* Yes */}
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => {
          setIsArtist(true);
          setStep(2); // move to next step
        }}
        activeOpacity={0.8}
      >
        <View style={[styles.checkbox, isArtist === true && styles.checkboxChecked]}>
          {isArtist === true && <MaterialIcons name="check" size={20} color="white" />}
        </View>
        <Text style={styles.checkboxLabel}>Yes</Text>
      </TouchableOpacity>

      {/* No */}
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => {
          setIsArtist(false);
          setStep(2); // move to next step
        }}
        activeOpacity={0.8}
      >
        <View style={[styles.checkbox, isArtist === false && styles.checkboxChecked]}>
          {isArtist === false && <MaterialIcons name="check" size={20} color="white" />}
        </View>
        <Text style={styles.checkboxLabel}>No</Text>
      </TouchableOpacity>
    </View>
  </View>
)}


        {/* Instagram (optional) */}
        {step >= 2 && (
          <View style={styles.row}>
            {vinylIcon}
            <View style={styles.block}>
              <Text style={styles.label}>Enter your Instagram (optional)</Text>
              <TextInput
                style={styles.input}
                value={instagram}
                onChangeText={setInstagram}
                returnKeyType="next"
                onSubmitEditing={() => setStep(3)}
              />
            </View>
          </View>
        )}

        {/* Genre (required) */}
        {step >= 3 && (
          <View style={styles.row}>
            {vinylIcon}
            <View style={styles.block}>
              <Text style={styles.label}>Enter your favorite genre of music</Text>
              <View style={styles.dropdown}>
                <Picker
                  selectedValue={genre}
                  onValueChange={(value) => {
                    setGenre(value);
                    if (value) setStep(4);
                  }}>
                  <Picker.Item label="Select a genre…" value="" />
                  <Picker.Item label="Pop" value="Pop" />
                  <Picker.Item label="Hip Hop" value="Hip Hop" />
                  <Picker.Item label="R&B" value="R&B" />
                  <Picker.Item label="Indie" value="Indie" />
                  <Picker.Item label="Rock" value="Rock" />
                  <Picker.Item label="Electronic" value="Electronic" />
                  <Picker.Item label="Jazz" value="Jazz" />
                </Picker>
              </View>
            </View>
          </View>
        )}

        {/* Favorite artists (required) – comma-separated, multiple */}
        {step >= 4 && (
          <View style={styles.row}>
            {vinylIcon}
            <View style={styles.block}>
              <Text style={styles.label}>Enter your favorite artists</Text>
              <Text style={styles.hint}>Comma-separated, e.g. Taylor Swift, Drake, Frank Ocean</Text>
              <TextInput
                style={styles.input}
                value={favoriteArtistsInput}
                onChangeText={setFavoriteArtistsInput}
                placeholder="Artist 1, Artist 2, ..."
                placeholderTextColor="rgba(255,255,255,0.7)"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => {
                  if (!favoriteArtistsInput.trim()) {
                    Alert.alert('Required', 'Enter at least one favorite artist.');
                    return;
                  }
                  setStep(isArtist ? 5 : 6);
                }}
                disabled={loading}
              >
                <Text style={styles.createButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Similar artists (artists only) */}
        {step === 5 && isArtist && (
          <View style={styles.row}>
            {vinylIcon}
            <View style={styles.block}>
              <Text style={styles.label}>Artists you're similar to</Text>
              <Text style={styles.hint}>Comma-separated, e.g. Taylor Swift, Phoebe Bridgers</Text>
              <TextInput
                style={styles.input}
                value={similarArtistsInput}
                onChangeText={setSimilarArtistsInput}
                placeholder="Artist 1, Artist 2, ..."
                placeholderTextColor="rgba(255,255,255,0.7)"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => setStep(6)}
                disabled={loading}
              >
                <Text style={styles.createButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Create account: email + password */}
        {step >= 6 && step < 7 && (
          <View style={styles.row}>
            {vinylIcon}
            <View style={styles.block}>
              <Text style={styles.label}>Create your account</Text>
              <Text style={styles.hint}>Use your @my.utexas.edu email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@my.utexas.edu"
                placeholderTextColor="rgba(255,255,255,0.7)"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
              <TextInput
                style={[styles.input, { marginTop: 10 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Password (min 6 characters)"
                placeholderTextColor="rgba(255,255,255,0.7)"
                secureTextEntry
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => {
                  if (!email.trim() || !password || password.length < 6) {
                    Alert.alert('Invalid input', 'Use a valid email and a password of at least 6 characters.');
                    return;
                  }
                  setStep(7);
                }}
                disabled={loading}
              >
                <Text style={styles.createButtonText}>Create account</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Login link */}
        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.7}
        >
          <Text style={styles.loginText}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  vinylWrapper: {
    marginTop: 2,
  },
  container: {
    flex: 1,
    backgroundColor: '#f6ecd9',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 200,
    flexGrow: 1,
  },
  containerCenter: {
    flex: 1,
    backgroundColor: '#f6ecd9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    marginTop: 100,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  hint: {
    fontSize: 13,
    marginBottom: 8,
    opacity: 0.9,
  },
  createButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  block: {
    flex: 1,
    marginLeft: 10,
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#d97a5f',
    color: 'white',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  dropdown: {
    backgroundColor: '#d97a5f',
    borderRadius: 6,
  },
  loginLink: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
  },
  loginText: {
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  checkboxContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 8,
},

checkbox: {
  width: 24,
  height: 24,
  borderWidth: 2,
  borderColor: '#000',
  borderRadius: 4,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 8,
},

checkboxChecked: {
  backgroundColor: '#db775b', // or any color you like
  borderColor: '#db775b',
},

checkboxLabel: {
  fontSize: 16,
},

});
