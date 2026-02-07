import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
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
import { useConfirmedEvents } from '../contexts/ConfirmedEventsContext';
import { useColorScheme } from '../hooks/use-color-scheme';
import discoverStyles from '../styles/discoverStyles';

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

// Dummy events with friend counts – sorted by most friends first
const EVENTS_RAW = [
  { id: 'e1', title: 'House Show - West Campus', day: 15, month: 'FEB', time: '8:00 PM', location: '2400 Nueces St', venueType: 'house party', friendsGoing: ['Jordan', 'Sam', 'Alex'] },
  { id: 'e2', title: 'Open Mic Night', day: 21, month: 'FEB', time: '7:00 PM', location: 'Cactus Cafe', venueType: 'venue', friendsGoing: ['Jordan', 'Sam'] },
  { id: 'e3', title: 'Indie Night at the Union', day: 22, month: 'FEB', time: '9:00 PM', location: 'Texas Union', venueType: 'venue', friendsGoing: ['Sam'] },
  { id: 'e4', title: 'Pop-up at Co-op', day: 28, month: 'FEB', time: '6:00 PM', location: 'University Co-op', venueType: 'pop-up', friendsGoing: [] },
];

function getFriendsLabel(friendsGoing) {
  const n = friendsGoing.length;
  if (n === 0) return 'No friends going';
  if (n === 1) return `${friendsGoing[0]} is going`;
  if (n === 2) return `${friendsGoing[0]} and ${friendsGoing[1]} are going`;
  return `${friendsGoing[0]} and ${n - 1} other${n - 1 === 1 ? '' : 's'} going`;
}

export default function Events({ navigation }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const cardBg = isDark ? 'rgba(255,255,255,0.06)' : '#fff';
  const { isConfirmed, toggleEvent } = useConfirmedEvents();
  const [searchText, setSearchText] = useState('');

  const events = useMemo(() => {
    const sorted = [...EVENTS_RAW].sort((a, b) => b.friendsGoing.length - a.friendsGoing.length);
    if (!searchText.trim()) return sorted;
    const q = searchText.toLowerCase().trim();
    return sorted.filter(
      (ev) =>
        ev.title.toLowerCase().includes(q) ||
        ev.location.toLowerCase().includes(q) ||
        ev.venueType.toLowerCase().includes(q)
    );
  }, [searchText]);

  return (
    <SafeAreaView style={discoverStyles.container} edges={['top']}>
      <Text style={discoverStyles.title}>Discover Events</Text>
      <Text style={[eventStyles.subtitle, { color: colors.icon }]}>
        Shows & pop-ups · More friends = higher in the list
      </Text>

      <View style={discoverStyles.searchWrap}>
        <TextInput
          style={discoverStyles.searchInput}
          placeholder="Search events..."
          placeholderTextColor="#687076"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <ScrollView
        style={eventStyles.list}
        contentContainerStyle={eventStyles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {events.map((ev) => {
          const friendCount = ev.friendsGoing.length;
          const friendsLabel = getFriendsLabel(ev.friendsGoing);
          const imGoing = isConfirmed(ev.id);
          return (
            <View key={ev.id} style={[eventStyles.card, { backgroundColor: cardBg }, cardShadow]}>
              <View style={[eventStyles.dateBadge, { backgroundColor: colors.tint }]}>
                <Text style={eventStyles.dateDay}>{ev.day}</Text>
                <Text style={eventStyles.dateMonth}>{ev.month}</Text>
              </View>
              <View style={eventStyles.cardBody}>
                <Text style={[eventStyles.cardTitle, { color: colors.text }]}>{ev.title}</Text>
                <View style={eventStyles.metaRow}>
                  <Ionicons name="time-outline" size={14} color={colors.icon} />
                  <Text style={[eventStyles.cardMeta, { color: colors.icon }]}> {ev.time}</Text>
                </View>
                <View style={eventStyles.metaRow}>
                  <Ionicons name="location-outline" size={14} color={colors.icon} />
                  <Text style={[eventStyles.cardLocation, { color: colors.icon }]}> {ev.location}</Text>
                </View>
                <View style={[eventStyles.friendsRow, { backgroundColor: friendCount > 0 ? colors.tint + '18' : colors.icon + '18' }]}>
                  <Ionicons
                    name="people-outline"
                    size={14}
                    color={friendCount > 0 ? colors.tint : colors.icon}
                  />
                  <Text
                    style={[
                      eventStyles.friendsLabel,
                      { color: friendCount > 0 ? colors.tint : colors.icon },
                    ]}
                  >
                    {friendsLabel}
                  </Text>
                  {friendCount > 0 && (
                    <View style={[eventStyles.friendCountBadge, { backgroundColor: colors.tint }]}>
                      <Text style={eventStyles.friendCountText}>{friendCount}</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={[
                    eventStyles.goingButton,
                    imGoing ? { backgroundColor: colors.tint } : { borderColor: colors.tint, borderWidth: 2 },
                  ]}
                  onPress={() => toggleEvent(ev)}
                  activeOpacity={0.85}
                >
                  {imGoing ? (
                    <>
                      <Ionicons name="checkmark-circle" size={18} color="#fff" />
                      <Text style={eventStyles.goingButtonTextActive}>You're going</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="add-circle-outline" size={18} color={colors.tint} />
                      <Text style={[eventStyles.goingButtonText, { color: colors.tint }]}>Going</Text>
                    </>
                  )}
                </TouchableOpacity>
                <View style={[eventStyles.pill, { backgroundColor: colors.tint + '22' }]}>
                  <Text style={[eventStyles.pillText, { color: colors.tint }]}>{ev.venueType}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const eventStyles = StyleSheet.create({
  subtitle: {
    fontSize: 15,
    marginTop: 4,
    marginBottom: 16,
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
  friendsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  friendsLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  friendCountBadge: {
    marginLeft: 8,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  friendCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  goingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 12,
    gap: 8,
  },
  goingButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  goingButtonTextActive: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
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
