import { View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { styles } from '../styles/styles';

const BottomNavigation = ({ navigation }) => {
  return (
    <View style={styles.bottomRowContainer}>
      <View style={styles.bottomRow}>
        {/* artists button */}
        <Icon.Button
          color="black"
          backgroundColor="67DE8F"
          name="music"
          size={40}
          onPress={() => navigation.navigate('Main', { screen: 'Artists' })}
        />
  
        {/* friends button */}
        <Icon.Button
          color="black"
          backgroundColor="67DE8F"
          name="users"
          size={40}
          onPress={() => navigation.navigate('Main', { screen: 'Friends' })}
        />
  
        {/* Events page */}
        <Icon.Button
          color="black"
          backgroundColor="67DE8F"
          name="microphone" 
          size={40}
          onPress={() => navigation.navigate('Main', { screen: 'Events' })}
        />

        {/* calendar icon */}
        <Icon.Button
          color="black"
          backgroundColor="67DE8F"
          name="calendar"
          size={40}
          onPress={() => navigation.navigate('Main', { screen: 'Calendar' })}
        />
  
        {/* profile icon */}
        <Icon.Button
          color="black"
          backgroundColor="67DE8F"
          name="user"
          size={40}
          onPress={() => navigation.navigate('Main', { screen: 'Profile' })}
        />
      </View>
    </View>
  );
};

export default BottomNavigation;
