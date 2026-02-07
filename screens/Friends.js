import React, { useState } from 'react';
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  android: { elevation: 2 },
  default: {},
});

export default function Friends({ navigation }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const [activeTab, setActiveTab] = useState('following');
  const cardBg = isDark ? 'rgba(255,255,255,0.06)' : '#fff';

  const tabs = [
    { key: 'following', label: 'Following' },
    { key: 'followers', label: 'Followers' },
    { key: 'suggested', label: 'Suggested' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Text style={[styles.title, { color: colors.text }]}>Following</Text>
      <Text style={[styles.subtitle, { color: colors.icon }]}>
        Artists you follow · Suggested for you
      </Text>

      <View style={[styles.tabRow, { borderBottomColor: colors.icon + '33' }]}>
        {tabs.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            onPress={() => setActiveTab(key)}
            style={[
              styles.tab,
              activeTab === key && [styles.tabActive, { borderBottomColor: colors.tint }],
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === key ? colors.tint : colors.icon },
                activeTab === key && styles.tabTextActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.row, { backgroundColor: cardBg }, cardShadow]}>
          <View style={[styles.avatar, { backgroundColor: colors.tint }]} />
          <View style={styles.rowBody}>
            <Text style={[styles.rowTitle, { color: colors.text }]}>Artist name</Text>
            <Text style={[styles.rowMeta, { color: colors.icon }]}>@handle</Text>
          </View>
          <TouchableOpacity style={[styles.instaButton, { borderColor: colors.icon }]}>
            <Ionicons name="logo-instagram" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.placeholder, { color: colors.icon }]}>
          List will load here
        </Text>
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
  },
  subtitle: {
    fontSize: 15,
    marginTop: 4,
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginRight: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {},
  tabText: {
    fontSize: 15,
    fontWeight: '500',
  },
  tabTextActive: {
    fontWeight: '700',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
  },
  rowBody: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  rowMeta: {
    fontSize: 14,
    marginTop: 2,
    opacity: 0.85,
  },
  instaButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    fontSize: 14,
    marginTop: 12,
    fontStyle: 'italic',
  },
});
