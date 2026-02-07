import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import vinyl from '../assets/images/vinyl.png';
import { discoverStyles, DiscoverColors } from '../styles/styles';

export default function Artists({ navigation }) {
  const [artists, setArtists] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const fetchArtists = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'artist');
      if (error) console.log('Error fetching artists:', error);
      else setArtists(data || []);
    };
    fetchArtists();
  }, []);

  const filteredArtists = artists.filter((a) =>
    a.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderArtist = ({ item }) => (
    <View style={artistStyles.card}>
      <Image source={vinyl} style={artistStyles.vinyl} />
      <Text style={artistStyles.artistName}>{item.name}</Text>
    </View>
  );

  return (
    <SafeAreaView style={discoverStyles.container} edges={['top']}>
      <Text style={discoverStyles.title}>Discover Artists</Text>
      <View style={discoverStyles.searchWrap}>
        <TextInput
          style={discoverStyles.searchInput}
          placeholder="Search artists..."
          placeholderTextColor={DiscoverColors.white}
          value={searchText}
          onChangeText={setSearchText}
        />
        <Ionicons name="search" size={22} color={DiscoverColors.white} style={discoverStyles.searchIcon} />
      </View>
      <View style={discoverStyles.list}>
        <FlatList
          data={filteredArtists}
          keyExtractor={(item) => item.id}
          renderItem={renderArtist}
          numColumns={2}
          columnWrapperStyle={artistStyles.row}
          contentContainerStyle={discoverStyles.listContent}
        />
      </View>
    </SafeAreaView>
  );
}

const artistStyles = StyleSheet.create({
  row: { justifyContent: 'space-between', marginBottom: 16 },
  card: { flex: 1, alignItems: 'center', marginHorizontal: 4 },
  vinyl: { width: 200, height: 200 },
  artistName: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
});
