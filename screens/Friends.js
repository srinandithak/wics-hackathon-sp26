import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
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

// Dummy data - replace with real data later
const FRIENDS = [
  { id: '1', name: 'Jordan Lee', handle: '@jordanlee', events: [{ id: 'e1', title: 'House Show - West Campus', date: 'Sat, Feb 15 · 8:00 PM', location: '2400 Nueces St' }, { id: 'e2', title: 'Open Mic Night', date: 'Fri, Feb 21 · 7:00 PM', location: 'Cactus Cafe' }] },
  { id: '2', name: 'Sam Chen', handle: '@samchen', events: [{ id: 'e1', title: 'House Show - West Campus', date: 'Sat, Feb 15 · 8:00 PM', location: '2400 Nueces St' }] },
  { id: '3', name: 'Alex Rivera', handle: '@alexr', events: [] },
];

const SUGGESTED = [
  { id: 's1', name: 'Morgan Taylor', handle: '@morgant', hint: 'Similar taste: indie, alternative' },
  { id: 's2', name: 'Casey Kim', handle: '@caseyk', hint: 'Similar taste: pop, R&B' },
  { id: 's3', name: 'Riley Jones', handle: '@rileyj', hint: 'Similar taste: rock, folk' },
];

export default function Friends({ navigation }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const [activeTab, setActiveTab] = useState('friends');
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friends, setFriends] = useState(FRIENDS);
  const [suggested, setSuggested] = useState(SUGGESTED);
  const cardBg = isDark ? 'rgba(255,255,255,0.06)' : '#fff';

  const handleAddFriend = (person) => {
    setSuggested((prev) => prev.filter((p) => p.id !== person.id));
    setFriends((prev) => [...prev, { id: person.id, name: person.name, handle: person.handle, events: [] }]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Text style={[styles.title, { color: colors.text }]}>Friends</Text>
      <Text style={[styles.subtitle, { color: colors.icon }]}>
        Your friends · Suggested profiles with similar tastes
      </Text>

      <View style={[styles.tabRow, { borderBottomColor: colors.icon + '33' }]}>
        <TouchableOpacity
          onPress={() => setActiveTab('friends')}
          style={[styles.tab, activeTab === 'friends' && [styles.tabActive, { borderBottomColor: colors.tint }]]}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, { color: activeTab === 'friends' ? colors.tint : colors.icon }, activeTab === 'friends' && styles.tabTextActive]}>
            Friends
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('suggested')}
          style={[styles.tab, activeTab === 'suggested' && [styles.tabActive, { borderBottomColor: colors.tint }]]}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, { color: activeTab === 'suggested' ? colors.tint : colors.icon }, activeTab === 'suggested' && styles.tabTextActive]}>
            Suggested
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
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
                <Text style={[styles.rowTitle, { color: colors.text }]}>{friend.name}</Text>
                <Text style={[styles.rowMeta, { color: colors.icon }]}>{friend.handle}</Text>
                {friend.events.length > 0 && (
                  <Text style={[styles.rowHint, { color: colors.tint }]}>
                    {friend.events.length} event{friend.events.length !== 1 ? 's' : ''} · Tap to see
                  </Text>
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
                <Text style={[styles.rowTitle, { color: colors.text }]}>{person.name}</Text>
                <Text style={[styles.rowMeta, { color: colors.icon }]}>{person.handle}</Text>
                <Text style={[styles.rowHint, { color: colors.icon }]}>{person.hint}</Text>
              </View>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.tint }]}
                onPress={() => handleAddFriend(person)}
                activeOpacity={0.85}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          ))}

        {activeTab === 'friends' && friends.length === 0 && (
          <Text style={[styles.empty, { color: colors.icon }]}>No friends yet. Check Suggested to add people with similar taste.</Text>
        )}
        {activeTab === 'suggested' && suggested.length === 0 && (
          <Text style={[styles.empty, { color: colors.icon }]}>No more suggestions right now.</Text>
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
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {selectedFriend?.name}'s events
              </Text>
              <TouchableOpacity onPress={() => setSelectedFriend(null)} hitSlop={12}>
                <Ionicons name="close" size={28} color={colors.icon} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
              {selectedFriend?.events?.length ? (
                selectedFriend.events.map((ev) => (
                  <View key={ev.id} style={[styles.eventRow, { borderColor: colors.icon + '33' }]}>
                    <Text style={[styles.eventTitle, { color: colors.text }]}>{ev.title}</Text>
                    <Text style={[styles.eventMeta, { color: colors.icon }]}>{ev.date}</Text>
                    <Text style={[styles.eventLocation, { color: colors.icon }]}>{ev.location}</Text>
                  </View>
                ))
              ) : (
                <Text style={[styles.empty, { color: colors.icon }]}>
                  {selectedFriend?.name} isn't going to any events yet.
                </Text>
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
