import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import vinyl from '../assets/images/vinyl.png';
import { supabase } from '../lib/supabase';
import { DiscoverColors, discoverStyles } from '../styles/styles';

export default function Artists({ navigation }) {
  const [artists, setArtists] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [flipComplete, setFlipComplete] = useState(false);
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
      setFlipComplete(false);
      Animated.spring(flipAnim, {
        toValue: 1,
        useNativeDriver: false,
        tension: 40,
        friction: 7,
      }).start(() => setFlipComplete(true));
    } else {
      flipAnim.setValue(0);
      setFlipComplete(false);
    }
  }, [selectedArtist]);

  const filteredArtists = artists.filter((a) =>
    a.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleArtistPress = (artist) => {
    setSelectedArtist(artist);
  };

  const handleClose = () => {
    setFlipComplete(false);
    Animated.timing(flipAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
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
    outputRange: [1, 1.2], // Reduced from 1.5 to 1.2
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

              {/* Back of vinyl - solid only; text is in overlay below for crisp rendering */}
              <Animated.View
                style={[
                  artistStyles.flipCard,
                  artistStyles.flipCardBack,
                  { transform: [{ rotateY: backInterpolate }] },
                ]}
              />
            </Animated.View>
            {/* Crisp text overlay - not transformed, so no blur */}
            <View
              style={[
                artistStyles.flipCardBackOverlay,
                { opacity: flipComplete ? 1 : 0 },
              ]}
              pointerEvents={flipComplete ? 'box-none' : 'none'}
            >
              <View style={artistStyles.vinylBack}>
                <Text style={artistStyles.vinylBackTitle} allowFontScaling={false}>
                  {selectedArtist?.name}
                </Text>
                <Text style={artistStyles.vinylBackText} allowFontScaling={false}>
                  Bio: {selectedArtist?.bio || 'No bio available'}
                </Text>
                <Text style={artistStyles.vinylBackText} allowFontScaling={false}>
                  Genre: {selectedArtist?.genres?.length ? selectedArtist.genres.join(', ') : 'Unknown'}
                </Text>
              </View>
            </View>
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
    width: 240, // Reduced from 300
    height: 240, // Reduced from 300
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
    borderRadius: 120,
    padding: 20,
  },
  flipCardBackOverlay: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#1a1a1a',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vinylLarge: {
    width: 240, // Reduced from 300
    height: 240, // Reduced from 300
  },
  vinylBack: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  vinylBackTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
    includeFontPadding: false,
  },
  vinylBackText: {
    fontSize: 17,
    color: '#ccc',
    marginBottom: 8,
    textAlign: 'center',
    includeFontPadding: false,
  },
});