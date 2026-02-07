// import { Ionicons } from '@expo/vector-icons';
// import { useState } from 'react';
// import {
//   Alert,
//   Animated,
//   KeyboardAvoidingView,
//   Modal,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Colors } from '../constants/theme';
// import { useApp } from '../contexts/AppContext';
// import { useColorScheme } from '../hooks/use-color-scheme';

// const cardShadow = Platform.select({
//   ios: {
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.06,
//     shadowRadius: 8,
//   },
//   android: { elevation: 3 },
//   default: {},
// });

// export default function Profile({ navigation }) {
//   const colorScheme = useColorScheme();
//   const colors = Colors[colorScheme ?? 'light'];
//   const isDark = colorScheme === 'dark';
//   const cardBg = isDark ? 'rgba(255,255,255,0.06)' : '#fff';
//   const sectionBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';

//   // USE APPCONTEXT INSTEAD OF LOCAL STATE
//   const { user, updateUser, logout, currentFontSizes } = useApp();

//   const [modalVisible, setModalVisible] = useState(false);
//   const [tempUsername, setTempUsername] = useState(user.username);
//   const [tempInstagramId, setTempInstagramId] = useState(user.instagramId);
//   const [sidebarVisible, setSidebarVisible] = useState(false);
//   const [sidebarAnim] = useState(new Animated.Value(-300));

//   const handleSave = () => {
//     updateUser({
//       username: tempUsername,
//       instagramId: tempInstagramId,
//     });
//     setModalVisible(false);
//   };

//   const handleCancel = () => {
//     setTempUsername(user.username);
//     setTempInstagramId(user.instagramId);
//     setModalVisible(false);
//   };

//   const openSidebar = () => {
//     setSidebarVisible(true);
//     Animated.spring(sidebarAnim, {
//       toValue: 0,
//       useNativeDriver: true,
//       tension: 65,
//       friction: 10,
//     }).start();
//   };

//   const closeSidebar = () => {
//     Animated.timing(sidebarAnim, {
//       toValue: -300,
//       duration: 250,
//       useNativeDriver: true,
//     }).start(() => setSidebarVisible(false));
//   };

//   const handleLogout = () => {
//     Alert.alert(
//       'Log Out',
//       'Are you sure you want to log out?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Log Out',
//           style: 'destructive',
//           onPress: () => {
//             logout();
//             // Navigate to Login by accessing parent Stack navigator
//             navigation.getParent()?.navigate('Login');
//           },
//         },
//       ]
//     );
//   };

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
//       {/* Header with gear and logout */}
//       <View style={styles.header}>
//         <TouchableOpacity 
//           style={styles.iconButton} 
//           onPress={openSidebar}
//           activeOpacity={0.7}
//         >
//           <Ionicons name="settings-outline" size={26} color={colors.text} />
//         </TouchableOpacity>
//         <Text style={[styles.title, { color: colors.text, fontSize: currentFontSizes.title }]}>
//           My Profile
//         </Text>
//         <TouchableOpacity 
//           style={styles.iconButton} 
//           onPress={handleLogout}
//           activeOpacity={0.7}
//         >
//           <Ionicons name="log-out-outline" size={26} color={colors.text} />
//         </TouchableOpacity>
//       </View>

//       <View style={[styles.profileCard, { backgroundColor: cardBg }, cardShadow]}>
//         <View style={[styles.avatarWrap, { backgroundColor: colors.tint + '25' }]}>
//           <View style={[styles.avatar, { backgroundColor: colors.tint }]} />
//           <TouchableOpacity style={[styles.editAvatarBtn, { backgroundColor: colors.tint }]}>
//             <Ionicons name="camera" size={16} color="#fff" />
//           </TouchableOpacity>
//         </View>
//         <Text style={[styles.name, { color: colors.text, fontSize: currentFontSizes.large }]}>
//           {user.username}
//         </Text>
//         <Text style={[styles.handle, { color: colors.icon, fontSize: currentFontSizes.base }]}>
//           @{user.instagramId}
//         </Text>
//         <TouchableOpacity
//           style={[styles.editButton, { borderColor: colors.tint }]}
//           onPress={() => {
//             setTempUsername(user.username);
//             setTempInstagramId(user.instagramId);
//             setModalVisible(true);
//           }}
//           activeOpacity={0.8}
//         >
//           <Ionicons name="pencil" size={18} color={colors.tint} />
//           <Text style={[styles.editButtonText, { color: colors.tint, fontSize: currentFontSizes.button }]}>
//             Edit profile
//           </Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView
//         style={styles.section}
//         contentContainerStyle={styles.sectionContent}
//         showsVerticalScrollIndicator={false}
//       >
//         <Text style={[styles.sectionTitle, { color: colors.text, fontSize: currentFontSizes.subtitle }]}>
//           My events
//         </Text>
//         <View style={[styles.eventsPlaceholder, { backgroundColor: sectionBg }]}>
//           <Ionicons name="calendar-outline" size={32} color={colors.icon} />
//           <Text style={[styles.placeholder, { color: colors.icon, fontSize: currentFontSizes.base }]}>
//             Events you're attending will show here
//           </Text>
//         </View>
//       </ScrollView>

//       {/* Edit Profile Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={handleCancel}
//       >
//         <KeyboardAvoidingView 
//           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//           style={styles.modalOverlay}
//         >
//           <TouchableOpacity 
//             style={styles.modalBackdrop} 
//             activeOpacity={1} 
//             onPress={handleCancel}
//           />
//           <View style={[styles.modalContent, { backgroundColor: cardBg }, cardShadow]}>
//             <View style={styles.modalHeader}>
//               <Text style={[styles.modalTitle, { color: colors.text, fontSize: currentFontSizes.title }]}>
//                 Edit Profile
//               </Text>
//               <TouchableOpacity onPress={handleCancel}>
//                 <Ionicons name="close" size={28} color={colors.icon} />
//               </TouchableOpacity>
//             </View>

//             <View style={styles.inputGroup}>
//               <Text style={[styles.label, { color: colors.text, fontSize: currentFontSizes.base }]}>
//                 Username
//               </Text>
//               <TextInput
//                 style={[styles.input, { 
//                   color: colors.text, 
//                   backgroundColor: sectionBg,
//                   borderColor: colors.icon + '30',
//                   fontSize: currentFontSizes.base
//                 }]}
//                 value={tempUsername}
//                 onChangeText={setTempUsername}
//                 placeholder="Enter your username"
//                 placeholderTextColor={colors.icon + '60'}
//               />
//             </View>

//             <View style={styles.inputGroup}>
//               <Text style={[styles.label, { color: colors.text, fontSize: currentFontSizes.base }]}>
//                 Instagram ID
//               </Text>
//               <View style={styles.usernameInputWrapper}>
//                 <Text style={[styles.atSymbol, { color: colors.icon, fontSize: currentFontSizes.base }]}>@</Text>
//                 <TextInput
//                   style={[styles.input, styles.usernameInput, { 
//                     color: colors.text, 
//                     backgroundColor: sectionBg,
//                     borderColor: colors.icon + '30',
//                     fontSize: currentFontSizes.base
//                   }]}
//                   value={tempInstagramId}
//                   onChangeText={setTempInstagramId}
//                   placeholder="instagram_id"
//                   placeholderTextColor={colors.icon + '60'}
//                   autoCapitalize="none"
//                 />
//               </View>
//             </View>

//             <TouchableOpacity
//               style={[styles.saveButton, { backgroundColor: colors.tint }]}
//               onPress={handleSave}
//               activeOpacity={0.8}
//             >
//               <Text style={[styles.saveButtonText, { fontSize: currentFontSizes.button }]}>
//                 Save Changes
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </KeyboardAvoidingView>
//       </Modal>

//       {/* Sidebar Modal */}
//       <Modal
//         animationType="none"
//         transparent={true}
//         visible={sidebarVisible}
//         onRequestClose={closeSidebar}
//       >
//         <View style={styles.sidebarOverlay}>
//           <TouchableOpacity 
//             style={styles.sidebarBackdrop} 
//             activeOpacity={1} 
//             onPress={closeSidebar}
//           />
//           <Animated.View 
//             style={[
//               styles.sidebar, 
//               { 
//                 backgroundColor: colors.background,
//                 transform: [{ translateX: sidebarAnim }]
//               },
//               cardShadow
//             ]}
//           >
//             <View style={styles.sidebarHeader}>
//               <Text style={[styles.sidebarTitle, { color: colors.text, fontSize: currentFontSizes.title }]}>
//                 Settings
//               </Text>
//               <TouchableOpacity onPress={closeSidebar}>
//                 <Ionicons name="close" size={28} color={colors.icon} />
//               </TouchableOpacity>
//             </View>

//             <View style={styles.sidebarContent}>
//               <TouchableOpacity 
//                 style={[styles.settingsItem, { borderBottomColor: colors.icon + '20' }]}
//                 activeOpacity={0.7}
//                 onPress={() => {
//                   closeSidebar();
//                   // TODO: Navigate to notifications settings
//                 }}
//               >
//                 <Ionicons name="notifications-outline" size={24} color={colors.text} />
//                 <Text style={[styles.settingsItemText, { color: colors.text, fontSize: currentFontSizes.subtitle }]}>
//                   Notifications
//                 </Text>
//                 <Ionicons name="chevron-forward" size={20} color={colors.icon} />
//               </TouchableOpacity>

//               <TouchableOpacity 
//                 style={[styles.settingsItem, { borderBottomColor: colors.icon + '20' }]}
//                 activeOpacity={0.7}
//                 onPress={() => {
//                   closeSidebar();
//                   // TODO: Navigate to privacy settings
//                 }}
//               >
//                 <Ionicons name="lock-closed-outline" size={24} color={colors.text} />
//                 <Text style={[styles.settingsItemText, { color: colors.text, fontSize: currentFontSizes.subtitle }]}>
//                   Privacy
//                 </Text>
//                 <Ionicons name="chevron-forward" size={20} color={colors.icon} />
//               </TouchableOpacity>

//               <TouchableOpacity 
//                 style={[styles.settingsItem, { borderBottomWidth: 0 }]}
//                 activeOpacity={0.7}
//                 onPress={() => {
//                   closeSidebar();
//                   // TODO: Navigate to font size settings
//                 }}
//               >
//                 <Ionicons name="text-outline" size={24} color={colors.text} />
//                 <Text style={[styles.settingsItemText, { color: colors.text, fontSize: currentFontSizes.subtitle }]}>
//                   Font Size
//                 </Text>
//                 <Ionicons name="chevron-forward" size={20} color={colors.icon} />
//               </TouchableOpacity>
//             </View>
//           </Animated.View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingTop: 12,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   iconButton: {
//     width: 40,
//     height: 40,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   title: {
//     fontWeight: '800',
//     letterSpacing: -0.5,
//   },
//   profileCard: {
//     borderRadius: 20,
//     padding: 24,
//     alignItems: 'center',
//     marginBottom: 24,
//   },
//   avatarWrap: {
//     position: 'relative',
//     marginBottom: 14,
//   },
//   avatar: {
//     width: 88,
//     height: 88,
//     borderRadius: 44,
//   },
//   editAvatarBtn: {
//     position: 'absolute',
//     right: 0,
//     bottom: 0,
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 2,
//     borderColor: 'transparent',
//   },
//   name: {
//     fontWeight: '800',
//   },
//   handle: {
//     marginTop: 4,
//     marginBottom: 16,
//     opacity: 0.9,
//   },
//   editButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderWidth: 2,
//     borderRadius: 12,
//   },
//   editButtonText: {
//     fontWeight: '700',
//   },
//   section: {
//     flex: 1,
//   },
//   sectionContent: {
//     paddingBottom: 32,
//   },
//   sectionTitle: {
//     fontWeight: '700',
//     marginBottom: 12,
//   },
//   eventsPlaceholder: {
//     borderRadius: 16,
//     padding: 24,
//     alignItems: 'center',
//     justifyContent: 'center',
//     minHeight: 120,
//   },
//   placeholder: {
//     marginTop: 12,
//     fontStyle: 'italic',
//     textAlign: 'center',
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'flex-end',
//   },
//   modalBackdrop: {
//     position: 'absolute',
//     top: 0,
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   modalContent: {
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     padding: 24,
//     paddingBottom: 40,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 24,
//   },
//   modalTitle: {
//     fontWeight: '800',
//   },
//   inputGroup: {
//     marginBottom: 20,
//   },
//   label: {
//     fontWeight: '600',
//     marginBottom: 8,
//   },
//   input: {
//     borderWidth: 1,
//     borderRadius: 12,
//     padding: 14,
//   },
//   usernameInputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   atSymbol: {
//     position: 'absolute',
//     left: 14,
//     fontWeight: '600',
//     zIndex: 1,
//   },
//   usernameInput: {
//     flex: 1,
//     paddingLeft: 28,
//   },
//   saveButton: {
//     borderRadius: 12,
//     padding: 16,
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   saveButtonText: {
//     color: '#fff',
//     fontWeight: '700',
//   },
//   sidebarOverlay: {
//     flex: 1,
//     flexDirection: 'row',
//   },
//   sidebarBackdrop: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   sidebar: {
//     position: 'absolute',
//     left: 0,
//     top: 0,
//     bottom: 0,
//     width: 280,
//     paddingTop: 60,
//     paddingHorizontal: 20,
//   },
//   sidebarHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 32,
//   },
//   sidebarTitle: {
//     fontWeight: '800',
//   },
//   sidebarContent: {
//     flex: 1,
//   },
//   settingsItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 18,
//     borderBottomWidth: 1,
//     gap: 16,
//   },
//   settingsItemText: {
//     flex: 1,
//     fontWeight: '600',
//   },
// });

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
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

    // Post state
    const [postTitle, setPostTitle] = useState('');
    const [postDescription, setPostDescription] = useState('');
    const [posting, setPosting] = useState(false);

    const handleSave = () => {
        updateUser({
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
                    onPress: () => {
                        logout();
                        navigation.getParent()?.navigate('Login');
                    },
                },
            ]
        );
    };

    const handlePostSubmit = async () => {
        if (!postTitle.trim()) {
            Alert.alert('Please enter the name of your song.');
            return;
        }
        setPosting(true);

        try {
            const { error } = await supabase
                .from('songs')
                .insert({
                    user_id: user.id,
                    song_name: songName,
                    artist_name: artistName,
                });

            if (error) throw error;

            Alert.alert('Song saved successfully!');
            setPostTitle('');
            setPostDescription('');
        } catch (err) {
            console.error(err);
            Alert.alert('Error saving song', err.message || 'Please try again.');
        } finally {
            setPosting(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} // adjust if needed
            >
                {/* Header with gear and logout */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={openSidebar}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="settings-outline" size={26} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.text, fontSize: currentFontSizes.title }]}>
                        My Profile
                    </Text>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={handleLogout}
                        activeOpacity={0.7}
                    >
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
                    <Text style={[styles.name, { color: colors.text, fontSize: currentFontSizes.large }]}>
                        {user.username}
                    </Text>
                    <Text style={[styles.handle, { color: colors.icon, fontSize: currentFontSizes.base }]}>
                        @{user.instagramId}
                    </Text>
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
                        <Text style={[styles.editButtonText, { color: colors.tint, fontSize: currentFontSizes.button }]}>
                            Edit profile
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.section}
                    contentContainerStyle={[styles.sectionContent, { paddingBottom: 40 }]}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Events Placeholder */}
                    <Text style={[styles.sectionTitle, { color: colors.text, fontSize: currentFontSizes.subtitle }]}>
                        My events
                    </Text>
                    <View style={[styles.eventsPlaceholder, { backgroundColor: sectionBg }]}>
                        <Ionicons name="calendar-outline" size={32} color={colors.icon} />
                        <Text style={[styles.placeholder, { color: colors.icon, fontSize: currentFontSizes.base }]}>
                            Events you're attending will show here
                        </Text>
                    </View>

                    {/* Create Post Section */}
                    <View style={[styles.postSection, { backgroundColor: sectionBg, borderRadius: 16, padding: 16, marginTop: 24 }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: currentFontSizes.subtitle }]}>
                            Create a Post
                        </Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: cardBg, color: colors.text, marginBottom: 12 }]}
                            placeholder="Song Name"
                            placeholderTextColor={colors.icon + '60'}
                            value={songName}
                            onChangeText={setSongName}
                        />

                        <TextInput
                            style={[styles.input, { backgroundColor: cardBg, color: colors.text, marginBottom: 12 }]}
                            placeholder="Artist Name"
                            placeholderTextColor={colors.icon + '60'}
                            value={artistName}
                            onChangeText={setArtistName}
                        />
                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: colors.tint, marginTop: 12 }]}
                            onPress={handlePostSubmit}
                            disabled={posting}
                        >
                            <Text style={[styles.saveButtonText, { fontSize: currentFontSizes.button }]}>
                                {posting ? 'Posting...' : 'Submit'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* Modals and Sidebar */}
                {/* Edit Profile Modal */}
                {/* Sidebar Modal */}
                {/* Keep your existing modal and sidebar code here */}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    iconButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    profileCard: {
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarWrap: {
        position: 'relative',
        marginBottom: 14,
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
    },
    editAvatarBtn: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    name: {
        fontWeight: '800',
    },
    handle: {
        marginTop: 4,
        marginBottom: 16,
        opacity: 0.9,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderWidth: 2,
        borderRadius: 12,
    },
    editButtonText: {
        fontWeight: '700',
    },
    section: {
        flex: 1,
    },
    sectionContent: {
        paddingBottom: 32,
    },
    sectionTitle: {
        fontWeight: '700',
        marginBottom: 12,
    },
    eventsPlaceholder: {
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
    },
    placeholder: {
        marginTop: 12,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontWeight: '800',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
    },
    usernameInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    atSymbol: {
        position: 'absolute',
        left: 14,
        fontWeight: '600',
        zIndex: 1,
    },
    usernameInput: {
        flex: 1,
        paddingLeft: 28,
    },
    saveButton: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '700',
    },
    sidebarOverlay: {
        flex: 1,
        flexDirection: 'row',
    },
    sidebarBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sidebar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 280,
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    sidebarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    sidebarTitle: {
        fontWeight: '800',
    },
    sidebarContent: {
        flex: 1,
    },
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        borderBottomWidth: 1,
        gap: 16,
    },
    settingsItemText: {
        flex: 1,
        fontWeight: '600',
    },
    postSection: {
        marginTop: 20,
    },
    input: {
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#ccc',
    }
});