import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import vinyl from '../assets/images/vinyl.png';
import { ThemedText } from '../components/ThemedText';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { DiscoverColors, discoverStyles } from '../styles/styles';


export default function Artists({ navigation }) {
    const { currentFontSizes } = useApp();
    const [allArtists, setAllArtists] = useState([]);
    const [artists, setArtists] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [flipComplete, setFlipComplete] = useState(false);
    const [flipAnim] = useState(new Animated.Value(0));
    const { user } = useAuth();

    // --- Mic / listening state ---
    const [isListening, setIsListening] = useState(false);
    const [listeningPhase, setListeningPhase] = useState(null); // 'listening' | 'identified'
    const [isFiltered, setIsFiltered] = useState(false);
    const [pulseAnim] = useState(new Animated.Value(0));
    const [pulse2Anim] = useState(new Animated.Value(0));
    const listeningTimers = useRef([]);

    useEffect(() => {
        if (!user?.id) return;
        const fetchAndSortArtists = async () => {
            const { data: listenerData } = await supabase
                .from('profiles')
                .select('favorite_artist_names,favorite_artists')
                .eq('id', user.id)
                .single();

            let rawFavorites = listenerData?.favorite_artist_names;
            if (typeof rawFavorites === 'string') {
                try { rawFavorites = JSON.parse(rawFavorites); } catch (_) { rawFavorites = []; }
            }
            if (!Array.isArray(rawFavorites)) rawFavorites = [];
            let listenerFavoriteNames = rawFavorites.map((name) =>
                String(name).trim().toLowerCase()
            ).filter(Boolean);

            // Fallback: older schema stored favorites as jsonb [{ title, artist }, ...]
            if (listenerFavoriteNames.length === 0) {
                let rawFavoriteSongs = listenerData?.favorite_artists;
                if (typeof rawFavoriteSongs === 'string') {
                    try { rawFavoriteSongs = JSON.parse(rawFavoriteSongs); } catch (_) { rawFavoriteSongs = []; }
                }
                if (!Array.isArray(rawFavoriteSongs)) rawFavoriteSongs = [];
                listenerFavoriteNames = rawFavoriteSongs
                    .map((s) => (s && typeof s === 'object' ? s.artist : null))
                    .map((name) => String(name ?? '').trim().toLowerCase())
                    .filter(Boolean);
            }

            const { data: allArtistsData } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_type', 'artist');

            const scoredArtists = allArtistsData.map((artist) => {
                // similar_artists may be text[], jsonb array, or jsonb string — normalize
                let rawSimilar = artist.similar_artists;
                if (typeof rawSimilar === 'string') {
                    try { rawSimilar = JSON.parse(rawSimilar); } catch (_) { rawSimilar = []; }
                }
                if (!Array.isArray(rawSimilar)) rawSimilar = [];
                const similar = rawSimilar.map((s) => String(s).trim().toLowerCase()).filter(Boolean);

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

            // Sort by score descending so best matches are first
            const sortedArtists = scoredArtists.sort((a, b) => b.score - a.score);
            setAllArtists(sortedArtists);
            setArtists(sortedArtists);
        };

        fetchAndSortArtists();
    }, [user?.id]);

    // Clean up timers on unmount
    useEffect(() => {
        return () => listeningTimers.current.forEach(clearTimeout);
    }, []);

    // --- Mic listening flow ---
    const startListening = () => {
        setIsListening(true);
        setListeningPhase('listening');

        // Start pulse animations
        const createPulse = (anim, delay) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(anim, {
                        toValue: 1,
                        duration: 1400,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ])
            );
        };
        createPulse(pulseAnim, 0).start();
        createPulse(pulse2Anim, 700).start();

        // After 3s → show identified song
        const t1 = setTimeout(() => {
            setListeningPhase('identified');
            pulseAnim.stopAnimation();
            pulse2Anim.stopAnimation();

            // After 2s → close modal, apply filter
            const t2 = setTimeout(() => {
                setIsListening(false);
                setListeningPhase(null);
                pulseAnim.setValue(0);
                pulse2Anim.setValue(0);

                // Filter to artists with Taylor Swift in similar_artists
                const taylorFiltered = allArtists.filter((a) => {
                    let raw = a.similar_artists;
                    if (typeof raw === 'string') { try { raw = JSON.parse(raw); } catch (_) { raw = []; } }
                    if (!Array.isArray(raw)) raw = [];
                    return raw.some((s) => String(s).trim().toLowerCase() === 'taylor swift');
                });
                setArtists(taylorFiltered);
                setIsFiltered(true);
            }, 2000);
            listeningTimers.current.push(t2);
        }, 3000);
        listeningTimers.current.push(t1);
    };

    const clearFilter = () => {
        setArtists(allArtists);
        setIsFiltered(false);
    };


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

    const searchFiltered = artists.filter((a) =>
        a.name.toLowerCase().includes(searchText.toLowerCase())
    );
    const matchedArtists = searchFiltered.filter((a) => a.score >= 0.6);
    const otherArtists = searchFiltered.filter((a) => a.score < 0.6);

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

    const renderArtistCard = (item, highlighted) => {
        const pct = Math.round((item.score ?? 0) * 100);
        const pctLabel = pct === 0 && (item.score ?? 0) > 0 ? '<1%' : `${pct}%`;
        return (
            <TouchableOpacity
                key={item.id}
                style={[
                    artistStyles.card,
                    highlighted && artistStyles.cardHighlighted,
                ]}
                onPress={() => handleArtistPress(item)}
                activeOpacity={0.7}
            >
                <Image source={vinyl} style={artistStyles.vinyl} />
                <Text style={[artistStyles.artistName, { fontSize: currentFontSizes.base }]}>
                    {item.name}{' '}
                    <Text style={[artistStyles.artistMatchPct, { fontSize: currentFontSizes.caption }]}>
                        {pctLabel}
                    </Text>
                </Text>
            </TouchableOpacity>
        );
    };

    // Build rows of 2 for grid layout
    const buildRows = (list) => {
        const rows = [];
        for (let i = 0; i < list.length; i += 2) {
            rows.push(list.slice(i, i + 2));
        }
        return rows;
    };

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
            {/* Filter banner */}
            {isFiltered && (
                <View style={artistStyles.filterBanner}>
                    <Ionicons name="musical-notes" size={16} color={DiscoverColors.orange} />
                    <Text style={[artistStyles.filterBannerText, { fontSize: currentFontSizes.caption }]}>
                        Showing artists similar to Taylor Swift
                    </Text>
                    <TouchableOpacity onPress={clearFilter} hitSlop={12}>
                        <Ionicons name="close-circle" size={20} color="#888" />
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView
                style={discoverStyles.list}
                contentContainerStyle={discoverStyles.listContent}
                showsVerticalScrollIndicator={false}
            >
                {searchFiltered.length === 0 ? (
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#ffffff',
                            padding: 20,
                            borderRadius: 20,
                        }}
                    >
                        <View style={{ backgroundColor: 'rgba(237, 236, 236, 0.4)', borderRadius: 20, padding: 14, alignItems: 'center' }}>
                            <ThemedText style={{ fontWeight: 1000, color: '#000000', padding: 10, fontSize: currentFontSizes.base, textAlign: 'center' }}>
                                {isFiltered
                                    ? 'No artists match this song yet!'
                                    : 'Add more favorite artists to get suggestions!'}
                            </ThemedText>
                        </View>
                    </View>
                ) : (
                    <>
                        {/* Matched artists (>= 60%) */}
                        {matchedArtists.length > 0 && (
                            <>
                                <Text style={[artistStyles.sectionLabel, { fontSize: currentFontSizes.base, color: DiscoverColors.orange }]}>
                                    Your top matches
                                </Text>
                                {buildRows(matchedArtists).map((row, i) => (
                                    <View key={`matched-${i}`} style={artistStyles.row}>
                                        {row.map((item) => renderArtistCard(item, true))}
                                        {row.length === 1 && <View style={artistStyles.card} />}
                                    </View>
                                ))}
                            </>
                        )}

                        {/* Other artists (< 60%) */}
                        {otherArtists.length > 0 && (
                            <>
                                <Text style={[artistStyles.sectionLabel, { fontSize: currentFontSizes.base, color: '#888', marginTop: matchedArtists.length > 0 ? 16 : 0 }]}>
                                    Explore more
                                </Text>
                                {buildRows(otherArtists).map((row, i) => (
                                    <View key={`other-${i}`} style={artistStyles.row}>
                                        {row.map((item) => renderArtistCard(item, false))}
                                        {row.length === 1 && <View style={artistStyles.card} />}
                                    </View>
                                ))}
                            </>
                        )}
                    </>
                )}
            </ScrollView>

            {/* Mic FAB */}
            <TouchableOpacity
                style={artistStyles.micFab}
                onPress={startListening}
                activeOpacity={0.85}
                disabled={isListening}
            >
                <Ionicons name="mic" size={28} color="#fff" />
            </TouchableOpacity>

            {/* Listening modal */}
            <Modal visible={isListening} transparent animationType="fade" onRequestClose={() => {}}>
                <View style={artistStyles.listenOverlay}>
                    <View style={artistStyles.listenContent}>
                        {listeningPhase === 'listening' && (
                            <>
                                {/* Pulse rings */}
                                <View style={artistStyles.pulseContainer}>
                                    <Animated.View
                                        style={[
                                            artistStyles.pulseRing,
                                            {
                                                transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] }) }],
                                                opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
                                            },
                                        ]}
                                    />
                                    <Animated.View
                                        style={[
                                            artistStyles.pulseRing,
                                            {
                                                transform: [{ scale: pulse2Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] }) }],
                                                opacity: pulse2Anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
                                            },
                                        ]}
                                    />
                                    <View style={artistStyles.micCircle}>
                                        <Ionicons name="mic" size={40} color="#fff" />
                                    </View>
                                </View>
                                <Text style={artistStyles.listenTitle}>Listening...</Text>
                                <Text style={artistStyles.listenHint}>Hold your phone near the music</Text>
                            </>
                        )}
                        {listeningPhase === 'identified' && (
                            <>
                                <View style={artistStyles.identifiedCard}>
                                    <Image source={vinyl} style={artistStyles.identifiedVinyl} />
                                    <View style={artistStyles.identifiedInfo}>
                                        <Text style={artistStyles.identifiedLabel}>Identified</Text>
                                        <Text style={artistStyles.identifiedSong}>Paper Rings</Text>
                                        <Text style={artistStyles.identifiedArtist}>Taylor Swift</Text>
                                    </View>
                                </View>
                                <Text style={artistStyles.identifiedHint}>Finding similar artists...</Text>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Artist detail modal */}
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
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    card: { flex: 1, alignItems: 'center', marginHorizontal: 4, borderRadius: 16, paddingVertical: 8 },
    cardHighlighted: {
        backgroundColor: 'rgba(219, 119, 91, 0.12)',
        borderWidth: 1.5,
        borderColor: 'rgba(219, 119, 91, 0.35)',
    },
    vinyl: { width: 200, height: 200 },
    artistName: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
    artistMatchPct: { fontSize: 13, color: '#888', fontWeight: '500' },
    sectionLabel: {
        fontWeight: '700',
        marginBottom: 12,
        marginTop: 4,
    },

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

    // --- Mic FAB ---
    micFab: {
        position: 'absolute',
        bottom: 24,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: DiscoverColors.orange,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
        zIndex: 10,
    },

    // --- Filter banner ---
    filterBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(219, 119, 91, 0.12)',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginBottom: 10,
        gap: 8,
    },
    filterBannerText: {
        flex: 1,
        color: '#1a1a1a',
        fontWeight: '600',
    },

    // --- Listening modal ---
    listenOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    listenContent: {
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    pulseContainer: {
        width: 140,
        height: 140,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    pulseRing: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: DiscoverColors.orange,
    },
    micCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: DiscoverColors.orange,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listenTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
    },
    listenHint: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.6)',
    },

    // --- Identified card ---
    identifiedCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        gap: 16,
    },
    identifiedVinyl: {
        width: 64,
        height: 64,
    },
    identifiedInfo: {
        flex: 1,
    },
    identifiedLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: DiscoverColors.orange,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    identifiedSong: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
    },
    identifiedArtist: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 2,
    },
    identifiedHint: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.5)',
        fontStyle: 'italic',
    },
});