import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '../hooks/use-color-scheme';
import { Colors } from '../constants/theme';
import { useApp } from '../contexts/AppContext';
import { discoverStyles } from '../styles/styles';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ThemedText } from '@/components/themed-text';

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

function formatEventDate(dateTime) {
  const d = new Date(dateTime);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const h = d.getHours() % 12 || 12;
  const m = d.getMinutes();
  const ampm = d.getHours() >= 12 ? 'PM' : 'AM';
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()} · ${h}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export default function Friends({ navigation }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const { currentFontSizes } = useApp();
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [activeTab, setActiveTab] = useState('friends');
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friends, setFriends] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [loading, setLoading] = useState(true);
  const cardBg = isDark ? 'rgba(255,255,255,0.06)' : '#fff';

  const loadFriendsAndSuggested = useCallback(async () => {
    if (!userId) {
      setFriends([]);
      setSuggested([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: followsData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);
      const followingIds = (followsData || []).map((f) => f.following_id);

      if (followingIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, name, instagram_handle')
          .in('id', followingIds);
        const { data: attData } = await supabase
          .from('event_attendance')
          .select('event_id, user_id')
          .eq('status', 'going')
          .in('user_id', followingIds);
        const eventIdsByUser = {};
        (attData || []).forEach((a) => {
          if (!eventIdsByUser[a.user_id]) eventIdsByUser[a.user_id] = [];
          eventIdsByUser[a.user_id].push(a.event_id);
        });
        const allEventIds = [...new Set((attData || []).map((a) => a.event_id))];
        let eventsMap = {};
        if (allEventIds.length > 0) {
          const { data: evData } = await supabase.from('events').select('id, title, date_time, location').in('id', allEventIds);
          (evData || []).forEach((e) => (eventsMap[e.id] = e));
        }
        const friendList = (profilesData || []).map((p) => {
          const evIds = eventIdsByUser[p.id] || [];
          const events = evIds.map((eid) => {
            const e = eventsMap[eid];
            return e ? { id: e.id, title: e.title, date: formatEventDate(e.date_time), location: e.location } : null;
          }).filter(Boolean);
          return {
            id: p.id,
            name: p.name || 'User',
            handle: p.instagram_handle ? `@${p.instagram_handle.replace(/^@/, '')}` : '@user',
            events,
          };
        });
        setFriends(friendList);
      } else {
        setFriends([]);
      }

      const { data: allProfiles } = await supabase.from('profiles').select('id, name, instagram_handle, genres');
      const suggestedIds = (allProfiles || [])
        .filter((p) => p.id !== userId && !followingIds.includes(p.id))
        .slice(0, 20)
        .map((p) => p.id);
      if (suggestedIds.length > 0) {
        const { data: sugProfiles } = await supabase
          .from('profiles')
          .select('id, name, instagram_handle, genres')
          .in('id', suggestedIds);
        const sugList = (sugProfiles || []).map((p) => ({
          id: p.id,
          name: p.name || 'User',
          handle: p.instagram_handle ? `@${p.instagram_handle.replace(/^@/, '')}` : '@user',
          hint: (p.genres && p.genres.length) ? `Genres: ${p.genres.join(', ')}` : 'Suggested for you',
        }));
        setSuggested(sugList);
      } else {
        setSuggested([]);
      }
    } catch (e) {
      console.warn('Friends load:', e);
      setFriends([]);
      setSuggested([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadFriendsAndSuggested();
  }, [loadFriendsAndSuggested]);

  const handleAddFriend = async (person) => {
    if (!userId) return;
    const { error } = await supabase.from('follows').insert({ follower_id: userId, following_id: person.id });
    if (!error) await loadFriendsAndSuggested();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ThemedText style={[discoverStyles.title, { color: colors.text, marginBottom: 16, fontSize: currentFontSizes.hero }]}>Friends</ThemedText>

      <View style={[styles.tabRow, { borderBottomColor: colors.icon + '33' }]}>
        <TouchableOpacity
          onPress={() => setActiveTab('friends')}
          style={[styles.tab, activeTab === 'friends' && [styles.tabActive, { borderBottomColor: colors.tint }]]}
          activeOpacity={0.7}
        >
          <ThemedText style={[styles.tabText, { color: activeTab === 'friends' ? colors.tint : colors.icon, fontSize: currentFontSizes.base }, activeTab === 'friends' && styles.tabTextActive]}>
            Friends
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('suggested')}
          style={[styles.tab, activeTab === 'suggested' && [styles.tabActive, { borderBottomColor: colors.tint }]]}
          activeOpacity={0.7}
        >
          <ThemedText style={[styles.tabText, { color: activeTab === 'suggested' ? colors.tint : colors.icon, fontSize: currentFontSizes.base }, activeTab === 'suggested' && styles.tabTextActive]}>
            Suggested
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
        <>
        {activeTab === 'friends' &&
          friends.map((friend) => (
            <TouchableOpacity
              key={friend.id}
              style={[styles.row, { backgroundColor: cardBg }, cardShadow]}
              onPress={() => setSelectedFriend(friend)}
              activeOpacity={0.8}
            >
              <View style={[styles.avatar, { backgroundColor: colors.tint }]} />
              <View style={styles.rowBody}>
                <ThemedText style={[styles.rowTitle, { color: colors.text, fontSize: currentFontSizes.subtitle }]}>{friend.name}</ThemedText>
                <ThemedText style={[styles.rowMeta, { color: colors.icon, fontSize: currentFontSizes.caption }]}>{friend.handle}</ThemedText>
                {friend.events.length > 0 && (
                  <ThemedText style={[styles.rowHint, { color: colors.tint, fontSize: currentFontSizes.caption }]}>
                    {friend.events.length} event{friend.events.length !== 1 ? 's' : ''} · Tap to see
                  </ThemedText>
                )}
              </View>
              <Ionicons name="chevron-forward" size={22} color={colors.icon} />
            </TouchableOpacity>
          ))}

        {activeTab === 'suggested' &&
          suggested.map((person) => (
            <View key={person.id} style={[styles.row, { backgroundColor: cardBg }, cardShadow]}>
              <View style={[styles.avatar, { backgroundColor: colors.tint }]} />
              <View style={styles.rowBody}>
                <ThemedText style={[styles.rowTitle, { color: colors.text, fontSize: currentFontSizes.subtitle }]}>{person.name}</ThemedText>
                <ThemedText style={[styles.rowMeta, { color: colors.icon, fontSize: currentFontSizes.caption }]}>{person.handle}</ThemedText>
                <ThemedText style={[styles.rowHint, { color: colors.icon, fontSize: currentFontSizes.caption }]}>{person.hint}</ThemedText>
              </View>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.tint }]}
                onPress={() => handleAddFriend(person)}
                activeOpacity={0.85}
              >
                <ThemedText style={[styles.addButtonText, { fontSize: currentFontSizes.base }]}>Add</ThemedText>
              </TouchableOpacity>
            </View>
          ))}

        {activeTab === 'friends' && friends.length === 0 && (
          <ThemedText style={[styles.empty, { color: colors.icon, fontSize: currentFontSizes.base }]}>No friends yet. Check Suggested to add people with similar taste.</ThemedText>
        )}
        {activeTab === 'suggested' && suggested.length === 0 && (
          <ThemedText style={[styles.empty, { color: colors.icon, fontSize: currentFontSizes.base }]}>No more suggestions right now.</ThemedText>
        )}
        </>
        )}
      </ScrollView>

      {/* Modal: friend's events */}
      <Modal
        visible={!!selectedFriend}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedFriend(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedFriend(null)}>
          <Pressable style={[styles.modalContent, { backgroundColor: colors.background }]} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalHandle, { backgroundColor: colors.icon }]} />
            <TouchableOpacity
              onPress={() => setSelectedFriend(null)}
              style={styles.modalCloseBtn}
              hitSlop={12}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={28} color={colors.icon} />
            </TouchableOpacity>

            <View style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, { color: colors.text, fontSize: currentFontSizes.large }]}>
                {selectedFriend?.name}'s events
              </ThemedText>
            </View>
            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
              {selectedFriend?.events?.length ? (
                selectedFriend.events.map((ev) => (
                  <View key={ev.id} style={[styles.eventRow, { borderColor: colors.icon + '33' }]}>
                    <ThemedText style={[styles.eventTitle, { color: colors.text, fontSize: currentFontSizes.base }]}>{ev.title}</ThemedText>
                    <ThemedText style={[styles.eventMeta, { color: colors.icon, fontSize: currentFontSizes.caption }]}>{ev.date}</ThemedText>
                    <ThemedText style={[styles.eventLocation, { color: colors.icon, fontSize: currentFontSizes.caption }]}>{ev.location}</ThemedText>
                  </View>
                ))
              ) : (
                <ThemedText style={[styles.empty, { color: colors.icon, fontSize: currentFontSizes.base }]}>
                  {selectedFriend?.name} isn't going to any events yet.
                </ThemedText>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
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
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginRight: 24,
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
  rowHint: {
    fontSize: 13,
    marginTop: 4,
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  empty: {
    fontSize: 15,
    marginTop: 20,
    textAlign: 'center',
    fontStyle: 'italic',
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
    paddingTop: 44,
    paddingBottom: 32,
    maxHeight: '70%',
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 6,
    zIndex: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalScroll: {
    maxHeight: 320,
  },
  modalScrollContent: {
    paddingBottom: 24,
  },
  eventRow: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  eventMeta: {
    fontSize: 14,
    marginTop: 4,
  },
  eventLocation: {
    fontSize: 13,
    marginTop: 2,
    opacity: 0.9,
  },
});
