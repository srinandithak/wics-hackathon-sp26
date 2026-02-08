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
  ScrollView,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { scrapeArtistEvents } from '../lib/eventScraper';
import vinyl from '../assets/images/vinyl.png';
import { discoverStyles, DiscoverColors } from '../styles/styles';

export default function Artists({ navigation }) {
  const [artists, setArtists] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [artistEvents, setArtistEvents] = useState([]);
  const [socialMedia, setSocialMedia] = useState([]);
  const [loading, setLoading] = useState(false);
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
      fetchArtistDetails(selectedArtist);
      Animated.spring(flipAnim, {
        toValue: 1,
        useNativeDriver: false,
        tension: 40,
        friction: 7,
      }).start();
    } else {
      flipAnim.setValue(0);
      setArtistEvents([]);
      setSocialMedia([]);
    }
  }, [selectedArtist]);

  const fetchArtistDetails = async (artist) => {
    setLoading(true);
    
    // Fetch existing events for this artist
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .contains('artist_ids', [artist.id])
      .order('date_time', { ascending: true });

    // Extract social media from artist profile
    const socialMediaObj = artist.social_media || {};
    const socialProfiles = Object.entries(socialMediaObj).map(([platform, data]) => ({
      platform: platform.charAt(0).toUpperCase() + platform.slice(1),
      url: data.url,
      title: data.title
    }));

    setArtistEvents(events || []);
    setSocialMedia(socialProfiles);

    // If no scraped events found, try scraping
    const scrapedEvents = events?.filter(e => e.venue_type === 'scraped') || [];
    if (scrapedEvents.length === 0) {
      console.log('No scraped events found, attempting to scrape...');
      const scraped = await scrapeArtistEvents(artist.id, artist.name);
      
      // Refetch events after scraping
      const { data: newEvents } = await supabase
        .from('events')
        .select('*')
        .contains('artist_ids', [artist.id])
        .order('date_time', { ascending: true });
      
      // Refetch artist profile to get updated social media
      const { data: updatedArtist } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', artist.id)
        .single();

      if (updatedArtist?.social_media) {
        const updatedSocialProfiles = Object.entries(updatedArtist.social_media).map(([platform, data]) => ({
          platform: platform.charAt(0).toUpperCase() + platform.slice(1),
          url: data.url,
          title: data.title
        }));
        setSocialMedia(updatedSocialProfiles);
      }
      
      setArtistEvents(newEvents || scraped.events || []);
    }

    setLoading(false);
  };

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
    outputRange: [1, 1.2],
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
          placeholderTextColor={DiscoverColors.placeholder}
          value={searchText}
          onChangeText={setSearchText}
        />
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
          <TouchableOpacity 
            activeOpacity={1} 
            style={artistStyles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
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
                <ScrollView 
                  style={artistStyles.scrollContent}
                  contentContainerStyle={artistStyles.vinylBack}
                  showsVerticalScrollIndicator={false}
                >
                  <Text 
                    style={artistStyles.vinylBackTitle}
                    allowFontScaling={false}
                  >
                    {selectedArtist?.name}
                  </Text>

                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      {/* Events Section */}
                      {artistEvents.length > 0 && (
                        <View style={artistStyles.section}>
                          <Text style={artistStyles.sectionTitle}>
                            Upcoming Events
                          </Text>
                          {artistEvents.slice(0, 3).map((event) => (
                            <TouchableOpacity
                              key={event.id}
                              style={artistStyles.eventItem}
                            >
                              <Text style={artistStyles.eventTitle}>
                                {event.title}
                              </Text>
                              <Text style={artistStyles.eventDetail}>
                                📅 {event.date_time}
                              </Text>
                              <Text style={artistStyles.eventDetail}>
                                📍 {event.location}
                              </Text>
                              {event.description && (
                                <Text style={artistStyles.eventDescription}>
                                  {event.description.substring(0, 100)}...
                                </Text>
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}

                      {/* Social Media Section */}
                      {socialMedia.length > 0 && (
                        <View style={artistStyles.section}>
                          <Text style={artistStyles.sectionTitle}>
                            Social Media
                          </Text>
                          {socialMedia.map((social, index) => (
                            <TouchableOpacity
                              key={index}
                              onPress={() => Linking.openURL(social.url)}
                              style={artistStyles.socialItem}
                            >
                              <Text style={artistStyles.socialText}>
                                {social.platform}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}

                      {/* Bio */}
                      {selectedArtist?.bio && (
                        <View style={artistStyles.section}>
                          <Text style={artistStyles.vinylBackText}>
                            {selectedArtist.bio}
                          </Text>
                        </View>
                      )}

                      {!loading && artistEvents.length === 0 && (
                        <Text style={artistStyles.noEvents}>
                          No events found yet. Check back soon!
                        </Text>
                      )}
                    </>
                  )}
                </ScrollView>
              </Animated.View>
            </Animated.View>
          </TouchableOpacity>
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
    maxHeight: '80%',
  },
  flipContainer: {
    width: 320,
    height: 450,
  },
  flipCard: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backfaceVisibility: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  flipCardFront: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
  },
  flipCardBack: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  vinylLarge: {
    width: 240,
    height: 240,
  },
  scrollContent: {
    flex: 1,
    width: '100%',
  },
  vinylBack: {
    alignItems: 'center',
    width: '100%',
    paddingBottom: 20,
  },
  vinylBackTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
    includeFontPadding: false,
  },
  section: {
    width: '100%',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  eventItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  eventDetail: {
    fontSize: 11,
    color: '#ccc',
    marginBottom: 2,
  },
  eventDescription: {
    fontSize: 10,
    color: '#aaa',
    marginTop: 4,
    fontStyle: 'italic',
  },
  socialItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
    alignItems: 'center',
  },
  socialText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  vinylBackText: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center',
    includeFontPadding: false,
  },
  noEvents: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
});