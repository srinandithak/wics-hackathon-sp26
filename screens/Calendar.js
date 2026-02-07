import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '../hooks/use-color-scheme';
import { Colors } from '../constants/theme';

export default function Calendar({ navigation }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const surfaceBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Text style={[styles.title, { color: colors.text }]}>Calendar</Text>
      <Text style={[styles.subtitle, { color: colors.icon }]}>
        See when your followed artists are playing
      </Text>

      <View style={[styles.calendarPlaceholder, { backgroundColor: surfaceBg }]}>
        <View style={[styles.monthHeader, { borderBottomColor: colors.icon + '33' }]}>
          <Text style={[styles.monthTitle, { color: colors.text }]}>February 2026</Text>
        </View>
        <View style={styles.weekdayRow}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <Text key={i} style={[styles.weekday, { color: colors.icon }]}>{d}</Text>
          ))}
        </View>
        <View style={styles.grid}>
          {Array.from({ length: 35 }, (_, i) => (
            <View key={i} style={[styles.cell, { backgroundColor: 'transparent' }]}>
              <Text style={[styles.cellText, { color: i >= 5 && i < 28 ? colors.text : colors.icon }]}>
                {i < 5 ? '' : i - 4 > 28 ? '' : i - 4}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.legend}>
          <Ionicons name="calendar-outline" size={24} color={colors.icon} />
          <Text style={[styles.placeholderText, { color: colors.icon }]}>
            Calendar view will go here (e.g. react-native-calendars)
          </Text>
        </View>
      </View>
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
  calendarPlaceholder: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    padding: 16,
  },
  monthHeader: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekday: {
    fontSize: 13,
    fontWeight: '600',
    width: 32,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontSize: 15,
    fontWeight: '500',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.2)',
  },
  placeholderText: {
    fontSize: 13,
    fontStyle: 'italic',
    flex: 1,
  },
});
