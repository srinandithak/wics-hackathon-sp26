import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
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
import { useColorScheme } from '../hooks/use-color-scheme';

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

  const [username, setUsername] = useState('Your Name');
  const [instagramId, setInstagramId] = useState('username');
  const [modalVisible, setModalVisible] = useState(false);
  const [tempUsername, setTempUsername] = useState(username);
  const [tempInstagramId, setTempInstagramId] = useState(instagramId);

  const handleSave = () => {
    setUsername(tempUsername);
    setInstagramId(tempInstagramId);
    setModalVisible(false);
  };

  const handleCancel = () => {
    setTempUsername(username);
    setTempInstagramId(instagramId);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Text style={[styles.title, { color: colors.text }]}>My Profile</Text>

      <View style={[styles.profileCard, { backgroundColor: cardBg }, cardShadow]}>
        <View style={[styles.avatarWrap, { backgroundColor: colors.tint + '25' }]}>
          <View style={[styles.avatar, { backgroundColor: colors.tint }]} />
          <TouchableOpacity style={[styles.editAvatarBtn, { backgroundColor: colors.tint }]}>
            <Ionicons name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{username}</Text>
        <Text style={[styles.handle, { color: colors.icon }]}>@{instagramId}</Text>
        <TouchableOpacity
          style={[styles.editButton, { borderColor: colors.tint }]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="pencil" size={18} color={colors.tint} />
          <Text style={[styles.editButtonText, { color: colors.tint }]}>Edit profile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.section}
        contentContainerStyle={styles.sectionContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>My events</Text>
        <View style={[styles.eventsPlaceholder, { backgroundColor: sectionBg }]}>
          <Ionicons name="calendar-outline" size={32} color={colors.icon} />
          <Text style={[styles.placeholder, { color: colors.icon }]}>
            Events you're attending will show here
          </Text>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancel}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={handleCancel}
          />
          <View style={[styles.modalContent, { backgroundColor: cardBg }, cardShadow]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
              <TouchableOpacity onPress={handleCancel}>
                <Ionicons name="close" size={28} color={colors.icon} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Username</Text>
              <TextInput
                style={[styles.input, { 
                  color: colors.text, 
                  backgroundColor: sectionBg,
                  borderColor: colors.icon + '30'
                }]}
                value={tempUsername}
                onChangeText={setTempUsername}
                placeholder="Enter your username"
                placeholderTextColor={colors.icon + '60'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Instagram ID</Text>
              <View style={styles.usernameInputWrapper}>
                <Text style={[styles.atSymbol, { color: colors.icon }]}>@</Text>
                <TextInput
                  style={[styles.input, styles.usernameInput, { 
                    color: colors.text, 
                    backgroundColor: sectionBg,
                    borderColor: colors.icon + '30'
                  }]}
                  value={tempInstagramId}
                  onChangeText={setTempInstagramId}
                  placeholder="instagram_id"
                  placeholderTextColor={colors.icon + '60'}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.tint }]}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 16,
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
    fontSize: 22,
    fontWeight: '800',
  },
  handle: {
    fontSize: 15,
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
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    flex: 1,
  },
  sectionContent: {
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
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
    fontSize: 14,
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
    fontSize: 24,
    fontWeight: '800',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  usernameInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  atSymbol: {
    position: 'absolute',
    left: 14,
    fontSize: 16,
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
    fontSize: 16,
    fontWeight: '700',
  },
});