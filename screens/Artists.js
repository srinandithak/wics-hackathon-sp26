import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  Animated,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import vinyl from '../assets/images/vinyl.png';
import { discoverStyles, DiscoverColors } from '../styles/styles';

export default function Artists({ navigation }) {
  const [artists, setArtists] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [flipAnim] = useState(new Animated.Value(0));

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

  useEffect(() => {
    if (selectedArtist) {
      Animated.spring(flipAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }).start();
    } else {
      flipAnim.setValue(0);
    }
  }, [selectedArtist]);

  const filteredArtists = artists.filter((a) =>
    a.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleArtistPress = (artist) => {
    setSelectedArtist(artist);
  };

  const handleClose = () => {
    Animated.timing(flipAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setSelectedArtist(null));
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const scaleInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  const renderArtist = ({ item }) => (
    <TouchableOpacity
      style={artistStyles.card}
      onPress={() => handleArtistPress(item)}
      activeOpacity={0.7}
    >
      <Image source={vinyl} style={artistStyles.vinyl} />
      <Text style={artistStyles.artistName}>{item.name}</Text>
    </TouchableOpacity>
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

      <Modal
        visible={!!selectedArtist}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <TouchableOpacity
          style={artistStyles.modalOverlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <View style={artistStyles.modalContent}>
            <Animated.View
              style={[
                artistStyles.flipContainer,
                { transform: [{ scale: scaleInterpolate }] },
              ]}
            >
              {/* Front of vinyl */}
              <Animated.View
                style={[
                  artistStyles.flipCard,
                  artistStyles.flipCardFront,
                  { transform: [{ rotateY: frontInterpolate }] },
                ]}
              >
                <Image source={vinyl} style={artistStyles.vinylLarge} />
              </Animated.View>

              {/* Back of vinyl */}
              <Animated.View
                style={[
                  artistStyles.flipCard,
                  artistStyles.flipCardBack,
                  { transform: [{ rotateY: backInterpolate }] },
                ]}
              >
                <View style={artistStyles.vinylBack}>
                  <Text style={artistStyles.vinylBackTitle}>
                    {selectedArtist?.name}
                  </Text>
                  <Text style={artistStyles.vinylBackText}>
                    Bio: {selectedArtist?.bio || 'No bio available'}
                  </Text>
                  <Text style={artistStyles.vinylBackText}>
                    Genre: {selectedArtist?.genre || 'Unknown'}
                  </Text>
                </View>
              </Animated.View>
            </Animated.View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const artistStyles = StyleSheet.create({
  row: { justifyContent: 'space-between', marginBottom: 16 },
  card: { flex: 1, alignItems: 'center', marginHorizontal: 4 },
  vinyl: { width: 200, height: 200 },
  artistName: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipContainer: {
    width: 300,
    height: 300,
  },
  flipCard: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backfaceVisibility: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipCardFront: {
    backgroundColor: 'transparent',
  },
  flipCardBack: {
    backgroundColor: '#1a1a1a',
    borderRadius: 150,
    padding: 20,
  },
  vinylLarge: {
    width: 300,
    height: 300,
  },
  vinylBack: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  vinylBackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  vinylBackText: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 8,
    textAlign: 'center',
  },
});