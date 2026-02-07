import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform,
  ScrollView,
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

export default function Events({ navigation }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const cardBg = isDark ? 'rgba(255,255,255,0.06)' : '#fff';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Text style={[styles.title, { color: colors.text }]}>Upcoming Events</Text>
      <Text style={[styles.subtitle, { color: colors.icon }]}>
        Shows & pop-ups around campus
      </Text>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: cardBg }, cardShadow]}>
          <View style={[styles.dateBadge, { backgroundColor: colors.tint }]}>
            <Text style={styles.dateDay}>15</Text>
            <Text style={styles.dateMonth}>FEB</Text>
          </View>
          <View style={styles.cardBody}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>House Show - West Campus</Text>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={14} color={colors.icon} />
              <Text style={[styles.cardMeta, { color: colors.icon }]}> 8:00 PM</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color={colors.icon} />
              <Text style={[styles.cardLocation, { color: colors.icon }]}> 2400 Nueces St</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: colors.tint + '22' }]}>
              <Text style={[styles.pillText, { color: colors.tint }]}>house party</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: cardBg }, cardShadow]}>
          <View style={[styles.dateBadge, { backgroundColor: colors.tint }]}>
            <Text style={styles.dateDay}>21</Text>
            <Text style={styles.dateMonth}>FEB</Text>
          </View>
          <View style={styles.cardBody}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Open Mic Night</Text>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={14} color={colors.icon} />
              <Text style={[styles.cardMeta, { color: colors.icon }]}> 7:00 PM</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color={colors.icon} />
              <Text style={[styles.cardLocation, { color: colors.icon }]}> Cactus Cafe</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: colors.tint + '22' }]}>
              <Text style={[styles.pillText, { color: colors.tint }]}>venue</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.placeholder, { color: colors.icon }]}>
          Events will load here
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
    marginBottom: 20,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 32,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    overflow: 'hidden',
  },
  dateBadge: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  dateDay: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 22,
  },
  dateMonth: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '600',
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  cardMeta: {
    fontSize: 14,
  },
  cardLocation: {
    fontSize: 14,
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 10,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  placeholder: {
    fontSize: 14,
    marginTop: 12,
    fontStyle: 'italic',
  },
});
