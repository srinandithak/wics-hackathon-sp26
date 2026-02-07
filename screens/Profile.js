import React from 'react';
import { Text, TextInput, View } from 'react-native';
// import { styles } from '../styles/styles';

const Profile = ({ navigation }) => {

    return (
        <View>
            <View>
                <Text>Music App - Profile Page</Text>
                {/* <Text style={styles.write}>Post</Text>
                <Icon.Button
                    name="pencil"
                    color="black"
                    size={40}
                    backgroundColor="#f2f2f2"
                    style={{ borderWidth: 2, marginLeft: 10 }}
                    onPress={() => navigation.navigate('Post')}
                /> */}
            </View>

            <View>
              <TextInput placeholder="Search" />
            </View>

        </View>
    );
};

export default Profile;

