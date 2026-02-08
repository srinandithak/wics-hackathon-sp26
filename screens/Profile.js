import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Animated,
    BackHandler,
    InteractionManager,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '../components/themed-text';
import { Colors } from '../constants/theme';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useColorScheme } from '../hooks/use-color-scheme';
import { supabase } from '../lib/supabase';
import { postsToSongs, songsToPosts } from '../lib/mySongsUtils';

const cardShadow = Platform.select({
    ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
    },
    android: { elevation: 3 },
    default: {},
});

export default function Profile({ navigation }) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';
    const cardBg = isDark ? 'rgba(255,255,255,0.06)' : '#fff';
    const sectionBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';

    const insets = useSafeAreaInsets();
const { user, updateUser, logout, currentFontSizes, isDyslexicMode, toggleDyslexicMode, settings, updateNotifications, updatePrivacy, updateFontSize } = useApp();

// Add this right after to see the values
useEffect(() => {
  console.log('isDyslexicMode:', isDyslexicMode);
  console.log('toggleDyslexicMode:', toggleDyslexicMode);
}, [isDyslexicMode]);

    const { profile, refreshProfile } = useAuth();
    const isArtist = profile?.user_type === 'artist';

    const getFontFamily = () => {
        return isDyslexicMode ? 'OpenDyslexic' : 'System';
    };

    const [modalVisible, setModalVisible] = useState(false);
    const [tempUsername, setTempUsername] = useState(user.username);
    const [tempInstagramId, setTempInstagramId] = useState(user.instagramId);
    const [tempBio, setTempBio] = useState(profile?.bio ?? '');
    const [tempGenres, setTempGenres] = useState((profile?.genres ?? []).join(', '));
    const [tempSimilarArtists, setTempSimilarArtists] = useState((profile?.similar_artists ?? []).join(', '));
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [sidebarAnim] = useState(new Animated.Value(-300));
    const [settingsPanel, setSettingsPanel] = useState(null);

    // --- Songs state ---
    const [songInput, setSongInput] = useState('');
    const [artistInput, setArtistInput] = useState('');
    const [userSongs, setUserSongs] = useState([]);
    const [loading, setLoading] = useState(false);


    // --- Fetch user's songs ---
    const fetchSongs = async () => {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('posts')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            setUserSongs(postsToSongs(profile?.posts || []));
        } catch (err) {
            console.error(err);
            Alert.alert('Error fetching songs', err.message || 'Try again');
        }
    };

    useEffect(() => {
        if (user?.id) fetchSongs();
    }, [user?.id]);

    // Keep displayed name/handle and artist fields in sync with profile
    useEffect(() => {
        setTempUsername(user?.username ?? '');
        setTempInstagramId(user?.instagramId ?? '');
        setTempBio(profile?.bio ?? '');
        setTempGenres(Array.isArray(profile?.genres) ? profile.genres.join(', ') : '');
        setTempSimilarArtists(Array.isArray(profile?.similar_artists) ? profile.similar_artists.join(', ') : '');
    }, [user?.username, user?.instagramId, profile?.bio, profile?.genres, profile?.similar_artists]);

    // Add a new song
    const handleAddSong = async () => {
        if (!songInput.trim() || !artistInput.trim()) {
            Alert.alert('Both fields are required');
            return;
        }

        if (userSongs.length >= 5) {
            Alert.alert('Max 5 songs allowed');
            return;
        }

        setLoading(true);
        try {
            const newSong = { title: songInput.trim(), artist: artistInput.trim() };
            const newSongs = [newSong, ...userSongs]; // add to top

            const { error } = await supabase
                .from('profiles')
                .update({ posts: songsToPosts(newSongs) })
                .eq('id', user.id);

            if (error) throw error;

            setUserSongs(newSongs); // update local state so it shows immediately
            setSongInput('');
            setArtistInput('');
        } catch (err) {
            console.error(err);
            Alert.alert('Error adding song', err.message || 'Try again');
        } finally {
            setLoading(false);
        }
    };

    // Remove a song
    const handleRemoveSong = async (index) => {
        const updatedSongs = [...userSongs];
        updatedSongs.splice(index, 1);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ posts: songsToPosts(updatedSongs) })
                .eq('id', user.id);

            if (error) throw error;

            setUserSongs(updatedSongs);
        } catch (err) {
            console.error(err);
            Alert.alert('Error removing song', err.message || 'Try again');
        }
    };


    // --- Profile modals and sidebar ---
    const handleSave = async () => {
        await updateUser({
            username: tempUsername,
            instagramId: tempInstagramId,
        });
        if (isArtist && user?.id) {
            const genresArr = tempGenres.split(',').map((s) => s.trim()).filter(Boolean);
            const similarArr = tempSimilarArtists.split(',').map((s) => s.trim()).filter(Boolean);
            const { error } = await supabase
                .from('profiles')
                .update({
                    bio: tempBio.trim() || null,
                    genres: genresArr.length ? genresArr : null,
                    similar_artists: similarArr.length ? similarArr : null,
                })
                .eq('id', user.id);
            if (!error) await refreshProfile();
        }
        setModalVisible(false);
    };

    const handleCancel = () => {
        setTempUsername(user.username);
        setTempInstagramId(user.instagramId);
        setTempBio(profile?.bio ?? '');
        setTempGenres(Array.isArray(profile?.genres) ? profile.genres.join(', ') : '');
        setTempSimilarArtists(Array.isArray(profile?.similar_artists) ? profile.similar_artists.join(', ') : '');
        setModalVisible(false);
    };

    const openSidebar = () => {
        setSidebarVisible(true);
        Animated.spring(sidebarAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 10,
        }).start();
    };

    const closeSidebar = () => {
        Animated.timing(sidebarAnim, {
            toValue: -300,
            duration: 250,
            useNativeDriver: true,
        }).start(() => setSidebarVisible(false));
    };

    const closeSidebarAndOpenPanel = (panel) => {
        Animated.timing(sidebarAnim, {
            toValue: -300,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            setSidebarVisible(false);
            setSettingsPanel(panel);
        });
    };

    const closeSettingsPanel = () => {
        InteractionManager.runAfterInteractions(() => {
            setSettingsPanel(null);
        });
    };

    useEffect(() => {
        if (settingsPanel === null) return;
        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
            closeSettingsPanel();
            return true;
        });
        return () => sub.remove();
    }, [settingsPanel]);

    const handleLogout = () => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                {/* Fixed header */}
                <View style={[styles.headerFixed, { backgroundColor: colors.background }]}>
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.iconButton} onPress={openSidebar} activeOpacity={0.7}>
                            <Ionicons name="settings-outline" size={26} color={colors.text} />
                        </TouchableOpacity>
                        <ThemedText>
                            Profile
                        </ThemedText>
                        <TouchableOpacity style={styles.iconButton} onPress={handleLogout} activeOpacity={0.7}>
                            <Ionicons name="log-out-outline" size={26} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView contentContainerStyle={{ padding: 20 }}>
                    {/* Profile Card */}
                    <View style={[styles.profileCard, { backgroundColor: cardBg }, cardShadow]}>
                        <View style={styles.avatarWrap}>
                            <View style={[styles.avatar, { backgroundColor: colors.tint }]} />
                            <TouchableOpacity style={[styles.editAvatarBtn, { backgroundColor: colors.tint }]}>
                                <Ionicons name="camera" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <ThemedText>{user.username}</ThemedText>
                        <ThemedText style={[styles.handle, { color: colors.icon, fontSize: currentFontSizes.base }]}>@{user.instagramId}</ThemedText>
                        {isArtist && (profile?.bio || profile?.genres?.length > 0 || profile?.similar_artists?.length > 0) && (
                            <View style={[styles.artistPreview, { backgroundColor: sectionBg }]}>
                                {profile?.bio ? (
                                    <View style={styles.artistPreviewField}>
                                        <ThemedText style={[styles.artistPreviewLabel, { color: colors.icon }]}>Bio</ThemedText>
                                        <ThemedText style={[styles.artistBioText, { color: colors.text }]} numberOfLines={4}>{profile.bio}</ThemedText>
                                    </View>
                                ) : null}
                                {profile?.genres?.length > 0 ? (
                                    <View style={styles.artistPreviewField}>
                                        <ThemedText style={[styles.artistPreviewLabel, { color: colors.icon }]}>Genre</ThemedText>
                                        <ThemedText style={[styles.artistGenreText, { color: colors.tint }]}>{profile.genres.join(', ')}</ThemedText>
                                    </View>
                                ) : null}
                                {profile?.similar_artists?.length > 0 ? (
                                    <View style={styles.artistPreviewField}>
                                        <ThemedText style={[styles.artistPreviewLabel, { color: colors.icon }]}>Similar artists</ThemedText>
                                        <ThemedText style={[styles.artistSimilarText, { color: colors.text }]}>{profile.similar_artists.join(', ')}</ThemedText>
                                    </View>
                                ) : null}
                            </View>
                        )}
                        <TouchableOpacity
                            style={[styles.editButton, { borderColor: colors.tint }]}
                            onPress={() => {
                                setTempUsername(user.username);
                                setTempInstagramId(user.instagramId);
                                setTempBio(profile?.bio ?? '');
                                setTempGenres(Array.isArray(profile?.genres) ? profile.genres.join(', ') : '');
                                setTempSimilarArtists(Array.isArray(profile?.similar_artists) ? profile.similar_artists.join(', ') : '');
                                setModalVisible(true);
                            }}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="pencil" size={18} color={colors.tint} />
                            <ThemedText>Edit profile</ThemedText>
                        </TouchableOpacity>
                    </View>

                    {/* My Events Placeholder
                    <Text style={[styles.sectionTitle, { color: colors.text, fontSize: currentFontSizes.subtitle }]}>My events</Text>
                    <View style={[styles.eventsPlaceholder, { backgroundColor: sectionBg }]}>
                        <Ionicons name="calendar-outline" size={32} color={colors.icon} />
                        <Text style={[styles.placeholder, { color: colors.icon, fontSize: currentFontSizes.base }]}>
                            Events you're attending will show here
                        </Text>
                    </View> */}

                    {/* --- My Songs (Favorite Artists) Section --- */}
                    <View style={[styles.mySongsCard, { backgroundColor: cardBg }, cardShadow]}>
                        <View style={styles.mySongsHeader}>
                            <View style={[styles.mySongsIconWrap, { backgroundColor: colors.tint + '20' }]}>
                                <Ionicons name="musical-notes" size={22} color={colors.tint} />
                            </View>
                            <ThemedText>My Songs</ThemedText>
                        </View>
                        <ThemedText>
                            Add your favorite songs for other people to see when they click your profile!
                        </ThemedText>

                        {/* Add form */}
                        <View style={[styles.songFormRow, { gap: 8 }]}>
                            <TextInput
                                style={[styles.songFormInput, { color: colors.text, backgroundColor: sectionBg, borderColor: colors.icon + '30', fontSize: currentFontSizes.base }]}
                                placeholder="Song name"
                                placeholderTextColor={colors.icon + '60'}
                                value={songInput}
                                onChangeText={setSongInput}
                            />
                            <TextInput
                                style={[styles.songFormInput, { color: colors.text, backgroundColor: sectionBg, borderColor: colors.icon + '30', fontSize: currentFontSizes.base }]}
                                placeholder="Artist"
                                placeholderTextColor={colors.icon + '60'}
                                value={artistInput}
                                onChangeText={setArtistInput}
                            />
                            <TouchableOpacity
                                style={[styles.songAddBtn, { backgroundColor: colors.tint }]}
                                onPress={handleAddSong}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                <ThemedText>{loading ? '...' : 'Add'}</ThemedText>
                            </TouchableOpacity>
                        </View>

                        {/* Song list */}
                        <View style={styles.songList}>
                            {userSongs.length === 0 ? (
                                <View style={[styles.songListEmpty, { backgroundColor: sectionBg }]}>
                                    <Ionicons name="musical-notes-outline" size={28} color={colors.icon + '80'} />
                                    <ThemedText>No songs yet ...</ThemedText>
                                </View>
                            ) : (
                                userSongs.map((song, index) => (
                                    <View
                                        key={index}
                                        style={[styles.songItemCard, { backgroundColor: sectionBg, borderLeftColor: colors.tint }]}
                                    >
                                        <View style={styles.songItemContent}>
                                            <ThemedText style={[styles.songItemTitle, { color: colors.text, fontSize: currentFontSizes.base }]} numberOfLines={1}>{song.title}</ThemedText>
                                            <ThemedText style={[styles.songItemArtist, { color: colors.icon, fontSize: currentFontSizes.small }]} numberOfLines={1}>{song.artist}</ThemedText>
                                        </View>
                                        <TouchableOpacity onPress={() => handleRemoveSong(index)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                            <Ionicons name="trash-outline" size={20} color={colors.icon} />
                                        </TouchableOpacity>
                                    </View>
                                ))
                            )}
                        </View>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Edit Profile Modal */}
            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={handleCancel}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={handleCancel} />
                    <View style={[styles.modalContent, { backgroundColor: cardBg }, cardShadow]}>
                        <View style={styles.modalHeader}>
                            <ThemedText>Edit Profile</ThemedText>
                            <TouchableOpacity onPress={handleCancel}>
                                <Ionicons name="close" size={28} color={colors.icon} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <ThemedText>Username</ThemedText>
                            <TextInput
                                style={[styles.input, { color: colors.text, backgroundColor: sectionBg, borderColor: colors.icon + '30', fontSize: currentFontSizes.base }]}
                                value={tempUsername}
                                onChangeText={setTempUsername}
                                placeholder="Enter your username"
                                placeholderTextColor={colors.icon + '60'}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <ThemedText>Instagram ID</ThemedText>
                            <View style={styles.usernameInputWrapper}>
                                <ThemedText>@</ThemedText>
                                <TextInput
                                    style={[styles.input, styles.usernameInput, { color: colors.text, backgroundColor: sectionBg, borderColor: colors.icon + '30', fontSize: currentFontSizes.base }]}
                                    value={tempInstagramId}
                                    onChangeText={setTempInstagramId}
                                    placeholder="instagram_id"
                                    placeholderTextColor={colors.icon + '60'}
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        {isArtist && (
                            <>
                                <View style={styles.inputGroup}>
                                    <ThemedText>Bio</ThemedText>
                                    <TextInput
                                        style={[styles.input, styles.bioInput, { color: colors.text, backgroundColor: sectionBg, borderColor: colors.icon + '30', fontSize: currentFontSizes.base }]}
                                        value={tempBio}
                                        onChangeText={setTempBio}
                                        placeholder="Short bio for your artist profile"
                                        placeholderTextColor={colors.icon + '60'}
                                        multiline
                                        numberOfLines={3}
                                    />
                                </View>
                                <View style={styles.inputGroup}>
                                    <ThemedText>Genre(s)</ThemedText>
                                    <TextInput
                                        style={[styles.input, { color: colors.text, backgroundColor: sectionBg, borderColor: colors.icon + '30', fontSize: currentFontSizes.base }]}
                                        value={tempGenres}
                                        onChangeText={setTempGenres}
                                        placeholder="e.g. Indie, Pop (comma-separated)"
                                        placeholderTextColor={colors.icon + '60'}
                                    />
                                </View>
                                <View style={styles.inputGroup}>
                                    <ThemedText>Similar artists</ThemedText>
                                    <TextInput
                                        style={[styles.input, { color: colors.text, backgroundColor: sectionBg, borderColor: colors.icon + '30', fontSize: currentFontSizes.base }]}
                                        value={tempSimilarArtists}
                                        onChangeText={setTempSimilarArtists}
                                        placeholder="e.g. Artist A, Artist B (comma-separated)"
                                        placeholderTextColor={colors.icon + '60'}
                                    />
                                </View>
                            </>
                        )}

                        <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.tint }]} onPress={handleSave} activeOpacity={0.8}>
                            <ThemedText>Save Changes</ThemedText>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Sidebar Modal */}
            <Modal animationType="none" transparent={true} visible={sidebarVisible} onRequestClose={closeSidebar}>
                <View style={styles.sidebarOverlay}>
                    <TouchableOpacity style={styles.sidebarBackdrop} activeOpacity={1} onPress={closeSidebar} />
                    <Animated.View style={[styles.sidebar, { backgroundColor: colors.background, transform: [{ translateX: sidebarAnim }] }, cardShadow]}>
                        <View style={styles.sidebarHeader}>
                            <ThemedText>Settings</ThemedText>
                            <TouchableOpacity onPress={closeSidebar}>
                                <Ionicons name="close" size={28} color={colors.icon} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.sidebarContent}>
                            <TouchableOpacity
                                style={[styles.settingsItem, { borderBottomColor: colors.icon + '20' }]}
                                activeOpacity={0.7}
                                onPress={() => closeSidebarAndOpenPanel('notifications')}
                            >
                                <Ionicons name="notifications-outline" size={24} color={colors.text} />
                                <Text style={[styles.settingsItemText, { color: colors.text, fontSize: currentFontSizes.subtitle }]}>Notifications</Text>
                                <Ionicons name="chevron-forward" size={20} color={colors.icon} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.settingsItem, { borderBottomColor: colors.icon + '20' }]}
                                activeOpacity={0.7}
                                onPress={() => closeSidebarAndOpenPanel('privacy')}
                            >
                                <Ionicons name="lock-closed-outline" size={24} color={colors.text} />
                                <Text style={[styles.settingsItemText, { color: colors.text, fontSize: currentFontSizes.subtitle }]}>Privacy</Text>
                                <Ionicons name="chevron-forward" size={20} color={colors.icon} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.settingsItem, { borderBottomWidth: 0 }]}
                                activeOpacity={0.7}
                                onPress={() => closeSidebarAndOpenPanel('fontSize')}
                            >
                                <Ionicons name="text-outline" size={24} color={colors.text} />
                                <Text style={[styles.settingsItemText, { color: colors.text, fontSize: currentFontSizes.subtitle }]}>Font Size</Text>
                                <Ionicons name="chevron-forward" size={20} color={colors.icon} />
                            </TouchableOpacity>

                            {/* <TouchableOpacity
                                style={[styles.settingsItem, { borderBottomWidth: 0 }]}
                                activeOpacity={0.7}
                                onPress={toggleDyslexicMode}
                            >
                                <Ionicons name="text-outline" size={24} color={colors.text} />
                                <Text style={[styles.settingsItemText, { color: colors.text, fontSize: currentFontSizes.subtitle }]}>
                                    Dyslexic Mode
                                </Text>
                                <Switch
                                    value={isDyslexicMode}
                                    onValueChange={toggleDyslexicMode}
                                    trackColor={{ false: colors.icon + '30', true: colors.tint + '60' }}
                                    thumbColor={isDyslexicMode ? colors.tint : '#f4f3f4'}
                                />
                            </TouchableOpacity> */}

                            <View 
  style={[styles.settingsItem, { borderBottomWidth: 0, paddingRight: 0 }]}
>
  <Ionicons name="book-outline" size={24} color={colors.text} />
  <ThemedText style={[styles.settingsItemText, { color: colors.text, fontSize: currentFontSizes.subtitle }]}>
    Dyslexic Mode
  </ThemedText>
  <Switch
    value={isDyslexicMode}
    onValueChange={(value) => {
      console.log('Switch toggled to:', value);
      console.log('Current isDyslexicMode:', isDyslexicMode);
      toggleDyslexicMode();
    }}
    trackColor={{ false: colors.icon + '30', true: colors.tint + '60' }}
    thumbColor={isDyslexicMode ? colors.tint : '#f4f3f4'}
    ios_backgroundColor={colors.icon + '30'}
  />
</View>

                        </View>
                    </Animated.View>
                </View>
            </Modal>

            {/* Settings detail modal: Notifications / Privacy / Font Size */}
            <Modal visible={settingsPanel !== null} animationType="slide" transparent={false} onRequestClose={closeSettingsPanel} statusBarTranslucent>
                <SafeAreaView style={[styles.settingsPanelOverlay, { backgroundColor: colors.background }]} edges={['top']}>
                    <View style={[styles.settingsPanelHeader, { borderBottomColor: colors.icon + '20', backgroundColor: colors.background, paddingTop: Math.max(insets.top, 12) + 16 }, Platform.OS === 'android' && { elevation: 4 }]}>
                        <TouchableOpacity
                            onPress={closeSettingsPanel}
                            style={styles.settingsPanelBackBtn}
                            activeOpacity={0.7}
                            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                            accessible={true}
                            accessibilityRole="button"
                            accessibilityLabel="Go back"
                        >
                            <Ionicons name="arrow-back" size={28} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.settingsPanelTitle, { color: colors.text, fontSize: 20 }]} numberOfLines={1}>
                            {settingsPanel === 'notifications' && 'Notifications'}
                            {settingsPanel === 'privacy' && 'Privacy'}
                            {settingsPanel === 'fontSize' && 'Font Size'}
                        </Text>
                        <View style={{ width: 28 }} />
                    </View>
                    <ScrollView style={styles.settingsPanelScroll} contentContainerStyle={styles.settingsPanelContent} keyboardShouldPersistTaps="handled" nestedScrollEnabled={false}>
                        {settingsPanel === 'notifications' && settings?.notifications && (
                            <>
                                <View style={[styles.settingsRow, { borderBottomColor: colors.icon + '20' }]}>
                                    <Text style={[styles.settingsRowLabel, { color: colors.text, fontSize: currentFontSizes.base }]}>Push notifications</Text>
                                    <Switch value={settings.notifications.pushEnabled} onValueChange={(v) => updateNotifications({ pushEnabled: v })} trackColor={{ false: colors.icon + '40', true: colors.tint }} thumbColor="#fff" />
                                </View>
                                <View style={[styles.settingsRow, { borderBottomColor: colors.icon + '20' }]}>
                                    <Text style={[styles.settingsRowLabel, { color: colors.text, fontSize: currentFontSizes.base }]}>Email notifications</Text>
                                    <Switch value={settings.notifications.emailEnabled} onValueChange={(v) => updateNotifications({ emailEnabled: v })} trackColor={{ false: colors.icon + '40', true: colors.tint }} thumbColor="#fff" />
                                </View>
                                <View style={[styles.settingsRow, { borderBottomColor: colors.icon + '20' }]}>
                                    <Text style={[styles.settingsRowLabel, { color: colors.text, fontSize: currentFontSizes.base }]}>Event reminders</Text>
                                    <Switch value={settings.notifications.eventReminders} onValueChange={(v) => updateNotifications({ eventReminders: v })} trackColor={{ false: colors.icon + '40', true: colors.tint }} thumbColor="#fff" />
                                </View>
                                <View style={[styles.settingsRow, { borderBottomWidth: 0 }]}>
                                    <Text style={[styles.settingsRowLabel, { color: colors.text, fontSize: currentFontSizes.base }]}>New followers</Text>
                                    <Switch value={settings.notifications.newFollowers} onValueChange={(v) => updateNotifications({ newFollowers: v })} trackColor={{ false: colors.icon + '40', true: colors.tint }} thumbColor="#fff" />
                                </View>
                            </>
                        )}
                        {settingsPanel === 'privacy' && settings?.privacy && (
                            <>
                                <View style={[styles.settingsRow, { borderBottomColor: colors.icon + '20' }]}>
                                    <Text style={[styles.settingsRowLabel, { color: colors.text, fontSize: currentFontSizes.base }]}>Public profile</Text>
                                    <Switch value={settings.privacy.profilePublic} onValueChange={(v) => updatePrivacy({ profilePublic: v })} trackColor={{ false: colors.icon + '40', true: colors.tint }} thumbColor="#fff" />
                                </View>
                                <View style={[styles.settingsRow, { borderBottomColor: colors.icon + '20' }]}>
                                    <Text style={[styles.settingsRowLabel, { color: colors.text, fontSize: currentFontSizes.base }]}>Show email</Text>
                                    <Switch value={settings.privacy.showEmail} onValueChange={(v) => updatePrivacy({ showEmail: v })} trackColor={{ false: colors.icon + '40', true: colors.tint }} thumbColor="#fff" />
                                </View>
                                <View style={[styles.settingsRow, { borderBottomColor: colors.icon + '20' }]}>
                                    <Text style={[styles.settingsRowLabel, { color: colors.text, fontSize: currentFontSizes.base }]}>Allow messages</Text>
                                    <Switch value={settings.privacy.allowMessages} onValueChange={(v) => updatePrivacy({ allowMessages: v })} trackColor={{ false: colors.icon + '40', true: colors.tint }} thumbColor="#fff" />
                                </View>
                                <View style={[styles.settingsRow, { borderBottomWidth: 0 }]}>
                                    <Text style={[styles.settingsRowLabel, { color: colors.text, fontSize: currentFontSizes.base }]}>Show location</Text>
                                    <Switch value={settings.privacy.showLocation} onValueChange={(v) => updatePrivacy({ showLocation: v })} trackColor={{ false: colors.icon + '40', true: colors.tint }} thumbColor="#fff" />
                                </View>
                            </>
                        )}
                        {settingsPanel === 'fontSize' && (
                            <View style={styles.fontSizeOptions}>
                                {['small', 'medium', 'large'].map((size) => (
                                    <TouchableOpacity
                                        key={size}
                                        style={[styles.fontSizeOption, { backgroundColor: settings?.fontSize === size ? colors.tint + '25' : sectionBg, borderColor: settings?.fontSize === size ? colors.tint : colors.icon + '30' }]}
                                        onPress={() => updateFontSize(size)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[styles.fontSizeOptionText, { color: colors.text, fontSize: currentFontSizes.base }]}>
                                            {size === 'small' && 'Small'}
                                            {size === 'medium' && 'Medium'}
                                            {size === 'large' && 'Large'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 12 },
    headerFixed: { paddingHorizontal: 20, paddingBottom: 12 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    title: { fontWeight: '800', letterSpacing: -0.5 },
    profileCard: { borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 24 },
    avatarWrap: { position: 'relative', marginBottom: 14 },
    avatar: { width: 88, height: 88, borderRadius: 44 },
    editAvatarBtn: { position: 'absolute', right: 0, bottom: 0, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
    name: { fontWeight: '800' },
    handle: { marginTop: 4, marginBottom: 16, opacity: 0.9 },
    editButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 20, borderWidth: 2, borderRadius: 12 },
    editButtonText: { fontWeight: '700' },
    sectionTitle: { fontWeight: '700', marginBottom: 12 },
    eventsPlaceholder: { borderRadius: 16, padding: 24, alignItems: 'center', justifyContent: 'center', minHeight: 120 },
    placeholder: { marginTop: 12, fontStyle: 'italic', textAlign: 'center' },
    input: { borderWidth: 1, borderRadius: 12, padding: 12 },
    addButton: { paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    addButtonText: { color: '#fff', fontWeight: '700' },
    mySongsCard: { borderRadius: 16, padding: 20, marginBottom: 24 },
    mySongsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    mySongsIconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    mySongsTitle: { fontWeight: '800' },
    mySongsSubtitle: { marginBottom: 16 },
    songFormRow: { flexDirection: 'row', marginBottom: 16 },
    songFormInput: { flex: 1, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
    songAddBtn: { paddingHorizontal: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    songAddBtnText: { color: '#fff', fontWeight: '700' },
    songList: { gap: 8 },
    songListEmpty: { padding: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    songListEmptyText: { marginTop: 8 },
    songItemCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderLeftWidth: 4 },
    songItemContent: { flex: 1, marginRight: 12 },
    songItemTitle: { fontWeight: '600' },
    songItemArtist: { marginTop: 2 },
    songItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, marginBottom: 8 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalBackdrop: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontWeight: '800' },
    inputGroup: { marginBottom: 20 },
    label: { fontWeight: '600', marginBottom: 8 },
    bioInput: { minHeight: 72, textAlignVertical: 'top' },
    artistPreview: { paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, marginTop: 14, marginBottom: 16, width: '100%', gap: 14 },
    artistPreviewField: { gap: 4 },
    artistPreviewLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
    artistBioText: { fontSize: 14, lineHeight: 20 },
    artistGenreText: { fontSize: 13, fontWeight: '600' },
    artistSimilarText: { fontSize: 13, lineHeight: 18 },
    usernameInputWrapper: { flexDirection: 'row', alignItems: 'center' },
    atSymbol: { position: 'absolute', left: 14, fontWeight: '600', zIndex: 1 },
    usernameInput: { flex: 1, paddingLeft: 28 },
    saveButton: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
    saveButtonText: { color: '#fff', fontWeight: '700' },
    sidebarOverlay: { flex: 1, flexDirection: 'row' },
    sidebarBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    sidebar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 280, paddingTop: 60, paddingHorizontal: 20 },
    sidebarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
    sidebarTitle: { fontWeight: '800' },
    sidebarContent: { flex: 1 },
    settingsItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, gap: 16 },
    settingsItemText: { flex: 1, fontWeight: '600' },
    settingsPanelOverlay: { flex: 1 },
    settingsPanelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 16, borderBottomWidth: 1, zIndex: 10 },
    settingsPanelBackBtn: { padding: 12, margin: -12, minWidth: 48, minHeight: 48, justifyContent: 'center', alignItems: 'center' },
    settingsPanelTitle: { fontWeight: '800' },
    settingsPanelScroll: { flex: 1 },
    settingsPanelContent: { padding: 20, paddingBottom: 40 },
    settingsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1 },
    settingsRowLabel: { fontWeight: '600', flex: 1 },
    fontSizeOptions: { gap: 12 },
    fontSizeOption: { paddingVertical: 16, paddingHorizontal: 20, borderRadius: 12, borderWidth: 2 },
    fontSizeOptionText: { fontWeight: '600' },
});
