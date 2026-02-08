import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/theme';
import { useApp } from '../contexts/AppContext';
import { useConfirmedEvents } from '../contexts/ConfirmedEventsContext';
import { useColorScheme } from '../hooks/use-color-scheme';
import { discoverStyles } from '../styles/styles';
import { ThemedText } from '../components/ThemedText';

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

const MONTH_ORDER = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getDaysInMonth(year, monthIndex) {
  const lastDay = new Date(year, monthIndex + 1, 0);
  return lastDay.getDate();
}

function getFirstWeekday(year, monthIndex) {
  return new Date(year, monthIndex, 1).getDay();
}

export default function Calendar({ navigation }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const cardBg = isDark ? 'rgba(255,255,255,0.06)' : '#fff';
  const { currentFontSizes } = useApp();
  const { confirmedEvents } = useConfirmedEvents();

  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(1); // Feb = 1
  const [selectedDate, setSelectedDate] = useState(null); // { day, month } or null

  const sortedEvents = useMemo(() => {
    return [...confirmedEvents].sort((a, b) => {
      const monthDiff = MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month);
      if (monthDiff !== 0) return monthDiff;
      return (a.day || 0) - (b.day || 0);
    });
  }, [confirmedEvents]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstWeekday = getFirstWeekday(viewYear, viewMonth);
  const monthLabel = MONTH_ORDER[viewMonth];

  const daysWithEvents = useMemo(() => {
    const set = new Set();
    confirmedEvents.forEach((ev) => {
      if (ev.month === monthLabel) set.add(ev.day);
    });
    return set;
  }, [confirmedEvents, monthLabel]);

  const calendarCells = useMemo(() => {
    const cells = [];
    const total = firstWeekday + daysInMonth;
    const rows = 6;
    for (let i = 0; i < rows * 7; i++) {
      if (i < firstWeekday) {
        cells.push({ type: 'empty' });
      } else if (i < firstWeekday + daysInMonth) {
        const day = i - firstWeekday + 1;
        cells.push({ type: 'day', day });
      } else {
        cells.push({ type: 'empty' });
      }
    }
    return cells;
  }, [firstWeekday, daysInMonth]);

  const filteredEvents = useMemo(() => {
    if (!selectedDate) return sortedEvents;
    return sortedEvents.filter(
      (ev) => ev.day === selectedDate.day && ev.month === selectedDate.month
    );
  }, [sortedEvents, selectedDate]);

  const handleDayPress = (day) => {
    const newSel = { day, month: monthLabel };
    const isSame = selectedDate && selectedDate.day === day && selectedDate.month === monthLabel;
    setSelectedDate(isSame ? null : newSel);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Text style={[discoverStyles.title, { color: colors.text, marginBottom: 16, fontSize: currentFontSizes.hero }]}>Calendar</Text>

      <View style={[styles.calendarCard, { backgroundColor: colors.background }]}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity
            onPress={() => {
              setViewMonth((m) => (m === 0 ? 11 : m - 1));
              setSelectedDate(null);
            }}
            style={styles.arrowBtn}
            hitSlop={12}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText style={[styles.monthTitle, { color: colors.text, fontSize: currentFontSizes.subtitle }]}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </ThemedText>
          <TouchableOpacity
            onPress={() => {
              setViewMonth((m) => (m === 11 ? 0 : m + 1));
              setSelectedDate(null);
            }}
            style={styles.arrowBtn}
            hitSlop={12}
          >
            <Ionicons name="chevron-forward" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.weekdayRow}>
          {WEEKDAYS.map((d, i) => (
            <ThemedText key={i} style={[styles.weekday, { color: colors.icon, fontSize: currentFontSizes.caption }]}>
              {d}
            </ThemedText>
          ))}
        </View>
        <View style={styles.grid}>
          {calendarCells.map((cell, i) => {
            if (cell.type === 'empty') {
              return <View key={i} style={styles.cell} />;
            }
            const day = cell.day;
            const hasEvent = daysWithEvents.has(day);
            const isSelected =
              selectedDate && selectedDate.day === day && selectedDate.month === monthLabel;
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.cell,
                  styles.cellDay,
                  hasEvent && [styles.cellHasEvent, { backgroundColor: colors.tint + '20' }],
                  isSelected && [styles.cellSelected, { backgroundColor: colors.tint }],
                ]}
                onPress={() => handleDayPress(day)}
                activeOpacity={0.8}
              >
                <ThemedText
                  style={[
                    styles.cellDayText,
                    { color: isSelected ? '#fff' : colors.text, fontSize: currentFontSizes.base },
                  ]}
                >
                  {day}
                </ThemedText>
                {hasEvent && !isSelected && (
                  <View style={[styles.dot, { backgroundColor: colors.tint }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.titleRow}>
        <ThemedText style={[styles.listSectionTitle, { color: colors.text, fontSize: currentFontSizes.subtitle }]}>
          {selectedDate
            ? `Events on ${MONTH_NAMES[viewMonth].slice(0, 3)} ${selectedDate.day}`
            : 'All events'}
        </ThemedText>
        {selectedDate ? (
          <TouchableOpacity
            onPress={() => setSelectedDate(null)}
            activeOpacity={0.8}
            style={styles.showAllDaysLink}
          >
            <ThemedText style={{ color: colors.tint, fontSize: currentFontSizes.caption, fontWeight: '600' }}>
              Show all days
            </ThemedText>
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredEvents.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: cardBg }]}>
            {confirmedEvents.length === 0 ? (
              <>
                <Ionicons name="calendar-outline" size={48} color={colors.icon} />
                <ThemedText style={[styles.emptyTitle, { color: colors.text, fontSize: currentFontSizes.subtitle }]}>No events yet</ThemedText>
                <Text style={[styles.emptyHint, { color: colors.icon, fontSize: currentFontSizes.base }]}>
                  Tap "Going" on the Events tab to add events you're attending. They'll show up
                  here.
                </Text>
              </>
            ) : selectedDate ? (
              <>
                <Ionicons name="calendar-outline" size={40} color={colors.icon} />
                <ThemedText style={[styles.emptyTitle, { color: colors.text, fontSize: currentFontSizes.subtitle }]}>No events this day</ThemedText>
                <ThemedText style={[styles.emptyHint, { color: colors.icon, fontSize: currentFontSizes.base }]}>
                  Tap another day or "Show all days" above.
                </ThemedText>
              </>
            ) : null}
          </View>
        ) : (
          filteredEvents.map((ev) => (
            <View key={ev.id} style={[styles.card, { backgroundColor: cardBg }, cardShadow]}>
              <View style={[styles.dateBadge, { backgroundColor: colors.tint }]}>
                <ThemedText style={[styles.dateDay, { fontSize: currentFontSizes.large }]}>{ev.day}</ThemedText>
                <ThemedText style={[styles.dateMonth, { fontSize: currentFontSizes.caption }]}>{ev.month}</ThemedText>
              </View>
              <View style={styles.cardBody}>
                <ThemedText style={[styles.cardTitle, { color: colors.text, fontSize: currentFontSizes.subtitle }]}>{ev.title}</ThemedText>
                <View style={styles.metaRow}>
                  <Ionicons name="time-outline" size={14} color={colors.icon} />
                  <ThemedText style={[styles.cardMeta, { color: colors.icon, fontSize: currentFontSizes.caption }]}> {ev.time}</ThemedText>
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={14} color={colors.icon} />
                  <ThemedText style={[styles.cardLocation, { color: colors.icon, fontSize: currentFontSizes.caption }]}> {ev.location}</ThemedText>
                </View>
                <View style={[styles.pill, { backgroundColor: colors.tint + '22' }]}>
                  <ThemedText style={[styles.pillText, { color: colors.tint, fontSize: currentFontSizes.caption }]}>{ev.venueType}</ThemedText>
                </View>
              </View>
            </View>
          ))
        )}
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
  calendarCard: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 8,
    marginBottom: -100,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  arrowBtn: {
    padding: 4,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekday: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
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
  cellDay: {
    borderRadius: 10,
  },
  cellHasEvent: {},
  cellSelected: {},
  cellDayText: {
    fontSize: 15,
    fontWeight: '600',
  },
  dot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
    marginBottom: 8,
  },
  listSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginRight: 12,
  },
  showAllDaysLink: {
    marginLeft: 'auto',
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 32,
  },
  emptyState: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptyHint: {
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
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
    marginTop: 8,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
