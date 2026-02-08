import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/theme';
import { useConfirmedEvents } from '../contexts/ConfirmedEventsContext';
import { useColorScheme } from '../hooks/use-color-scheme';
import { discoverStyles, DiscoverColors } from '../styles/styles';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { eventRowToUI } from '../lib/eventUtils';

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
  const { session, profile } = useAuth();
  const userId = session?.user?.id;
  const isArtist = profile?.user_type === 'artist';
  const { isConfirmed, toggleEvent } = useConfirmedEvents();
  const [searchText, setSearchText] = useState('');
  const [eventsRaw, setEventsRaw] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createLocation, setCreateLocation] = useState('');
  const [createVenueType, setCreateVenueType] = useState('venue');
  const [createDate, setCreateDate] = useState('');
  const [createTime, setCreateTime] = useState('');
  const [createSubmitting, setCreateSubmitting] = useState(false);

  const loadEvents = useCallback(async () => {
    setEventsLoading(true);
    try {
      const { data: eventsData, error: evError } = await supabase
        .from('events')
        .select('*')
        .order('date_time', { ascending: true });

      if (evError) throw evError;
      const eventList = eventsData || [];

      let myFollowingIds = [];
      let profileMap = {};
      if (userId) {
        const { data: followsData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', userId);
        myFollowingIds = (followsData || []).map((f) => f.following_id);
        if (myFollowingIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, name')
            .in('id', myFollowingIds);
          (profilesData || []).forEach((p) => (profileMap[p.id] = p.name));
        }
      }

      const { data: attendanceData } = await supabase
        .from('event_attendance')
        .select('event_id, user_id')
        .eq('status', 'going')
        .in('event_id', eventList.map((e) => e.id));

      const attendanceByEvent = {};
      (attendanceData || []).forEach((a) => {
        if (!attendanceByEvent[a.event_id]) attendanceByEvent[a.event_id] = [];
        attendanceByEvent[a.event_id].push(a.user_id);
      });

      const withFriends = eventList.map((row) => {
        const goingIds = attendanceByEvent[row.id] || [];
        const friendsGoing = goingIds
          .filter((id) => myFollowingIds.includes(id))
          .map((id) => profileMap[id])
          .filter(Boolean);
        return eventRowToUI(row, friendsGoing);
      });
      const sorted = [...withFriends].sort((a, b) => b.friendsGoing.length - a.friendsGoing.length);
      setEventsRaw(sorted);
    } catch (e) {
      console.warn('Events load:', e);
      setEventsRaw([]);
    } finally {
      setEventsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const events = useMemo(() => {
    if (!searchText.trim()) return eventsRaw;
    const q = searchText.toLowerCase().trim();
    return eventsRaw.filter(
      (ev) =>
        ev.title.toLowerCase().includes(q) ||
        ev.location.toLowerCase().includes(q) ||
        (ev.venueType && ev.venueType.toLowerCase().includes(q))
    );
  }, [eventsRaw, searchText]);

  const handleCreateEvent = async () => {
    if (!createTitle.trim() || !createLocation.trim() || !createDate.trim() || !createTime.trim()) {
      Alert.alert('Missing fields', 'Title, location, date, and time are required.');
      return;
    }
    const [y, m, d] = createDate.split('-').map(Number);
    const timeMatch = createTime.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i) || createTime.match(/^(\d{1,2}):(\d{2})$/);
    let hour = 20;
    let minute = 0;
    if (timeMatch) {
      hour = parseInt(timeMatch[1], 10);
      minute = parseInt(timeMatch[2], 10);
      if (timeMatch[3] && timeMatch[3].toLowerCase() === 'pm' && hour < 12) hour += 12;
      if (timeMatch[3] && timeMatch[3].toLowerCase() === 'am' && hour === 12) hour = 0;
    }
    const dateTime = new Date(y, (m || 1) - 1, d || 1, hour, minute);
    if (isNaN(dateTime.getTime())) {
      Alert.alert('Invalid date or time', 'Use date YYYY-MM-DD and time like 8:00 PM or 20:00');
      return;
    }
    setCreateSubmitting(true);
    try {
      const { error } = await supabase.from('events').insert({
        title: createTitle.trim(),
        description: createDescription.trim() || null,
        location: createLocation.trim(),
        venue_type: createVenueType || null,
        date_time: dateTime.toISOString(),
        created_by: userId,
        artist_ids: [],
      });
      if (error) throw error;
      setCreateModalVisible(false);
      setCreateTitle('');
      setCreateDescription('');
      setCreateLocation('');
      setCreateVenueType('venue');
      setCreateDate('');
      setCreateTime('');
      loadEvents();
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not create event.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={discoverStyles.container} edges={['top']}>
      <View style={eventStyles.titleWrap}>
        <Text style={discoverStyles.title}>Discover Events</Text>
        {isArtist && (
          <TouchableOpacity
            style={[eventStyles.plusButton, { backgroundColor: colors.tint }]}
            onPress={() => setCreateModalVisible(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={26} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
      <View style={discoverStyles.searchWrap}>
        <TextInput
          style={discoverStyles.searchInput}
          placeholder="Search events..."
          placeholderTextColor={DiscoverColors.white}
          value={searchText}
          onChangeText={setSearchText}
        />
        <Ionicons name="search" size={22} color={DiscoverColors.white} style={discoverStyles.searchIcon} />
      </View>
      <ScrollView
        style={discoverStyles.list}
        contentContainerStyle={discoverStyles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {eventsLoading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
        events.map((ev) => {
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
        })
        )}
      </ScrollView>

      <Modal visible={createModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={eventStyles.modalOverlay}>
          <View style={[eventStyles.modalContent, { backgroundColor: colors.background }]}>
            <View style={eventStyles.modalHeader}>
              <Text style={[eventStyles.modalTitle, { color: colors.text }]}>Create event</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)} hitSlop={12}>
                <Ionicons name="close" size={28} color={colors.icon} />
              </TouchableOpacity>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={eventStyles.modalScroll}>
              <Text style={[eventStyles.modalLabel, { color: colors.icon }]}>Title *</Text>
              <TextInput
                style={[eventStyles.modalInput, { color: colors.text, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}
                value={createTitle}
                onChangeText={setCreateTitle}
                placeholder="Event name"
                placeholderTextColor={colors.icon}
              />
              <Text style={[eventStyles.modalLabel, { color: colors.icon }]}>Description</Text>
              <TextInput
                style={[eventStyles.modalInput, eventStyles.modalInputArea, { color: colors.text, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}
                value={createDescription}
                onChangeText={setCreateDescription}
                placeholder="Optional"
                placeholderTextColor={colors.icon}
                multiline
              />
              <Text style={[eventStyles.modalLabel, { color: colors.icon }]}>Location *</Text>
              <TextInput
                style={[eventStyles.modalInput, { color: colors.text, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}
                value={createLocation}
                onChangeText={setCreateLocation}
                placeholder="Address or venue"
                placeholderTextColor={colors.icon}
              />
              <Text style={[eventStyles.modalLabel, { color: colors.icon }]}>Venue type</Text>
              <TextInput
                style={[eventStyles.modalInput, { color: colors.text, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}
                value={createVenueType}
                onChangeText={setCreateVenueType}
                placeholder="e.g. venue, house party, pop-up"
                placeholderTextColor={colors.icon}
              />
              <Text style={[eventStyles.modalLabel, { color: colors.icon }]}>Date * (YYYY-MM-DD)</Text>
              <TextInput
                style={[eventStyles.modalInput, { color: colors.text, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}
                value={createDate}
                onChangeText={setCreateDate}
                placeholder="2026-03-15"
                placeholderTextColor={colors.icon}
              />
              <Text style={[eventStyles.modalLabel, { color: colors.icon }]}>Time * (e.g. 8:00 PM or 20:00)</Text>
              <TextInput
                style={[eventStyles.modalInput, { color: colors.text, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}
                value={createTime}
                onChangeText={setCreateTime}
                placeholder="8:00 PM"
                placeholderTextColor={colors.icon}
              />
              <TouchableOpacity
                style={[eventStyles.createSubmitButton, { backgroundColor: colors.tint }]}
                onPress={handleCreateEvent}
                disabled={createSubmitting}
              >
                {createSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={eventStyles.createSubmitText}>Create event</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const eventStyles = StyleSheet.create({
  titleWrap: {
    marginBottom: 0,
  },
  plusButton: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalScroll: {
    paddingBottom: 24,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  modalInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  modalInputArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  createSubmitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  createSubmitText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
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
    alignSelf: 'stretch',
    flexWrap: 'wrap',
  },
  friendsLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
    flexShrink: 1,
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
