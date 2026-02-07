import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '../hooks/use-color-scheme';
import { Colors } from '../constants/theme';
// import { styles } from '../styles/styles';

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

export default function Artists({ navigation }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const cardBg = isDark ? 'rgba(255,255,255,0.06)' : '#fff';
  const searchBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Text style={[styles.title, { color: colors.text }]}>Discover Artists</Text>
      <Text style={[styles.subtitle, { color: colors.icon }]}>
        UT student artists matching your taste
      </Text>

      <View style={[styles.searchWrap, { backgroundColor: searchBg }]}>
        <Ionicons name="search" size={20} color={colors.icon} style={styles.searchIcon} />
        <TextInput
          style={[styles.search, { color: colors.text }]}
          placeholder="Search artists..."
          placeholderTextColor={colors.icon}
        />
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: cardBg }, cardShadow]}>
          <View style={[styles.avatar, { backgroundColor: colors.tint }]} />
          <View style={styles.cardBody}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Artist name</Text>
            <Text style={[styles.cardMeta, { color: colors.icon }]}>Similar to: Artist A, Artist B</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.icon} />
        </View>
        <View style={[styles.card, { backgroundColor: cardBg }, cardShadow]}>
          <View style={[styles.avatar, { backgroundColor: colors.tint }]} />
          <View style={styles.cardBody}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Another artist</Text>
            <Text style={[styles.cardMeta, { color: colors.icon }]}>Similar to: Artist C</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.icon} />
        </View>
        <Text style={[styles.placeholder, { color: colors.icon }]}>
          Artist list will load here
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
    backgroundColor: '#f7efdc',
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
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  search: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 32,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  cardMeta: {
    fontSize: 14,
    marginTop: 2,
    opacity: 0.85,
  },
  placeholder: {
    fontSize: 14,
    marginTop: 12,
    fontStyle: 'italic',
  },
});
