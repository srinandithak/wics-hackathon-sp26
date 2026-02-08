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
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { DiscoverColors, discoverStyles } from '../styles/styles';
import { ThemedText } from '../components/ThemedText';


export default function Artists({ navigation }) {
    const { currentFontSizes } = useApp();
    const [artists, setArtists] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [flipComplete, setFlipComplete] = useState(false);
    const [flipAnim] = useState(new Animated.Value(0));
    const { user } = useAuth();

    useEffect(() => {
        if (!user?.id) return;
        const fetchAndSortArtists = async () => {
            const { data: listenerData } = await supabase
                .from('profiles')
                .select('favorite_artist_names')
                .eq('id', user.id)
                .single();

            const listenerFavoriteNames = (listenerData?.favorite_artist_names || []).map((name) =>
                String(name).trim().toLowerCase()
            ).filter(Boolean);

            const { data: allArtists } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_type', 'artist');

            const scoredArtists = allArtists.map((artist) => {
                const similar = (artist.similar_artists || []).map((s) => String(s).trim().toLowerCase());

                if (similar.length === 0) {
                    return { ...artist, score: 0 };
                }

                const matchCount = similar.filter((s) => listenerFavoriteNames.includes(s)).length;

                const percentage = matchCount / similar.length;

                return {
                    ...artist,
                    score: percentage,
                };
            });

            const filteredScoredArtists = scoredArtists.filter((a) => a.score >= 0.6);
            setArtists(filteredScoredArtists);
        };

        fetchAndSortArtists();
    }, [user?.id]);


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
            <Text style={[artistStyles.artistName, { fontSize: currentFontSizes.base }]}>{item.name} <Text style={[artistStyles.artistMatchPct, { fontSize: currentFontSizes.caption }]}>{Math.round(item.score * 100)}%</Text></Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={discoverStyles.container} edges={['top']}>
            <ThemedText style={[discoverStyles.title, { fontSize: currentFontSizes.hero }]}>Discover Artists</ThemedText>
            {/* <Text style={[discoverStyles.title, { fontSize: currentFontSizes.hero }]}>Discover Artists</Text> */}
            <View style={discoverStyles.searchWrap}>
                <TextInput
                    style={[discoverStyles.searchInput, { fontSize: currentFontSizes.base }]}
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
                    ListEmptyComponent={() => (
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: '#ffffff', // the back box
                                padding: 20,
                                borderRadius: 20,
                            }}
                        >
                            <View style={{ backgroundColor: 'rgba(237, 236, 236, 0.4)', borderRadius: 20, padding: 14, alignItems: 'center', }}>
                                <ThemedText style={{ fontWeight: 1000, color: '#000000', padding: 10, fontSize: currentFontSizes.base, textAlign: 'center' }}>
                                    Add more favorite artists to get suggestions!
                                </ThemedText>
                            </View>

                        </View>
                    )}
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
                                <ThemedText style={[artistStyles.vinylBackTitle, { fontSize: currentFontSizes.title }]} allowFontScaling={false}>
                                    {selectedArtist?.name}
                                </ThemedText>
                                <ThemedText style={[artistStyles.vinylBackText, { fontSize: currentFontSizes.subtitle }]} allowFontScaling={false}>
                                    Bio: {selectedArtist?.bio || 'No bio available'}
                                </ThemedText>
                                <ThemedText style={[artistStyles.vinylBackText, { fontSize: currentFontSizes.subtitle }]} allowFontScaling={false}>
                                    Genre: {selectedArtist?.genres?.length ? selectedArtist.genres.join(', ') : 'Unknown'}
                                </ThemedText>
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
    artistMatchPct: { fontSize: 13, color: '#888', fontWeight: '500' },

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