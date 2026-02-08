import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
    Alert,
    Animated,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/theme';
import { useApp } from '../contexts/AppContext';
import { useColorScheme } from '../hooks/use-color-scheme';
import { supabase } from '../lib/supabase';

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

    const { user, updateUser, logout, currentFontSizes } = useApp();

    const [modalVisible, setModalVisible] = useState(false);
    const [tempUsername, setTempUsername] = useState(user.username);
    const [tempInstagramId, setTempInstagramId] = useState(user.instagramId);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [sidebarAnim] = useState(new Animated.Value(-300));

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
                .select('favorite_artists')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            setUserSongs(profile.favorite_artists || []);
        } catch (err) {
            console.error(err);
            Alert.alert('Error fetching songs', err.message || 'Try again');
        }
    };

    useEffect(() => {
        if (user?.id) fetchSongs();
    }, [user?.id]);

    // Keep displayed name/handle in sync with logged-in user profile
    useEffect(() => {
        setTempUsername(user?.username ?? '');
        setTempInstagramId(user?.instagramId ?? '');
    }, [user?.username, user?.instagramId]);

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
                .update({ favorite_artists: newSongs })
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
                .update({ favorite_artists: updatedSongs })
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
        setModalVisible(false);
    };

    const handleCancel = () => {
        setTempUsername(user.username);
        setTempInstagramId(user.instagramId);
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
                <ScrollView contentContainerStyle={{ padding: 20 }}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.iconButton} onPress={openSidebar} activeOpacity={0.7}>
                            <Ionicons name="settings-outline" size={26} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.title, { color: colors.text, fontSize: currentFontSizes.title }]}>
                            My Profile
                        </Text>
                        <TouchableOpacity style={styles.iconButton} onPress={handleLogout} activeOpacity={0.7}>
                            <Ionicons name="log-out-outline" size={26} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Profile Card */}
                    <View style={[styles.profileCard, { backgroundColor: cardBg }, cardShadow]}>
                        <View style={[styles.avatarWrap, { backgroundColor: colors.tint + '25' }]}>
                            <View style={[styles.avatar, { backgroundColor: colors.tint }]} />
                            <TouchableOpacity style={[styles.editAvatarBtn, { backgroundColor: colors.tint }]}>
                                <Ionicons name="camera" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.name, { color: colors.text, fontSize: currentFontSizes.large }]}>{user.username}</Text>
                        <Text style={[styles.handle, { color: colors.icon, fontSize: currentFontSizes.base }]}>@{user.instagramId}</Text>
                        <TouchableOpacity
                            style={[styles.editButton, { borderColor: colors.tint }]}
                            onPress={() => {
                                setTempUsername(user.username);
                                setTempInstagramId(user.instagramId);
                                setModalVisible(true);
                            }}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="pencil" size={18} color={colors.tint} />
                            <Text style={[styles.editButtonText, { color: colors.tint, fontSize: currentFontSizes.button }]}>Edit profile</Text>
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

                    {/* --- My Songs Section --- */}
                    <Text style={{ fontWeight: '700', fontSize: 18, marginBottom: 8 }}>My Songs</Text>

                    {/* Inputs */}
                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                        <TextInput
                            style={{ flex: 1, borderWidth: 1, borderRadius: 12, padding: 10 }}
                            placeholder="Song Name"
                            value={songInput}
                            onChangeText={setSongInput}
                        />
                        <TextInput
                            style={{ flex: 1, borderWidth: 1, borderRadius: 12, padding: 10 }}
                            placeholder="Artist"
                            value={artistInput}
                            onChangeText={setArtistInput}
                        />
                        <TouchableOpacity
                            style={{ padding: 12, backgroundColor: '#007AFF', borderRadius: 12 }}
                            onPress={handleAddSong}
                            disabled={loading}
                        >
                            <Text style={{ color: '#fff' }}>{loading ? '...' : 'Add'}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Song list */}
                    {userSongs.map((song, index) => (
                        <View
                            key={index}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                padding: 12,
                                borderRadius: 12,
                                marginBottom: 8,
                                backgroundColor: '#f0f0f0',
                            }}
                        >
                            <Text style={{ flex: 1 }}>
                                {song.title} - {song.artist}
                            </Text>
                            <TouchableOpacity onPress={() => handleRemoveSong(index)}>
                                <Ionicons name="trash-outline" size={20} color="#888" />
                            </TouchableOpacity>
                        </View>
                    ))}

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Edit Profile Modal */}
            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={handleCancel}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={handleCancel} />
                    <View style={[styles.modalContent, { backgroundColor: cardBg }, cardShadow]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text, fontSize: currentFontSizes.title }]}>Edit Profile</Text>
                            <TouchableOpacity onPress={handleCancel}>
                                <Ionicons name="close" size={28} color={colors.icon} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text, fontSize: currentFontSizes.base }]}>Username</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, backgroundColor: sectionBg, borderColor: colors.icon + '30', fontSize: currentFontSizes.base }]}
                                value={tempUsername}
                                onChangeText={setTempUsername}
                                placeholder="Enter your username"
                                placeholderTextColor={colors.icon + '60'}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text, fontSize: currentFontSizes.base }]}>Instagram ID</Text>
                            <View style={styles.usernameInputWrapper}>
                                <Text style={[styles.atSymbol, { color: colors.icon, fontSize: currentFontSizes.base }]}>@</Text>
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

                        <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.tint }]} onPress={handleSave} activeOpacity={0.8}>
                            <Text style={[styles.saveButtonText, { fontSize: currentFontSizes.button }]}>Save Changes</Text>
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
                            <Text style={[styles.sidebarTitle, { color: colors.text, fontSize: currentFontSizes.title }]}>Settings</Text>
                            <TouchableOpacity onPress={closeSidebar}>
                                <Ionicons name="close" size={28} color={colors.icon} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.sidebarContent}>
                            <TouchableOpacity style={[styles.settingsItem, { borderBottomColor: colors.icon + '20' }]} activeOpacity={0.7}>
                                <Ionicons name="notifications-outline" size={24} color={colors.text} />
                                <Text style={[styles.settingsItemText, { color: colors.text, fontSize: currentFontSizes.subtitle }]}>Notifications</Text>
                                <Ionicons name="chevron-forward" size={20} color={colors.icon} />
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.settingsItem, { borderBottomColor: colors.icon + '20' }]} activeOpacity={0.7}>
                                <Ionicons name="lock-closed-outline" size={24} color={colors.text} />
                                <Text style={[styles.settingsItemText, { color: colors.text, fontSize: currentFontSizes.subtitle }]}>Privacy</Text>
                                <Ionicons name="chevron-forward" size={20} color={colors.icon} />
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.settingsItem, { borderBottomWidth: 0 }]} activeOpacity={0.7}>
                                <Ionicons name="text-outline" size={24} color={colors.text} />
                                <Text style={[styles.settingsItemText, { color: colors.text, fontSize: currentFontSizes.subtitle }]}>Font Size</Text>
                                <Ionicons name="chevron-forward" size={20} color={colors.icon} />
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 12 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
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
    songItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, marginBottom: 8 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalBackdrop: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontWeight: '800' },
    inputGroup: { marginBottom: 20 },
    label: { fontWeight: '600', marginBottom: 8 },
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
    settingsItemText: { flex: 1, fontWeight: '600' }
});
