import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BottomNavigation = ({ navigation }) => {
  return (
    <View style={styles.bottomRowContainer}>
      <View style={styles.bottomRow}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Main', { screen: 'Artists' })}
          style={styles.tabButton}
        >
          <Ionicons name="musical-notes" size={28} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Main', { screen: 'Friends' })}
          style={styles.tabButton}
        >
          <Ionicons name="people" size={28} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Main', { screen: 'Events' })}
          style={styles.tabButton}
        >
          <Ionicons name="location" size={28} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Main', { screen: 'Calendar' })}
          style={styles.tabButton}
        >
          <Ionicons name="calendar" size={28} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Main', { screen: 'Profile' })}
          style={styles.tabButton}
        >
          <Ionicons name="person" size={28} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomRowContainer: {
    backgroundColor: '#db775b',
    paddingVertical: 8,
    paddingBottom: 24,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    padding: 8,
  },
});

export default BottomNavigation;
