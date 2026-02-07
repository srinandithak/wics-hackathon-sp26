import React, { useState, useEffect } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';
import { Colors } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';
import { supabase } from '../supabaseClient';

export default function Profile({ navigation }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, updateUser, logout, currentFontSizes } = useApp();

  const [songInput, setSongInput] = useState('');
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's posts
  const fetchPosts = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('posts')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserPosts(profile.posts || []);
    } catch (err) {
      console.error(err);
      Alert.alert('Error fetching posts', err.message || 'Try again');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Add a new song
  const handleAddSong = async () => {
    if (!songInput.trim()) return;

    setLoading(true);
    try {
      const newPosts = [songInput.trim(), ...userPosts].slice(0, 5); // max 5 posts
      const { error } = await supabase
        .from('profiles')
        .update({ posts: newPosts })
        .eq('id', user.id);

      if (error) throw error;

      setUserPosts(newPosts);
      setSongInput('');
    } catch (err) {
      console.error(err);
      Alert.alert('Error adding song', err.message || 'Try again');
    } finally {
      setLoading(false);
    }
  };

  // Remove a song
  const handleRemoveSong = async (song) => {
    const updatedPosts = userPosts.filter((s) => s !== song);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ posts: updatedPosts })
        .eq('id', user.id);

      if (error) throw error;

      setUserPosts(updatedPosts);
    } catch (err) {
      console.error(err);
      Alert.alert('Error removing song', err.message || 'Try again');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: currentFontSizes.subtitle }]}>
            My Songs
          </Text>

          {/* Song input */}
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <TextInput
              style={[styles.input, { flex: 1, backgroundColor: colors.background, color: colors.text }]}
              placeholder="Enter song name"
              placeholderTextColor={colors.icon + '60'}
              value={songInput}
              onChangeText={setSongInput}
            />
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.tint }]}
              onPress={handleAddSong}
              disabled={loading}
            >
              <Text style={styles.addButtonText}>{loading ? '...' : 'Add'}</Text>
            </TouchableOpacity>
          </View>

          {/* Song list */}
          {userPosts.map((song, index) => (
            <View
              key={index}
              style={[styles.songItem, { backgroundColor: colors.background + '30' }]}
            >
              <Text style={{ color: colors.text, flex: 1 }}>{song}</Text>
              <TouchableOpacity onPress={() => handleRemoveSong(song)}>
                <Ionicons name="trash-outline" size={20} color={colors.icon} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionTitle: { fontWeight: '700', marginBottom: 12 },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
  },
  addButton: {
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
});
