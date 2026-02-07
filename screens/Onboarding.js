// import React from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   Platform,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons } from '@expo/vector-icons';
// import { useColorScheme } from '../hooks/use-color-scheme';
// import { Colors } from '../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Onboarding({ navigation }) {
    const [step, setStep] = useState(0);
    const [name, setName] = useState('');
    const [instagram, setInstagram] = useState('');
    const [genre, setGenre] = useState('');
    const [artist, setArtist] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (step === 4) {
            setLoading(true);
            const timer = setTimeout(() => {
                setLoading(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [step]);

    const vinyl = <MaterialCommunityIcons name="record-vinyl" size={28} color="#2b1a0f" />;

    if (step === 4) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Thank you.</Text>
                <Text style={styles.subtitle}>Making your profile…</Text>
                {loading && <ActivityIndicator size="large" color="#8b4513" />}
            </View>
        );
    }


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome new user…</Text>

            {step >= 0 && (
                <View style={styles.questionRow}>
                    {vinyl}
                    <View style={styles.inputBlock}>
                        <Text style={styles.label}>Enter your first and last name</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            onSubmitEditing={() => name.trim() && setStep(1)}
                            returnKeyType="next"
                        />
                    </View>
                </View>
            )}

            {step >= 1 && (
                <View style={styles.questionRow}>
                    {vinyl}
                    <View style={styles.inputBlock}>
                        <Text style={styles.label}>Enter your Instagram (optional)</Text>
                        <TextInput
                            style={styles.input}
                            value={instagram}
                            onChangeText={setInstagram}
                            onSubmitEditing={() => setStep(2)}
                            returnKeyType="next"
                        />
                    </View>
                </View>
            )}

            {step >= 2 && (
                <View style={styles.questionRow}>
                    {vinyl}
                    <View style={styles.inputBlock}>
                        <Text style={styles.label}>Enter your favorite genre of music</Text>
                        <View style={styles.dropdown}>
                            <Picker
                                selectedValue={genre}
                                onValueChange={(itemValue) => {
                                    setGenre(itemValue);
                                    if (itemValue) setStep(3);
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

            {step >= 3 && (
                <View style={styles.questionRow}>
                    {vinyl}
                    <View style={styles.inputBlock}>
                        <Text style={styles.label}>Enter your favorite artists</Text>
                        <View style={styles.dropdown}>
                            <Picker
                                selectedValue={artist}
                                onValueChange={(itemValue) => {
                                    setArtist(itemValue);
                                    if (itemValue) setStep(4);
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

            {step < 3 && name.trim() && (
                <TouchableOpacity style={styles.nextButton} onPress={() => setStep(step + 1)}>
                    <Text style={styles.nextText}>Next</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity
                style={styles.loginLink}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.7}
            >
                <Text style={{ color: colors.tint, fontSize: 15 }}>Already have an account? Log in</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6ecd9',
        padding: 24,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 24,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 16,
    },
    questionRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    inputBlock: {
        flex: 1,
        marginLeft: 12,
    },
    label: {
        fontSize: 14,
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#8b4513',
        color: 'white',
        padding: 10,
        borderRadius: 6,
    },
    dropdown: {
        backgroundColor: '#8b4513',
        borderRadius: 6,
    },
    nextButton: {
        marginTop: 20,
        backgroundColor: '#2b1a0f',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    nextText: {
        color: 'white',
        fontWeight: '600',
    },
});
