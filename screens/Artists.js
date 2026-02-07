import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    FlatList,
    TextInput
} from 'react-native';
import { supabase } from '../lib/supabase';
import vinyl from '../assets/images/vinyl.png';
// import { styles } from '../styles/styles';

const Colors = {
    white: '#f7efdc',
    orange: '#db775b',
    black: '#000000'
}


export default function Artists({ navigation }) {
    const [artists, setArtists] = useState([]);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        const fetchArtists = async () => {

            const { data, error } = await supabase
                .from('profiles')       // your table name
                .select('*')            // get all columns
                .eq('user_type', 'artist');  // only profiles where type = 'artist'

            if (error) {
                console.log('Error fetching artists:', error);
            } else {
                setArtists(data || []); // store array in state
            }

        };

        fetchArtists();
    }, []);

    // Render each artist
    const renderArtist = ({ item }) => (
        <View style={styles.card}>
            <Image source={vinyl} style={styles.vinyl} />
            <Text style={styles.artistName}>{item.name}</Text>
        </View>
    );

    const filteredArtists = artists.filter(artist => artist.name.toLowerCase().includes(searchText.toLowerCase()));

    return (
        <View style={styles.container}>
            <View style={styles.searchWrap}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search artists..."
                    value={searchText}
                    onChangeText={setSearchText} // updates searchText as user types
                />
            </View>
            <Text style = {styles.title}>Discover Artists</Text>
            <View style={styles.artists}>
                <FlatList
                    data={filteredArtists}
                    keyExtractor={(item) => item.id}
                    renderItem={renderArtist}
                    numColumns={2} // two cards per row
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={{ paddingBottom: 32 }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 70, backgroundColor: Colors.white },
    row: { justifyContent: 'space-between', marginBottom: 16 },
    card: { flex: 1, alignItems: 'center', marginHorizontal: 4 },
    vinyl: { width: 200, height: 200},
    searchWrap: {borderRadius: 75, width: 350, backgroundColor: Colors.orange},
    searchInput: { padding: 15, color: Colors.black, fontsize: 16},
    artistName: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
    title: {fontSize: 50, paddingTop: 20, fontWeight: '600',}
});