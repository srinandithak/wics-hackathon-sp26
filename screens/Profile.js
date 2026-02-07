import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '../hooks/use-color-scheme';
import { Colors } from '../constants/theme';

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
        <Text style={[styles.name, { color: colors.text }]}>Your Name</Text>
        <Text style={[styles.handle, { color: colors.icon }]}>@username</Text>
        <TouchableOpacity
          style={[styles.editButton, { borderColor: colors.tint }]}
          onPress={() => {}}
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
});
