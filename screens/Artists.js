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
import discoverStyles, { DiscoverColors } from '../styles/discoverStyles';

export default function Artists({ navigation }) {
    const [artists, setArtists] = useState([]);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        const fetchArtists = async () => {

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_type', 'artist');

            if (error) {
                console.log('Error fetching artists:', error);
            } else {
                setArtists(data || []);
            }

        };

        fetchArtists();
    }, []);

    const renderArtist = ({ item }) => (
        <View style={artistStyles.card}>
            <Image source={vinyl} style={artistStyles.vinyl} />
            <Text style={artistStyles.artistName}>{item.name}</Text>
        </View>
    );

    const filteredArtists = artists.filter(artist => artist.name.toLowerCase().includes(searchText.toLowerCase()));

    return (
        <View style={discoverStyles.container}>
            <Text style={discoverStyles.title}>Discover Artists</Text>
            <View style={discoverStyles.searchWrap}>
                <TextInput
                    style={discoverStyles.searchInput}
                    placeholder="Search artists..."
                    value={searchText}
                    onChangeText={setSearchText}
                />
            </View>
            <View style={artistStyles.artists}>
                <FlatList
                    data={filteredArtists}
                    keyExtractor={(item) => item.id}
                    renderItem={renderArtist}
                    numColumns={2}
                    columnWrapperStyle={artistStyles.row}
                    contentContainerStyle={{ paddingBottom: 32 }}
                />
            </View>
        </View>
    );
}

const artistStyles = StyleSheet.create({
    row: { justifyContent: 'space-between', marginBottom: 16 },
    card: { flex: 1, alignItems: 'center', marginHorizontal: 4 },
    vinyl: { width: 200, height: 200 },
    artistName: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
    artists: { flex: 1 },
});
