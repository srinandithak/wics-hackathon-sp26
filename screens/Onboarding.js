import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'react-native';

export default function OnboardingScreen({ navigation }) {
    const [step, setStep] = useState(0);
    const [name, setName] = useState('');
    const [instagram, setInstagram] = useState('');
    const [genre, setGenre] = useState('');
    const [artist, setArtist] = useState('');
    const [loading, setLoading] = useState(false);

    // Handle final loading + navigation
    useEffect(() => {
        if (step === 4) {
            setLoading(true);
            const timer = setTimeout(() => {
                setLoading(false);
                navigation.replace('Main');
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [step]);

    const vinylIcon = (
        <Image
            source={require('../assets/vinyl.png')} 
            style={{ width: 26, height: 26 }}
        />
    );

    // Final loading screen
    if (step === 4) {
        return (
            <View style={styles.containerCenter}>
                <Text style={styles.title}>Thank you.</Text>
                <Text style={styles.subtitle}>Making your profile…</Text>
                {loading && <ActivityIndicator size="large" color="#8b4513" />}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <Text style={styles.title}>Welcome new user…</Text>

                {/* Name (required) */}
                {step >= 0 && (
                    <View style={styles.row}>
                        {vinylIcon}
                        <View style={styles.block}>
                            <Text style={styles.label}>Enter your first and last name</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                returnKeyType="next"
                                onSubmitEditing={() => name.trim() && setStep(1)}
                            />
                        </View>
                    </View>
                )}

                {/* Instagram (optional) */}
                {step >= 1 && (
                    <View style={styles.row}>
                        {vinylIcon}
                        <View style={styles.block}>
                            <Text style={styles.label}>Enter your Instagram (optional)</Text>
                            <TextInput
                                style={styles.input}
                                value={instagram}
                                onChangeText={setInstagram}
                                returnKeyType="next"
                                onSubmitEditing={() => setStep(2)}
                            />
                        </View>
                    </View>
                )}

                {/* Genre (required) */}
                {step >= 2 && (
                    <View style={styles.row}>
                        {vinylIcon}
                        <View style={styles.block}>
                            <Text style={styles.label}>Enter your favorite genre of music</Text>
                            <View style={styles.dropdown}>
                                <Picker
                                    selectedValue={genre}
                                    onValueChange={(value) => {
                                        setGenre(value);
                                        if (value) setStep(3);
                                    }}>
                                    <Picker.Item label="Select a genre…" value="" />
                                    <Picker.Item label="Pop" value="Pop" />
                                    <Picker.Item label="Hip Hop" value="Hip Hop" />
                                    <Picker.Item label="R&B" value="R&B" />
                                    <Picker.Item label="Indie" value="Indie" />
                                    <Picker.Item label="Rock" value="Rock" />
                                    <Picker.Item label="Electronic" value="Electronic" />
                                    <Picker.Item label="Jazz" value="Jazz" />
                                </Picker>
                            </View>
                        </View>
                    </View>
                )}

                {/* Artists (required) */}
                {step >= 3 && (
                    <View style={styles.row}>
                        {vinylIcon}
                        <View style={styles.block}>
                            <Text style={styles.label}>Enter your favorite artists</Text>
                            <View style={styles.dropdown}>
                                <Picker
                                    selectedValue={artist}
                                    onValueChange={(value) => {
                                        setArtist(value);
                                        if (value) setStep(4);
                                    }}>
                                    <Picker.Item label="Select an artist…" value="" />
                                    <Picker.Item label="Local UT Artist" value="Local UT Artist" />
                                    <Picker.Item label="Taylor Swift" value="Taylor Swift" />
                                    <Picker.Item label="Drake" value="Drake" />
                                    <Picker.Item label="Frank Ocean" value="Frank Ocean" />
                                    <Picker.Item label="Bad Bunny" value="Bad Bunny" />
                                    <Picker.Item label="Phoebe Bridgers" value="Phoebe Bridgers" />
                                </Picker>
                            </View>
                        </View>
                    </View>
                )}

                {/* Login link */}
                <TouchableOpacity
                    style={styles.loginLink}
                    onPress={() => navigation.navigate('Login')}
                    activeOpacity={0.7}
                >
                    <Text style={styles.loginText}>Already have an account? Log in</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    body: {
        backgroundColor: '#f6ecd9',
    },
    container: {
        flex: 1,
        backgroundColor: '#f6ecd9',
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 120,
    },
    containerCenter: {
        flex: 1,
        backgroundColor: '#f6ecd9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 24,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    block: {
        flex: 1,
        marginLeft: 12,
    },
    label: {
        fontSize: 14,
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#db775b',
        color: 'white',
        padding: 10,
        borderRadius: 6,
    },
    dropdown: {
        backgroundColor: '#db775b',
        borderRadius: 6,
    },
    loginLink: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
    },
    loginText: {
        fontSize: 15,
        textDecorationLine: 'underline',
    },
});
